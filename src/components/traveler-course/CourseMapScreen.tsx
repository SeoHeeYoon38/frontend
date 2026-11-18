import { useState } from "react";
import backIcon from "../../assets/figma/map-back.svg";
import walkIcon from "../../assets/figma/traveler-walk.svg";
import * as S from "./TravelerCourseOverlay.styled";
import { PlaceThumbnail } from "../common/PlacePhoto";
import CourseRouteMap, { type RouteMapPlace } from "../course-completion/CourseRouteMap";
import { straightLineMeters } from "../../utils/googleMaps";
import { dateLabel } from "../../utils/trip";

export interface CourseMapStop extends RouteMapPlace {
  category?: string;
  image?: string;
  photoPlaceId?: string;
  travelTime?: string;
  distance?: string;
  distanceMeters?: number;
}

interface CourseMapScreenProps {
  title: string;
  city: string;
  days: { label: string; date?: string; places: CourseMapStop[] }[];
  tripId?: number;
  photoCourseId?: number;
  sampleMap?: string;
  activeDay?: number;
  onBack: () => void;
  onDayChange: (day?: number) => void;
  onOpenPlace: (place: CourseMapStop) => void;
}

const samplePins = [{ x: 80, y: 35 }, { x: 60, y: 27 }, { x: 47, y: 20 }, { x: 22, y: 8 }];

function distanceLabel(meters: number) {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

export default function CourseMapScreen({ title, city, days, tripId, photoCourseId, sampleMap, activeDay, onBack, onDayChange, onOpenPlace }: CourseMapScreenProps) {
  const [selectedId, setSelectedId] = useState<string>();
  let order = 0;
  const groups = days.flatMap((day, dayIndex) => activeDay === undefined || activeDay === dayIndex ? [{
    label: day.label,
    rows: day.places.map((place, index) => {
      const next = day.places[index + 1];
      const straightDistance = photoCourseId && next ? straightLineMeters(place, next) : undefined;
      return {
        key: `${dayIndex}-${index}`,
        order: ++order,
        place,
        meters: place.distanceMeters ?? straightDistance,
        distance: place.distance ?? (straightDistance === undefined ? undefined : `직선거리 ${distanceLabel(straightDistance)}`),
      };
    }),
  }] : []);
  const rows = groups.flatMap(({ rows }) => rows);
  const selected = rows.find((row) => row.key === selectedId);
  const places = groups.flatMap(({ label, rows }) => rows.map(({ place, key, order }) => ({
    ...place, id: key, order, group: label,
  })));
  const legs = groups.flatMap(({ rows }) => rows.slice(0, -1));
  const total = legs.length && legs.every(({ meters }) => meters !== undefined)
    ? legs.reduce((sum, { meters }) => sum + (meters ?? 0), 0) : undefined;

  function chooseDay(day?: number) {
    setSelectedId(undefined);
    onDayChange(day);
  }

  function thumbnail(place: CourseMapStop) {
    if (place.photoPlaceId && (tripId || photoCourseId)) {
      return <PlaceThumbnail courseId={photoCourseId} placeId={place.photoPlaceId} name={place.name} />;
    }
    return place.image ? <img src={place.image} alt="" /> : null;
  }

  return (
    <S.MapScreen>
      <S.MapHeader>
        <div><button type="button" aria-label="코스 상세로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button><h1>{title}</h1><span /></div>
        <S.MapTabs aria-label="지도 일차 선택">
          <button type="button" aria-pressed={activeDay === undefined} onClick={() => chooseDay()}>전체</button>
          {days.map(({ label, date }, index) => (
            <button key={label} type="button" aria-pressed={activeDay === index} onClick={() => chooseDay(index)}>
              <strong>{label}</strong>
              {date && <small>{dateLabel(date).split(" ")[0]}</small>}
            </button>
          ))}
        </S.MapTabs>
      </S.MapHeader>
      <S.MapCanvas $selected={Boolean(selected)}>
        {sampleMap ? <>
          <img src={sampleMap} alt={`${city} 샘플 지도`} />
          {(activeDay === undefined || activeDay === 0) && samplePins.slice(0, groups[0]?.rows.length ?? 0).map((pin, index) => (
            <S.MapPin key={index} type="button" $x={pin.x} $y={pin.y} aria-label={`${groups[0].rows[index].place.name} 선택`}
              onClick={() => setSelectedId(groups[0].rows[index].key)}>{index + 1}</S.MapPin>
          ))}
        </> : <CourseRouteMap places={places} city={city} day={activeDay === undefined ? undefined : activeDay + 1}
          live interactive selectedId={selectedId} onSelect={(id) => setSelectedId((current) => current === id ? undefined : String(id))} />}
      </S.MapCanvas>
      {selected ? <S.MapSelection aria-label="지도에서 선택한 장소">
        <div>
          {thumbnail(selected.place)}
          <span><strong>{selected.order}. {selected.place.name}</strong><small>{selected.place.category}</small></span>
        </div>
        <button type="button" onClick={() => onOpenPlace(selected.place)}>장소 상세</button>
      </S.MapSelection> : <S.DaySheet aria-label="지도 아래 코스 목록">
        <h2>{activeDay === undefined ? "전체" : groups[0]?.label}</h2>
        <p>장소 {rows.length}곳{total !== undefined && ` · ${photoCourseId ? "직선거리 " : "이동 거리 "}${distanceLabel(total)}`}</p>
        {groups.map(({ label, rows }) => (
          <section key={label} aria-label={label}>
            {activeDay === undefined && <h3>{label}</h3>}
            {rows.map(({ key, order, place, distance }) => (
              <div key={key}>
                <S.MapPlaceRow type="button" onClick={() => onOpenPlace(place)}>
                  <b>{order}</b>
                  <span className="map-place-card">
                    {thumbnail(place)}
                    <span><strong>{place.name}</strong><small>{place.category}</small></span>
                  </span>
                </S.MapPlaceRow>
                {(place.travelTime || distance) && <S.MapTravel>
                  {place.travelTime?.startsWith("도보") && <img src={walkIcon} alt="" />}
                  {[place.travelTime, distance].filter(Boolean).join(" · ")}
                </S.MapTravel>}
              </div>
            ))}
          </section>
        ))}
      </S.DaySheet>}
    </S.MapScreen>
  );
}
