export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

type PossibleMapCoordinate = { latitude?: number | null; longitude?: number | null };

export function isMapCoordinate<T extends PossibleMapCoordinate>(point: T): point is T & MapCoordinate {
  return typeof point.latitude === "number" && Math.abs(point.latitude) <= 90 &&
    typeof point.longitude === "number" && Math.abs(point.longitude) <= 180;
}

export function straightLineMeters(from: PossibleMapCoordinate, to: PossibleMapCoordinate) {
  if (!isMapCoordinate(from) || !isMapCoordinate(to)) return;
  const radians = Math.PI / 180;
  const haversine = Math.sin((to.latitude - from.latitude) * radians / 2) ** 2 +
    Math.cos(from.latitude * radians) * Math.cos(to.latitude * radians) *
    Math.sin((to.longitude - from.longitude) * radians / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

function projectMapCoordinate({ latitude, longitude }: MapCoordinate) {
  const radians = Math.max(-85.05112878, Math.min(85.05112878, latitude)) * Math.PI / 180;
  return { x: (longitude + 180) / 360, y: (1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2 };
}

export function courseMapViewport(points: MapCoordinate[], width: number, height: number) {
  if (!points.length || width <= 0 || height <= 0) return null;
  const projected = points.map(projectMapCoordinate);
  const xs = projected.map(({ x }) => x);
  const ys = projected.map(({ y }) => y);
  const west = Math.min(...xs);
  const east = Math.max(...xs);
  const south = Math.max(...ys);
  const north = Math.min(...ys);
  const zoom = Math.max(1, Math.min(16, Math.floor(Math.log2(Math.min(
    Math.max(1, width - 64) / (256 * (east - west)),
    Math.max(1, height - 64) / (256 * (south - north)),
  )))));
  return {
    latitude: Math.atan(Math.sinh(Math.PI * (1 - south - north))) * 180 / Math.PI,
    longitude: (west + east) * 180 - 180,
    zoom,
  };
}

interface MapPixel {
  x: number;
  y: number;
}

const pinGap = 2;
const maxPinSpacing = 34;
const diagonal = Math.SQRT1_2;
const pinDirections = [
  [1, 0], [-1, 0], [0, -1], [0, 1],
  [diagonal, -diagonal], [-diagonal, -diagonal], [diagonal, diagonal], [-diagonal, diagonal],
];

function findFreePin(
  anchor: MapPixel,
  radius: number,
  placed: (MapPixel & { radius: number })[],
  width: number,
  height: number,
) {
  const free = ({ x, y }: MapPixel) =>
    placed.every((pin) => (pin.x - x) ** 2 + (pin.y - y) ** 2 >= (radius + pin.radius + pinGap) ** 2);
  if (free(anchor)) return anchor;

  const visible = anchor.x >= 0 && anchor.x <= width && anchor.y >= 0 && anchor.y <= height;
  const searchLimit = visible ? Math.max(maxPinSpacing, Math.hypot(width, height)) : maxPinSpacing * (placed.length + 1);
  let nearestOutside: MapPixel | undefined;
  for (let distance = 2; distance <= searchLimit; distance += 2) {
    for (const [dx, dy] of pinDirections) {
      const candidate = { x: anchor.x + dx * distance, y: anchor.y + dy * distance };
      if (!free(candidate)) continue;
      if (!visible || (candidate.x >= radius && candidate.x <= width - radius &&
        candidate.y >= radius && candidate.y <= height - radius)) return candidate;
      nearestOutside ??= candidate;
    }
  }
  return nearestOutside ?? { x: Math.max(anchor.x, ...placed.map((pin) => pin.x)) + maxPinSpacing, y: anchor.y };
}

export function layoutCourseMapPins(anchors: (MapPixel & { radius?: number })[], width: number, height: number) {
  const placed: (MapPixel & { radius: number })[] = [];
  for (const anchor of anchors) {
    const radius = anchor.radius ?? 12;
    placed.push({ ...findFreePin(anchor, radius, placed, width, height), radius });
  }
  return placed.map(({ x, y }) => ({ x, y }));
}

export function googleMapsViewUrl(view: MapCoordinate & { zoom: number }) {
  const params = new URLSearchParams({
    api: "1",
    map_action: "map",
    center: `${view.latitude},${view.longitude}`,
    zoom: String(view.zoom),
  });
  return `https://www.google.com/maps/@?${params}`;
}

export function googleMapsDirectionsUrl(points: MapCoordinate[]) {
  // Maps URLs in mobile browsers support up to three intermediate stops.
  if (points.length < 2 || points.length > 5) return undefined;
  const coordinates = points.map((point) => `${point.latitude},${point.longitude}`);
  const params = new URLSearchParams({
    api: "1",
    origin: coordinates[0],
    destination: coordinates[coordinates.length - 1],
  });
  if (coordinates.length > 2) params.set("waypoints", coordinates.slice(1, -1).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}

export function googleMapsEmbedUrl(view: MapCoordinate & { zoom: number }) {
  const params = new URLSearchParams({
    ll: `${view.latitude},${view.longitude}`,
    z: String(view.zoom),
    hl: "ko",
    output: "embed",
  });
  return `https://www.google.com/maps?${params}`;
}
