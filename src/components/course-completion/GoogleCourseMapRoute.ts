const svgNamespace = "http://www.w3.org/2000/svg";

export function addCourseRouteLayer(
  map: google.maps.Map,
  OverlayView: typeof google.maps.OverlayView,
  paths: google.maps.LatLngLiteral[][],
  layerId: string,
) {
  const overlay = new OverlayView();
  const svg = document.createElementNS(svgNamespace, "svg");
  const definitions = document.createElementNS(svgNamespace, "defs");
  Object.assign(svg.style, { position: "absolute", inset: "0", overflow: "visible", pointerEvents: "none" });
  svg.setAttribute("width", "1");
  svg.setAttribute("height", "1");
  svg.setAttribute("aria-hidden", "true");
  svg.append(definitions);

  const legs = paths.flatMap((path) => path.slice(1).map((to, index) => ({ from: path[index], to })));
  const lines = legs.map(({ from, to }, index) => {
    const gradient = document.createElementNS(svgNamespace, "linearGradient");
    gradient.id = `${layerId}-${index}`;
    gradient.setAttribute("gradientUnits", "userSpaceOnUse");
    for (const [offset, color] of [["0", "#E0FBFF"], ["1", "#00E1FF"]]) {
      const stop = document.createElementNS(svgNamespace, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      gradient.append(stop);
    }
    definitions.append(gradient);

    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("stroke", `url(#${gradient.id})`);
    line.setAttribute("stroke-width", "5.4");
    line.setAttribute("stroke-linecap", "round");
    svg.append(line);
    return { from, to, gradient, line };
  });

  overlay.onAdd = () => { overlay.getPanes()?.overlayLayer.append(svg); };
  overlay.draw = () => {
    const projection = overlay.getProjection();
    for (const { from, to, gradient, line } of lines) {
      const start = projection.fromLatLngToDivPixel(from);
      const end = projection.fromLatLngToDivPixel(to);
      if (!start || !end) continue;
      for (const element of [gradient, line]) {
        element.setAttribute("x1", String(start.x));
        element.setAttribute("y1", String(start.y));
        element.setAttribute("x2", String(end.x));
        element.setAttribute("y2", String(end.y));
      }
    }
  };
  overlay.onRemove = () => { svg.remove(); };
  overlay.setMap(map);
  return () => overlay.setMap(null);
}
