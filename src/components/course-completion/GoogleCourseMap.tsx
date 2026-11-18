import { useEffect, useId, useMemo, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import googleIcon from "../../assets/figma/course-map-google.png";
import locateIcon from "../../assets/figma/course-map-locate.svg";
import { googleMapsBrowserKey } from "../../api/config";
import { courseMapViewport, googleMapsDirectionsUrl, googleMapsEmbedUrl, googleMapsViewUrl, groupCourseMapPins, isMapCoordinate } from "../../utils/googleMaps";
import type { RouteMapPlace } from "./CourseRouteMap";
import { addCourseRouteLayer } from "./GoogleCourseMapRoute";

const authFailureListeners = new Set<() => void>();
let mapsLoad: Promise<[google.maps.MapsLibrary, google.maps.MarkerLibrary]> | undefined;
let mapAuthFailed = false;

function loadMaps() {
  if (!mapsLoad) {
    const mapWindow = window as Window & { gm_authFailure?: () => void };
    mapWindow.gm_authFailure = () => {
      mapAuthFailed = true;
      authFailureListeners.forEach((listener) => listener());
    };
    setOptions({ key: googleMapsBrowserKey, v: "weekly", language: "ko" });
    mapsLoad = Promise.all([importLibrary("maps"), importLibrary("marker")]);
  }
  return mapsLoad;
}

interface GoogleCourseMapProps {
  places: RouteMapPlace[];
  label: string;
  interactive: boolean;
  selectedId?: number | string;
  onSelect?: (id: number | string) => void;
}

export default function GoogleCourseMap({ places, label, interactive, selectedId, onSelect }: GoogleCourseMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const routeLayerId = useId();
  const [size, setSize] = useState({ width: 362, height: 264 });
  const [sdk, setSdk] = useState<{ map: google.maps.Map; OverlayView: typeof google.maps.OverlayView; Marker: typeof google.maps.Marker }>();
  const [sdkFailed, setSdkFailed] = useState(false);
  const [embedRevision, setEmbedRevision] = useState(0);
  const located = useMemo(() => places.filter(isMapCoordinate), [places]);
  const viewport = useMemo(() => courseMapViewport(located, size.width, size.height), [located, size]);
  const directionsUrl = new Set(located.map((place) => place.group)).size === 1
    ? googleMapsDirectionsUrl(located)
    : undefined;
  const useSdk = Boolean(googleMapsBrowserKey) && !sdkFailed;
  const hasCoordinates = Boolean(viewport);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    function updateSize() {
      if (element && element.clientWidth > 0 && element.clientHeight > 0) {
        setSize({ width: element.clientWidth, height: element.clientHeight });
      }
    }
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!useSdk || !hasCoordinates || !element) return;
    let active = true;
    const failed = () => { if (active) setSdkFailed(true); };
    authFailureListeners.add(failed);
    void loadMaps().then(([{ Map, OverlayView }, { Marker }]) => {
      if (!active) return;
      if (mapAuthFailed) { failed(); return; }
      const map = new Map(element, {
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: interactive ? "greedy" : "none",
        keyboardShortcuts: interactive,
      });
      setSdk({ map, OverlayView, Marker });
    }).catch(failed);
    return () => {
      active = false;
      authFailureListeners.delete(failed);
    };
  }, [useSdk, hasCoordinates, interactive]);

  useEffect(() => {
    if (!sdk || !viewport) return;
    sdk.map.setCenter({ lat: viewport.latitude, lng: viewport.longitude });
    sdk.map.setZoom(viewport.zoom);
  }, [sdk, viewport]);

  useEffect(() => {
    if (!useSdk || !sdk) return;
    const paths = new Map<string, google.maps.LatLngLiteral[]>();
    for (const place of located) {
      const group = place.group ?? "";
      if (!paths.has(group)) paths.set(group, []);
      paths.get(group)?.push({ lat: place.latitude, lng: place.longitude });
    }
    return addCourseRouteLayer(sdk.map, sdk.OverlayView, [...paths.values()], routeLayerId);
  }, [located, routeLayerId, sdk, useSdk]);

  useEffect(() => {
    if (!useSdk || !sdk) return;
    const { map, Marker } = sdk;
    let markers: { marker: google.maps.Marker; listener?: google.maps.MapsEventListener }[] = [];

    function clearMarkers() {
      markers.forEach(({ marker, listener }) => { listener?.remove(); marker.setMap(null); });
    }

    function renderMarkers() {
      const zoom = map.getZoom();
      if (zoom === undefined) return;
      clearMarkers();
      markers = groupCourseMapPins(located, zoom).map(({ position, places: entries, label, halfWidth }) => {
        const selectedIndex = entries.findIndex((place) => place.id === selectedId);
        const selected = selectedIndex !== -1;
        const group = entries.length > 1;
        const halfMiddle = halfWidth - 12;
        const marker = new Marker({
          map,
          position: { lat: position.latitude, lng: position.longitude },
          title: [...new Set(entries.map((place) => place.name))].join(", "),
          label: { text: label, color: "#fff", fontSize: group ? "12px" : "14px", fontWeight: "700" },
          icon: {
            path: group
              ? `M ${-halfMiddle} -12 H ${halfMiddle} A 12 12 0 0 1 ${halfMiddle} 12 H ${-halfMiddle} A 12 12 0 0 1 ${-halfMiddle} -12 Z`
              : google.maps.SymbolPath.CIRCLE,
            scale: group ? 1 : selected ? 16 : 12,
            fillColor: selected ? "#090738" : "#80daf5",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });
        const listener = onSelect
          ? marker.addListener("click", () => onSelect(entries[(selectedIndex + 1) % entries.length].id))
          : undefined;
        return { marker, listener };
      });
    }

    renderMarkers();
    const zoomListener = map.addListener("zoom_changed", renderMarkers);
    return () => {
      zoomListener.remove();
      clearMarkers();
    };
  }, [located, onSelect, sdk, selectedId, useSdk]);

  return (
    <div ref={container} className={`course-map course-map--live${interactive ? " course-map--interactive" : ""}`} aria-label={label}>
      {viewport ? <>
        {useSdk
          ? <div ref={canvas} className="course-map__google" aria-label={label} />
          : <iframe
            key={embedRevision}
            className="course-map__google"
            title={label}
            src={googleMapsEmbedUrl(viewport)}
            loading={interactive ? "eager" : "lazy"}
            tabIndex={interactive ? 0 : -1}
            referrerPolicy="strict-origin-when-cross-origin"
          />}
        {interactive && <div className="course-map__controls">
          <a href={directionsUrl ?? googleMapsViewUrl(viewport)} target="_blank" rel="noopener noreferrer"><img src={googleIcon} alt="" />구글맵으로 보기</a>
          <button type="button" aria-label="코스 지도 중심으로" onClick={() => {
            if (sdk && useSdk) {
              sdk.map.setCenter({ lat: viewport.latitude, lng: viewport.longitude });
              sdk.map.setZoom(viewport.zoom);
            } else setEmbedRevision((current) => current + 1);
          }}><img src={locateIcon} alt="" /></button>
        </div>}
      </> : <p className="course-map__unavailable">지도에 표시할 장소 좌표가 없어요.</p>}
    </div>
  );
}
