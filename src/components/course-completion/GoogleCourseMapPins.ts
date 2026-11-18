import { layoutCourseMapPins, type MapCoordinate } from "../../utils/googleMaps";
import type { RouteMapPlace } from "./CourseRouteMap";

export function addCoursePinLayer(
  map: google.maps.Map,
  OverlayView: typeof google.maps.OverlayView,
  places: (RouteMapPlace & MapCoordinate)[],
  selectedId?: RouteMapPlace["id"],
  onSelect?: (id: RouteMapPlace["id"]) => void,
) {
  const overlay = new OverlayView();
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: "absolute", inset: "0", pointerEvents: "none" });

  const pins = places.map((place, index) => {
    const element = document.createElement(onSelect ? "button" : "span");
    const selected = place.id === selectedId;
    element.className = "course-map__number-pin";
    element.textContent = String(place.order ?? index + 1);
    element.title = place.name;
    if (element instanceof HTMLButtonElement && onSelect) {
      element.type = "button";
      element.setAttribute("aria-label", place.name);
      element.setAttribute("aria-pressed", String(selected));
      element.addEventListener("click", () => onSelect(place.id));
      OverlayView.preventMapHitsFrom(element);
    }
    layer.append(element);
    return { element, coordinate: { lat: place.latitude, lng: place.longitude }, radius: selected ? 16 : 12 };
  });

  overlay.onAdd = () => {
    const panes = overlay.getPanes();
    (onSelect ? panes?.overlayMouseTarget : panes?.markerLayer)?.append(layer);
  };
  overlay.draw = () => {
    const projection = overlay.getProjection();
    const projected = pins.flatMap(({ coordinate, element, radius }) => {
      const div = projection.fromLatLngToDivPixel(coordinate);
      const viewport = projection.fromLatLngToContainerPixel(coordinate);
      element.hidden = !div || !viewport;
      return div && viewport ? [{ element, div, viewport, radius }] : [];
    });
    const mapElement = map.getDiv();
    const anchors = projected.map(({ viewport, radius }) => ({ x: viewport.x, y: viewport.y, radius }));
    const placed = layoutCourseMapPins(anchors, mapElement.clientWidth, mapElement.clientHeight);
    projected.forEach(({ element, div, viewport }, index) => {
      const { x, y } = placed[index];
      element.style.left = `${div.x + x - viewport.x}px`;
      element.style.top = `${div.y + y - viewport.y}px`;
    });
  };
  overlay.onRemove = () => { layer.remove(); };
  overlay.setMap(map);
  return () => overlay.setMap(null);
}
