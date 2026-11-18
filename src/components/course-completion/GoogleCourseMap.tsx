import { useEffect, useId, useMemo, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import googleIcon from "../../assets/figma/course-map-google.png";
import locateIcon from "../../assets/figma/course-map-locate.svg";
import { googleMapsBrowserKey } from "../../api/config";
import { courseMapViewport, googleMapsDirectionsUrl, googleMapsEmbedUrl, googleMapsViewUrl, isMapCoordinate } from "../../utils/googleMaps";
import type { RouteMapPlace } from "./CourseRouteMap";
import { addCoursePinLayer } from "./GoogleCourseMapPins";
import { addCourseRouteLayer } from "./GoogleCourseMapRoute";

const authFailureListeners = new Set<() => void>();
let mapsLoad: Promise<google.maps.MapsLibrary> | undefined;
let mapAuthFailed = false;

function loadMaps() {
  if (!mapsLoad) {
    const mapWindow = window as Window & { gm_authFailure?: () => void };
    mapWindow.gm_authFailure = () => {
      mapAuthFailed = true;
      authFailureListeners.forEach((listener) => listener());
    };
    setOptions({ key: googleMapsBrowserKey, v: "weekly", language: "ko" });
    mapsLoad = importLibrary("maps");
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
  const [sdk, setSdk] = useState<{ map: google.maps.Map; OverlayView: typeof google.maps.OverlayView }>();
  const [sdkFailed, setSdkFailed] = useState(false);
  const [embedRevision, setEmbedRevision] = useState(0);
  const located = useMemo(
    () => places.map((place, index) => ({ ...place, order: place.order ?? index + 1 })).filter(isMapCoordinate),
    [places],
  );
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
    void loadMaps().then(({ Map, OverlayView }) => {
      if (!active) return;
      if (mapAuthFailed) { failed(); return; }
      const map = new Map(element, {
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: interactive ? "greedy" : "none",
        keyboardShortcuts: interactive,
      });
      setSdk({ map, OverlayView });
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
    return addCoursePinLayer(sdk.map, sdk.OverlayView, located, selectedId, onSelect);
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
