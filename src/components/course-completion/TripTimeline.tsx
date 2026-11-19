import type { ReactNode } from "react";
import { PlaceThumbnail } from "../common/PlacePhoto";
import dragHandleIcon from "../../assets/course-completion/drag-handle.svg";
import removeIcon from "../../assets/course-completion/remove.svg";
import foodIcon from "../../assets/course-completion/category-food.svg";
import cafeIcon from "../../assets/course-completion/category-cafe.svg";
import sightIcon from "../../assets/icons/category-sightseeing-small.svg";
import shoppingIcon from "../../assets/icons/category-shopping.svg";
import placeIcon from "../../assets/course-completion/icon-pin.svg";
import likeIcon from "../../assets/course-community/like.svg";
import commentIcon from "../../assets/course-community/comment.svg";

interface TimelineVisit {
  id: string;
  name?: string;
  photoPlaceId?: string;
  address?: string | null;
  timing?: string;
  category?: string;
  added?: boolean;
  connection?: ReactNode;
  reactions?: { likeCount: number; commentCount: number };
}

const categoryIcons: Record<string, string> = {
  맛집: foodIcon,
  카페: cafeIcon,
  쇼핑: shoppingIcon,
  명소: sightIcon,
};

export default function TripTimeline({ day, visits, onOpenPlace, onEdit, shared = false }: {
  day: number;
  visits: TimelineVisit[];
  onOpenPlace?: (itemId: string, placeId: string, name: string) => void;
  onEdit?: () => void;
  shared?: boolean;
}) {
  if (!visits.length) return <p>이날 일정에 담긴 장소가 없어요.</p>;
  return (
    <div className="place-timeline" aria-label={`${day}일차 장소 타임라인`}>
      {visits.map(({ id, name = "장소 정보 없음", photoPlaceId, address, timing, category = "장소", added, connection, reactions }, index) => (
        <div className="place-stop" key={id}>
          <div className="place-stop__rail" aria-hidden="true">
            <span className="place-stop__rail-before" />
            <span className="place-stop__order">{index + 1}</span>
            <span className={`place-stop__rail-after ${index === visits.length - 1 ? "is-last" : ""}`} />
          </div>
          <div className="place-stop__content">
            <article
              className="place-card"
              role={photoPlaceId && onOpenPlace ? "button" : undefined}
              tabIndex={photoPlaceId && onOpenPlace ? 0 : undefined}
              onClick={() => photoPlaceId && onOpenPlace?.(id, photoPlaceId, name)}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && photoPlaceId && onOpenPlace && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onOpenPlace(id, photoPlaceId, name);
                }
              }}
            >
              <img className="place-card__handle" src={dragHandleIcon} alt="" />
              <div className="server-place-thumbnail">
                {photoPlaceId && <PlaceThumbnail placeId={photoPlaceId} name={name} />}
              </div>
              <div className="place-card__copy">
                {added && <span className="place-card__added">새로 추가</span>}
                <strong>{name}</strong>
                <div className="place-card__meta">
                  <img src={categoryIcons[category] ?? placeIcon} alt="" />
                  <b>{category}</b>
                  {(timing || address) && <span className="place-card__divider" />}
                  <span>{timing || address}</span>
                </div>
                {shared && reactions && (
                  <div className="place-card__reactions" aria-label="동행자 반응">
                    <span><img src={likeIcon} alt="좋아요" />{reactions.likeCount}</span>
                    <span><img src={commentIcon} alt="댓글" />{reactions.commentCount}</span>
                  </div>
                )}
              </div>
              {onEdit && <button className="place-card__remove" type="button" aria-label={`${name} 일정 편집`} onClick={(event) => { event.stopPropagation(); onEdit(); }}><img src={removeIcon} alt="" /></button>}
            </article>
            {connection}
          </div>
        </div>
      ))}
    </div>
  );
}
