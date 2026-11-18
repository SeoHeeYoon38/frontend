export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapTile {
  x: number;
  y: number;
  left: number;
  top: number;
}

const tileSize = 256;
const latitudeLimit = 85.05112878;

function worldPosition({ latitude, longitude }: MapCoordinate, zoom: number) {
  const scale = tileSize * 2 ** zoom;
  const lat = Math.max(-latitudeLimit, Math.min(latitudeLimit, latitude)) * Math.PI / 180;
  return {
    x: (longitude + 180) / 360 * scale,
    y: (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * scale,
  };
}

export function mapTileLayout(points: MapCoordinate[], width: number, height: number) {
  if (!points.length || width <= 0 || height <= 0 || points.some(({ latitude, longitude }) =>
    !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) return null;

  let zoom = 2;
  let positions = points.map((point) => worldPosition(point, zoom));
  for (let candidate = 16; candidate >= 2; candidate--) {
    const projected = points.map((point) => worldPosition(point, candidate));
    const xs = projected.map((point) => point.x);
    const ys = projected.map((point) => point.y);
    if (Math.max(...xs) - Math.min(...xs) <= width - 64 && Math.max(...ys) - Math.min(...ys) <= height - 64) {
      zoom = candidate;
      positions = projected;
      break;
    }
  }

  const xs = positions.map((point) => point.x);
  const ys = positions.map((point) => point.y);
  const left = (Math.min(...xs) + Math.max(...xs)) / 2 - width / 2;
  const top = (Math.min(...ys) + Math.max(...ys)) / 2 - height / 2;
  const maxTile = 2 ** zoom;
  const tiles: MapTile[] = [];
  for (let y = Math.max(0, Math.floor(top / tileSize)); y <= Math.min(maxTile - 1, Math.floor((top + height) / tileSize)); y++) {
    for (let x = Math.max(0, Math.floor(left / tileSize)); x <= Math.min(maxTile - 1, Math.floor((left + width) / tileSize)); x++) {
      tiles.push({ x, y, left: x * tileSize - left, top: y * tileSize - top });
    }
  }
  return {
    zoom,
    tiles,
    pins: positions.map((point) => ({ x: point.x - left, y: point.y - top })),
  };
}
