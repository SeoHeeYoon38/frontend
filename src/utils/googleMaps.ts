export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export function isMapCoordinate<T extends { latitude?: number | null; longitude?: number | null }>(point: T): point is T & MapCoordinate {
  return typeof point.latitude === "number" && Math.abs(point.latitude) <= 90 &&
    typeof point.longitude === "number" && Math.abs(point.longitude) <= 180;
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

export function groupCourseMapPins<T extends MapCoordinate & { order?: number }>(points: T[], zoom: number) {
  const worldSize = 256 * 2 ** zoom;
  const groups = points.map((place, index) => ({
    position: place,
    ...projectMapCoordinate(place),
    stops: [{ place, index }],
    label: String(place.order ?? index + 1),
    halfWidth: 12,
  }));

  for (let index = 0; index < groups.length;) {
    const anchor = groups[index];
    const overlappingIndex = groups.findIndex((other, candidate) => {
      if (candidate <= index) return false;
      const longitudeDelta = Math.abs(anchor.x - other.x);
      const dx = Math.min(longitudeDelta, 1 - longitudeDelta) * worldSize;
      const dy = Math.abs(anchor.y - other.y) * worldSize;
      const extraWidth = Math.max(0, anchor.halfWidth - 12) + Math.max(0, other.halfWidth - 12);
      const radii = (anchor.stops.length > 1 ? 12 : 16) + (other.stops.length > 1 ? 12 : 16);
      return Math.hypot(Math.max(0, dx - extraWidth), dy) < radii + 2;
    });
    if (overlappingIndex === -1) {
      index += 1;
      continue;
    }
    const [overlapping] = groups.splice(overlappingIndex, 1);
    anchor.stops.push(...overlapping.stops);
    anchor.stops.sort((a, b) => a.index - b.index);
    const orders = anchor.stops.map(({ place, index: orderIndex }) => place.order ?? orderIndex + 1);
    anchor.label = orders.length <= 3 ? orders.join("·") : `${orders[0]} +${orders.length - 1}`;
    anchor.halfWidth = Math.max(12, Math.ceil(anchor.label.length * 3.6 + 5));
    index = 0;
  }

  return groups.map(({ position, stops, label, halfWidth }) => ({
    position, places: stops.map(({ place }) => place), label, halfWidth,
  }));
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
