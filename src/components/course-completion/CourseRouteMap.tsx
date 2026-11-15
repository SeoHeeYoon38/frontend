import routeMap from "../../assets/course-completion/route-map.png";
import type { CoursePlace } from "../../types/courseCompletion";
import "./CourseCompletion.css";

interface CourseRouteMapProps {
  places: Array<Pick<CoursePlace, "name" | "latitude" | "longitude"> & {
    id: number | string;
    order?: number;
    group?: string;
  }>;
  city: string;
  day?: number;
  schematic?: boolean;
  expanded?: boolean;
  onSelect?: (id: number | string) => void;
}

function CourseRouteMap({ places, city, day, schematic = false, expanded = false, onSelect }: CourseRouteMapProps) {
  const dayLabel = day === undefined ? "전체" : `${day}일차`;
  const rows = Math.max(1, Math.ceil(places.length / 3));
  const hasCoordinates = places.every((place) =>
    Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
  );
  const latitudes = places.map((place) => place.latitude ?? 0);
  const longitudes = places.map((place) => place.longitude ?? 0);
  const minLatitude = Math.min(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const latitudeRange = Math.max(.001, Math.max(...latitudes) - minLatitude);
  const longitudeRange = Math.max(.001, Math.max(...longitudes) - minLongitude);
  const pins = places.map((place, index) => ({
    id: place.id,
    name: place.name,
    order: place.order ?? index + 1,
    group: place.group ?? "",
    x: hasCoordinates ? 10 + ((place.longitude! - minLongitude) / longitudeRange) * 70 : 15 + (index % 3) * 35,
    y: hasCoordinates ? 80 - ((place.latitude! - minLatitude) / latitudeRange) * 60 : 20 + Math.floor(index / 3) * (60 / Math.max(1, rows - 1)),
  }));
  const paths = new Map<string, typeof pins>();
  for (const pin of pins) {
    const group = paths.get(pin.group);
    if (group) group.push(pin);
    else paths.set(pin.group, [pin]);
  }

  return (
    <div className={`course-map${expanded ? " course-map--expanded" : ""}`} aria-label={`${dayLabel} ${city} ${schematic ? "장소 배치도" : "샘플 경로"}`}>
      {!schematic && city === "오사카" && <img className="course-map__base" src={routeMap} alt="오사카 샘플 지도" />}
      <svg className="course-map__route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {Array.from(paths, ([group, points]) => <polyline
          key={group}
          points={points.map((pin) => `${pin.x},${pin.y}`).join(" ")}
          fill="none"
          stroke="#00c6df"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />)}
      </svg>
      {pins.map((pin) => {
        const style = { left: `${pin.x}%`, top: `${pin.y}%` };
        return onSelect ? (
          <button key={pin.id} className="course-map__pin" type="button" style={style} aria-label={`${pin.name} 열기`} onClick={() => onSelect(pin.id)}>
            {pin.order}
          </button>
        ) : <span key={pin.id} className="course-map__pin" style={style} title={pin.name}>{pin.order}</span>;
      })}
      <small className="course-map__caption">{dayLabel} · {places.length}곳 · {schematic ? "방문 순서" : "샘플 경로"}</small>
      <ol className="course-live-region">{places.map((place) => <li key={place.id}>{place.name}</li>)}</ol>
    </div>
  );
}

export default CourseRouteMap;
