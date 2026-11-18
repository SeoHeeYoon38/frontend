export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export function isMapCoordinate<T extends { latitude?: number | null; longitude?: number | null }>(point: T): point is T & MapCoordinate {
  return typeof point.latitude === "number" && Math.abs(point.latitude) <= 90 &&
    typeof point.longitude === "number" && Math.abs(point.longitude) <= 180;
}

export function courseMapViewport(points: MapCoordinate[], width: number, height: number) {
  if (!points.length || width <= 0 || height <= 0) return null;
  const xs = points.map(({ longitude }) => (longitude + 180) / 360);
  const ys = points.map(({ latitude }) => {
    const radians = Math.max(-85.05112878, Math.min(85.05112878, latitude)) * Math.PI / 180;
    return (1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2;
  });
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

export function googleMapsViewUrl(view: MapCoordinate & { zoom: number }) {
  const params = new URLSearchParams({
    api: "1",
    map_action: "map",
    center: `${view.latitude},${view.longitude}`,
    zoom: String(view.zoom),
  });
  return `https://www.google.com/maps/@?${params}`;
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
