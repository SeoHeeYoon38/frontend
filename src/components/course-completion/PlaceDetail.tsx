import { useState } from "react";
import placeDetailActions from "../../assets/course-completion/place-detail-actions.svg";
import placeDetailBack from "../../assets/course-completion/place-detail-back.svg";
import placeDetailMap from "../../assets/course-completion/place-detail-map.png";
import placeDetailPhoto from "../../assets/course-completion/place-detail-photo.png";
import mapIcon from "../../assets/figma/traveler-pin.svg";
import infoIcon from "../../assets/course-completion/place-detail-info.svg";
import chevronIcon from "../../assets/course-completion/place-detail-chevron.svg";
import CompanionOpinions from "../course-community/CompanionOpinions";
import ServerCompanionOpinions from "../course-community/ServerCompanionOpinions";
import { PlaceGallery } from "../common/PlacePhoto";
import type { TripInteractions } from "../../api/interactions";
import type { CoursePlace } from "../../types/courseCompletion";

interface PlaceDetailProps {
  place: CoursePlace;
  onBack: () => void;
  onRemove: () => void;
  server?: {
    tripId: number;
    itemId: string;
    placeId: string;
    interactions?: TripInteractions;
    loadError?: string;
    onRefresh: () => Promise<void>;
    currentUserId?: number;
    onChange: (update: (current: TripInteractions) => TripInteractions) => void;
  };
  removePending?: boolean;
  removeError?: string;
}

function PlaceDetail({ place, onBack, onRemove, server, removePending = false, removeError }: PlaceDetailProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isKuromon = !server && place.name === "구로몬 시장";
  const showMap = () => {
    const query = place.latitude !== undefined && place.longitude !== undefined
      ? `${place.latitude},${place.longitude}`
      : place.name;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="place-detail" aria-label={`${place.name} 상세`}>
      <header className="place-detail__hero">
        {server
          ? <PlaceGallery placeId={server.placeId} name={place.name} />
          : <img src={isKuromon ? placeDetailPhoto : place.image} alt={place.name} />}
        <div className="place-detail__scrim" />
        <div className="place-detail__nav">
          <button type="button" onClick={() => detailsExpanded ? setDetailsExpanded(false) : onBack()} aria-label={detailsExpanded ? "장소 의견으로 돌아가기" : "코스로 돌아가기"}>
            <img src={placeDetailBack} alt="" />
          </button>
          <span />
          <button type="button" aria-label="지도에서 보기" onClick={showMap}><img src={mapIcon} alt="" /></button>
          <button type="button" aria-label="더 보기" onClick={() => setConfirmRemove(true)}>
            <img src={placeDetailActions} alt="" />
          </button>
        </div>
      </header>

      <div className="place-detail__body">
        <div className="place-detail__chips">
          <span>{place.category}</span>
          <span>내가 저장</span>
        </div>
        <h1>{place.name}</h1>
        {isKuromon && <p className="place-detail__english">Kuromon Ichiba Market</p>}
        {isKuromon && <div className="place-detail__rating">
          <strong>★ 4.2</strong>
          <span>리뷰 8,500</span>
          <span>오사카 난바</span>
          <button type="button" onClick={showMap}>지도 보기</button>
        </div>}

        {!detailsExpanded && <button
          className="place-detail__more-info"
          type="button"
          aria-expanded={detailsExpanded}
          onClick={() => setDetailsExpanded(true)}
        >
          <img src={infoIcon} alt="" />
          영업시간, 위치 등 장소 정보 보기
          <img className={detailsExpanded ? "is-expanded" : ""} src={chevronIcon} alt="" />
        </button>}

        {!detailsExpanded && (server
          ? <><ServerCompanionOpinions tripId={server.tripId} itemId={server.itemId}
              interactions={server.interactions} loadError={server.loadError} onRefresh={server.onRefresh}
              currentUserId={server.currentUserId} onChange={server.onChange} /></>
          : <CompanionOpinions placeName={place.name} />)}

        {detailsExpanded && (
          <>
            <section>
              <h2>소개</h2>
              <p>{isKuromon
                ? "190년 넘게 이어진 오사카의 부엌이에요. 해산물 꼬치, 와규 꼬치, 제철 과일을 가게 앞에서 바로 먹을 수 있어요. 지붕이 있는 아케이드라 비가 와도 다니기 좋아요."
                : place.description || place.detail || "장소 정보가 아직 없어요."}</p>
              {isKuromon && <div className="place-detail__tags">
                <span>해산물 꼬치</span>
                <span>길거리 음식</span>
                <span>실내 아케이드</span>
              </div>}
            </section>

            {isKuromon && <section>
              <h2>정보</h2>
              <dl className="place-detail__info">
                <div><dt>영업시간</dt><dd><b>오늘 영업 중</b><br />09:00 - 18:00 <button type="button">요일별 보기</button></dd></div>
                <div><dt>휴무</dt><dd>가게마다 달라요, 일요일 휴무 많음</dd></div>
                <div><dt>주소</dt><dd>1 Chome-15-6 Nippombashi, Chuo Ward <button type="button">복사</button></dd></div>
                <div><dt>가는 법</dt><dd>난바역 도보 6분, 숙소에서 도보 5분 <button type="button">길찾기</button></dd></div>
                <div><dt>전화</dt><dd>+81 6-6631-0007</dd></div>
                <div><dt>예약</dt><dd>예약 없이 방문</dd></div>
              </dl>
            </section>}

            {isKuromon && <section>
              <h2>위치</h2>
              <div className="place-detail__map">
                <img src={placeDetailMap} alt="구로몬 시장 위치 지도" />
                <span>1</span>
              </div>
              <button className="place-detail__map-link" type="button" onClick={showMap}>구글맵에서 열기</button>
            </section>}

            {isKuromon && <section className="place-detail__review">
              <h2>리뷰</h2>
              <b>구글 리뷰 8,500개</b>
              <article>
                <strong>여행자 리뷰 요약</strong>
                <p>오전에 가야 신선하고 덜 붐벼요. 현금만 받는 가게가 많아요.</p>
              </article>
              <article>
                <strong>minji 님</strong>
                <p>참치 꼬치랑 딸기 모찌가 제일 맛있었어요. 한 바퀴 도는 데 40분쯤 걸려요.</p>
              </article>
            </section>}

          </>
        )}
      </div>
      {detailsExpanded && <div className="place-detail__footer">
        <button type="button" className="is-muted" onClick={() => setConfirmRemove(true)}>일정에서 빼기</button>
        <button type="button" onClick={() => setDetailsExpanded(false)}>확인</button>
      </div>}
      {confirmRemove && <div className="place-detail__confirm-layer" role="presentation" onClick={() => setConfirmRemove(false)}>
        <section role="alertdialog" aria-modal="true" aria-labelledby="place-remove-title" onClick={(event) => event.stopPropagation()}>
          <h2 id="place-remove-title">{place.name}을 일정에서 뺄까요?</h2>
          <p>{place.name}은 일정에서 빠지고<br />일행에게도 바로 반영돼요.</p>
          {removeError && <p role="alert">{removeError}</p>}
          <div>
            <button type="button" disabled={removePending} onClick={() => setConfirmRemove(false)}>취소</button>
            <button type="button" disabled={removePending} onClick={onRemove}>{removePending ? "반영 중" : "빼기"}</button>
          </div>
        </section>
      </div>}
    </main>
  );
}

export default PlaceDetail;
