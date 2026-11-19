import { useState } from "react";
import backIcon from "../../assets/figma/map-back.svg";
import walkIcon from "../../assets/figma/traveler-walk.svg";
import locateIcon from "../../assets/figma/course-map-locate.svg";
import googleIcon from "../../assets/images/brand-google-maps.webp";
import sampleLeg1 from "../../assets/traveler-course/route-leg-1.svg";
import sampleLeg2 from "../../assets/traveler-course/route-leg-2.svg";
import sampleLeg3 from "../../assets/traveler-course/route-leg-3.svg";
import * as S from "./TravelerCourseOverlay.styled";
import { PlaceThumbnail } from "../common/PlacePhoto";
import SheetHandle from "../common/SheetHandle";
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
  initialSelectedId?: string;
  onBack: () => void;
  onDayChange: (day?: number) => void;
  onOpenPlace: (place: CourseMapStop, selectedPin?: string) => void;
}

// Coordinates on the original 402 × 874 Kyoto map illustration.
const sampleStops = [
  { id: "kiyomizu", x: 321, y: 540, leg: sampleLeg1, detail: "이른 아침 사람 없는 본당 전망" },
  { id: "sannenzaka", x: 233, y: 498, leg: sampleLeg2, detail: "기념품 가게와 찻집이 이어진 돌길" },
  { id: "yasaka", x: 188, y: 436, leg: sampleLeg3, detail: "해 질 무렵 골목 끝에 보이는 오층탑" },
  { id: "gion", x: 89, y: 290, detail: "저녁 등불이 켜진 전통 거리 산책" },
];

function distanceLabel(meters: number) {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

export default function CourseMapScreen({ title, city, days, tripId, photoCourseId, sampleMap, activeDay, initialSelectedId, onBack, onDayChange, onOpenPlace }: CourseMapScreenProps) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [listHidden, setListHidden] = useState(false);
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
  const showList = !selected && !listHidden;
  const pins = sampleMap ? rows.flatMap(row => {
    const point = sampleStops.find(stop => stop.id === row.place.id);
    return point ? [{ ...point, y: point.y - (showList ? 120 : 0), row }] : [];
  }) : [];
  const selectedSample = pins.find(pin => pin.row.key === selectedId);
  const places = groups.flatMap(({ label, rows }) => rows.map(({ place, key, order }) => ({
    ...place, id: key, order, group: label,
  })));
  const legs = groups.flatMap(({ rows }) => rows.slice(0, -1));
  const total = legs.length && legs.every(({ meters }) => meters !== undefined)
    ? legs.reduce((sum, { meters }) => sum + (meters ?? 0), 0) : undefined;
  const dayDistance = sampleMap && activeDay === 0 ? "도보 2.4km" : total !== undefined
    ? `${photoCourseId ? "직선거리" : "이동 거리"} ${distanceLabel(total)}` : undefined;

  function chooseDay(day?: number) {
    setSelectedId(undefined);
    setListHidden(false);
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
      <S.MapHeader data-public-course={!tripId || undefined}>
        <div><button type="button" aria-label="코스 상세로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button><h1>{title}</h1><span /></div>
        <S.MapTabs $publicCourse={!tripId} aria-label="지도 일차 선택">
          <button type="button" aria-pressed={activeDay === undefined} onClick={() => chooseDay()}>전체</button>
          {days.map(({ label, date }, index) => (
            <button key={label} type="button" aria-pressed={activeDay === index} onClick={() => chooseDay(index)}>
              <strong>{label}</strong>
              {date && <small>{dateLabel(date).split(" ")[0]}</small>}
            </button>
          ))}
        </S.MapTabs>
      </S.MapHeader>
      <S.MapCanvas $selected={Boolean(selected)} $showCourseList={showList}>
        {sampleMap ? <>
          <S.SampleMapLayer>
            <img src={sampleMap} alt={`${city} 샘플 지도`} />
            <svg viewBox="0 0 402 874" preserveAspectRatio="none" aria-hidden="true">
              {pins.map((pin, index) => {
                const next = pins[index + 1];
                if (!pin.leg || !next) return null;
                return <image key={pin.id} href={pin.leg} x={Math.min(pin.x, next.x) - 3} y={Math.min(pin.y, next.y) - 3}
                  width={Math.abs(pin.x - next.x) + 6} height={Math.abs(pin.y - next.y) + 6} preserveAspectRatio="none" />;
              })}
              {pins.length > 0 && <g transform={`translate(269,${showList ? 487 : 607})`}>
                <circle r="22" fill="#4285f4" opacity=".18" />
                <circle r="8" fill="#4285f4" stroke="white" strokeWidth="2" />
              </g>}
            </svg>
            {pins.map(({ row, x, y }) =>
              <S.MapPin key={row.key} type="button" $x={x / 402 * 100} $y={y / 874 * 100} $overview={showList}
                aria-label={`${row.place.name} 선택`} aria-pressed={selectedId === row.key}
                onClick={() => setSelectedId(current => current === row.key ? undefined : row.key)}>{row.order}</S.MapPin>
            )}
          </S.SampleMapLayer>
          <S.SampleMapControls $selected={Boolean(selected)} $showList={showList}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([city, selected?.place.name].filter(Boolean).join(" "))}`}
              target="_blank" rel="noopener noreferrer"><img src={googleIcon} alt="" />{selected ? "구글맵으로 보기" : "구글맵"}</a>
            {!selected && <button type="button" aria-label="코스 지도 중심으로" onClick={() => {
              setListHidden(false);
              setSelectedId(undefined);
            }}><img src={locateIcon} alt="" /></button>}
          </S.SampleMapControls>
        </> : <CourseRouteMap places={places} city={city} day={activeDay === undefined ? undefined : activeDay + 1}
          live interactive selectedId={selectedId} onSelect={(id) => setSelectedId((current) => current === id ? undefined : String(id))} />}
      </S.MapCanvas>
      {selected ? <S.MapSelection aria-label="지도에서 선택한 장소" data-public-course={!tripId || undefined}>
        <div>
          {thumbnail(selected.place)}
          <span className="map-selection-info"><strong><b>{selected.order}</b> {selected.place.name}</strong><small>{selectedSample?.detail ?? selected.place.category}</small>
            {selected.place.travelTime && <small className="map-selection-travel">다음 장소까지 {selected.place.travelTime}</small>}</span>
        </div>
        <button type="button" onClick={() => onOpenPlace(selected.place, selected.key)}>장소 상세</button>
      </S.MapSelection> : !listHidden && <S.DaySheet aria-label="지도 아래 코스 목록" data-public-course={!tripId || undefined}>
        <SheetHandle onClose={() => setListHidden(true)} />
        <h2>{activeDay === undefined ? "전체" : groups[0]?.label}</h2>
        <p>장소 {rows.length}곳{dayDistance && <span>{dayDistance}</span>}</p>
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
                  {place.travelTime && <strong>{place.travelTime}</strong>}{distance && <span>{distance}</span>}
                </S.MapTravel>}
              </div>
            ))}
          </section>
        ))}
      </S.DaySheet>}
    </S.MapScreen>
  );
}
