import backIcon from "../../assets/figma/map-back.svg";
import type { TravelerCoursePlace, TravelerCourseView } from "../../types/course";
import * as S from "./TravelerCourseOverlay.styled";
import { PlaceThumbnail } from "../common/PlacePhoto";
import CourseRouteMap from "../course-completion/CourseRouteMap";

interface TravelerCourseMapProps {
  course: TravelerCourseView;
  photoCourseId?: number;
  activeDay?: number;
  onBack: () => void;
  onDayChange: (day?: number) => void;
  onOpenPlace: (placeId: string) => void;
}

const pinPositions = [
  { x: 80, y: 35 },
  { x: 60, y: 27 },
  { x: 47, y: 20 },
  { x: 22, y: 8 },
];

function straightLineMeters(from: TravelerCoursePlace, to: TravelerCoursePlace) {
  const { latitude: lat1, longitude: lon1 } = from;
  const { latitude: lat2, longitude: lon2 } = to;
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null ||
    ![lat1, lon1, lat2, lon2].every(Number.isFinite)) return undefined;

  const radians = Math.PI / 180;
  const haversine = Math.sin((lat2 - lat1) * radians / 2) ** 2 +
    Math.cos(lat1 * radians) * Math.cos(lat2 * radians) *
    Math.sin((lon2 - lon1) * radians / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

function TravelerCourseMap({ course, photoCourseId, activeDay, onBack, onDayChange, onOpenPlace }: TravelerCourseMapProps) {
  const groups = course.days.flatMap((day, index) => activeDay === undefined || activeDay === index ? [day] : []);
  const rows = groups.flatMap(({ label, places }) => places.map((place, index) => ({
    place,
    order: index + 1,
    group: label,
  })));
  const mapPlaces = rows.flatMap(({ place, order, group }) =>
    Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
      ? [{ ...place, id: JSON.stringify([group, order]), order, group }]
      : [],
  );
  const placeIdsByPin = new Map(rows.map(({ place, order, group }) => [JSON.stringify([group, order]), place.id]));
  const samplePlaces = activeDay === undefined || activeDay === 0 ? course.days[0]?.places ?? [] : [];
  const distancesByDay = groups.map(({ places }) =>
    places.slice(1).map((place, index) => straightLineMeters(places[index], place)),
  );
  const distances = distancesByDay.flat();
  const total = distances.length && distances.every((distance) => distance !== undefined)
    ? distances.reduce((sum, distance) => sum + distance, 0)
    : undefined;

  return (
    <S.MapScreen>
      <S.MapHeader>
        <div><button type="button" aria-label="코스 상세로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button><h1>{course.city} {course.duration}</h1><span /></div>
        <S.MapTabs aria-label="지도 일차 선택">
          <button type="button" aria-pressed={activeDay === undefined} onClick={() => onDayChange()}>전체</button>
          {course.days.map((item, index) => (
            <button key={item.label} type="button" aria-pressed={activeDay === index} onClick={() => onDayChange(index)}>{item.label}</button>
          ))}
        </S.MapTabs>
      </S.MapHeader>
      <S.MapCanvas>
        {photoCourseId ? (
          mapPlaces.length ? (
            <CourseRouteMap places={mapPlaces} city={course.city} day={activeDay === undefined ? undefined : activeDay + 1} schematic onSelect={(pinId) => {
              const placeId = placeIdsByPin.get(String(pinId));
              if (placeId) onOpenPlace(placeId);
            }} />
          ) : <p role="status">지도에 표시할 장소 좌표가 없어요.</p>
        ) : (
          <>
            <img src={course.mapFull} alt={`${course.city} 샘플 지도`} />
            {pinPositions.slice(0, samplePlaces.length).map((pin, index) => (
              <S.MapPin key={index} type="button" $x={pin.x} $y={pin.y} onClick={() => onOpenPlace(samplePlaces[index].id)} aria-label={`${samplePlaces[index].name} 열기`}>
                {index + 1}
              </S.MapPin>
            ))}
          </>
        )}
      </S.MapCanvas>
      <S.DaySheet>
        <h2>{activeDay === undefined ? "전체" : groups[0]?.label}</h2>
        <p>장소 {rows.length}곳{photoCourseId && total !== undefined && ` · 직선거리 합계 ${formatDistance(total)}`}</p>
        {groups.map(({ label, places }, groupIndex) => (
          <section key={label} aria-label={label}>
            {activeDay === undefined && <h3>{label}</h3>}
            {places.map((place, index) => {
              const distance = distancesByDay[groupIndex][index];
              const travel = photoCourseId
                ? distance === undefined ? "거리 정보 없음" : `직선거리 ${formatDistance(distance)}`
                : [place.travelTime, place.distance].filter(Boolean).join(" · ");
              return (
              <div key={`${place.id}-${index}`}>
                <S.MapPlaceRow type="button" onClick={() => onOpenPlace(place.id)}>
                  <b>{index + 1}</b>
                  {photoCourseId ? <PlaceThumbnail courseId={photoCourseId} placeId={place.id} name={place.name} /> : <img src={place.image} alt="" />}
                  <span><strong>{place.name}</strong><small>{place.category}</small></span>
                </S.MapPlaceRow>
                {index < places.length - 1 && travel && <S.MapTravel>{travel}</S.MapTravel>}
              </div>
              );
            })}
          </section>
        ))}
      </S.DaySheet>
    </S.MapScreen>
  );
}

export default TravelerCourseMap;

