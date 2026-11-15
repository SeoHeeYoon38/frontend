import type { ReactNode } from "react";
import { PlaceThumbnail } from "../common/PlacePhoto";

interface TimelineVisit {
  id: string;
  name?: string;
  photoPlaceId?: string;
  address?: string | null;
  timing?: string;
  connection?: ReactNode;
}

export default function TripTimeline({ day, visits, onOpenPlace }: {
  day: number;
  visits: TimelineVisit[];
  onOpenPlace?: (placeId: string, name: string) => void;
}) {
  if (!visits.length) return <p>이날 일정에 담긴 장소가 없어요.</p>;
  return (
    <ol className="server-course-timeline" aria-label={`${day}일차 장소 타임라인`}>
      {visits.map(({ id, name = "장소 정보 없음", photoPlaceId, address, timing, connection }) => (
        <li key={id}>
          {photoPlaceId && onOpenPlace ? (
            <button className="server-course-timeline__place" type="button" onClick={() => onOpenPlace(photoPlaceId, name)}>
              <PlaceThumbnail placeId={photoPlaceId} name={name} />
              <strong>{name}</strong>
            </button>
          ) : <strong>{name}</strong>}
          {address && <small>{address}</small>}
          {timing && <p>{timing}</p>}
          {connection}
        </li>
      ))}
    </ol>
  );
}
