import { useEffect, useRef, useState } from "react";
import { addPlaceOnDate, getLatestItinerary } from "../../api/itineraries";
import { getNearbyPlaces, getPopularPlaces, getSavedPlaces, searchPlaces } from "../../api/places";
import { getTripCity } from "../../api/trips";
import type { ItineraryVersionView, PlaceCategoryCode, SavedPlaceResponse } from "../../api/types";
import closeIcon from "../../assets/course-completion/picker-close.svg";
import searchIcon from "../../assets/course-completion/picker-search.svg";
import clearIcon from "../../assets/course-completion/picker-clear.svg";
import selectedIcon from "../../assets/course-completion/picker-selected.svg";
import unselectedIcon from "../../assets/course-completion/picker-unselected.svg";
import googleMapsLogo from "../../assets/figma/course-map-google.png";
import { straightLineMeters } from "../../utils/googleMaps";
import { savedPlacesForTripCity } from "../../utils/tripPlaces";
import { PlaceThumbnail } from "../common/PlacePhoto";
import { ErrorText } from "../trip/Trip.styled";
import { placeDayError } from "../../utils/placeDaySuggestion";
import * as S from "./AddItineraryPlaceSheet.styled";

const tabs = [
  ["recommended", "추천"],
  ["saved", "저장한 곳"],
  ["sightseeing", "관광"],
  ["food", "맛집"],
  ["cafe", "카페"],
  ["shopping", "쇼핑"],
] as const;

type Tab = typeof tabs[number][0];

const categoryTab: Record<PlaceCategoryCode, Tab> = {
  FOOD: "food", CAFE: "cafe", SIGHTSEEING: "sightseeing", SHOPPING: "shopping",
  NATURE: "sightseeing", CULTURE: "sightseeing", NIGHTLIFE: "sightseeing",
  ACTIVITY: "sightseeing", OTHER: "recommended",
};

interface PickerPlace {
  placeId: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category?: PlaceCategoryCode | null;
}

interface PlaceListResult {
  places: PickerPlace[];
  failed?: boolean;
}

function fromCandidate(place: Awaited<ReturnType<typeof searchPlaces>>[number]): PickerPlace {
  return { ...place, latitude: place.lat, longitude: place.lng };
}

async function loadRecommendations(tripId: number, latitude: number | undefined, longitude: number | undefined, category: PlaceCategoryCode | undefined, signal: AbortSignal) {
  if (latitude !== undefined && longitude !== undefined) {
    const nearby = await getNearbyPlaces(tripId, latitude, longitude, category, signal).catch(() => []);
    if (nearby.length) return nearby.map(fromCandidate);
  }
  const popular = await getPopularPlaces(tripId, signal);
  return category ? popular.filter((place) => place.category === category) : popular;
}

interface RouteStop { name: string; latitude: number; longitude: number }

function nearestStop(place: PickerPlace, stops: RouteStop[]) {
  let nearest: { name: string; meters: number } | undefined;
  for (const stop of stops) {
    const meters = straightLineMeters(stop, place);
    if (meters !== undefined && (!nearest || meters < nearest.meters)) nearest = { name: stop.name, meters };
  }
  return nearest;
}

function rowDescription(place: PickerPlace, nearest: ReturnType<typeof nearestStop>) {
  if (!nearest) return place.address;
  const { name, meters } = nearest;
  const distance = meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
  return `${name}에서 ${distance}`;
}

interface AddItineraryPlaceSheetProps {
  tripId: number;
  city: string;
  day: number;
  date: string;
  anchor?: RouteStop;
  stops?: RouteStop[];
  replacement?: { category?: PlaceCategoryCode; onSave: (placeId: string) => Promise<void> };
  scheduledDays: ReadonlyMap<string, number>;
  onClose: () => void;
  onSaved?: (itinerary: ItineraryVersionView, addedIds: string[], places: SavedPlaceResponse[] | undefined, complete: boolean) => void;
}

export default function AddItineraryPlaceSheet({
  tripId, city, day, date, anchor, stops = anchor ? [anchor] : [], replacement, scheduledDays, onClose, onSaved,
}: AddItineraryPlaceSheetProps) {
  const [tab, setTab] = useState<Tab>("recommended");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<PlaceListResult>();
  const [saved, setSaved] = useState<PlaceListResult>();
  const [searched, setSearched] = useState<PlaceListResult & { term: string }>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [addedCount, setAddedCount] = useState(0);
  const saving = useRef(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const term = query.trim();
  const latitude = anchor?.latitude;
  const longitude = anchor?.longitude;
  const sameCategory = replacement?.category === "OTHER" ? undefined : replacement?.category;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void loadRecommendations(tripId, latitude, longitude, sameCategory, signal).then(
      (places) => { if (!signal.aborted) setRecommended({ places }); },
      () => { if (!signal.aborted) setRecommended({ places: [], failed: true }); },
    );
    void Promise.all([getSavedPlaces(tripId, signal), getTripCity(city, signal)]).then(
      ([response, destination]) => {
        if (signal.aborted) return;
        const places = savedPlacesForTripCity(response.places, destination).filter(
          (place): place is SavedPlaceResponse & { placeId: string } => place.matchStatus === "MATCHED" && Boolean(place.placeId),
        );
        setSaved({ places });
      },
      () => { if (!signal.aborted) setSaved({ places: [], failed: true }); },
    );
    return () => controller.abort();
  }, [tripId, city, latitude, longitude, sameCategory, attempt]);

  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const { signal } = controller;
    const timer = window.setTimeout(() => {
      void searchPlaces(tripId, term, signal).then(
        (places) => { if (!signal.aborted) setSearched({ term, places: places.map(fromCandidate) }); },
        () => { if (!signal.aborted) setSearched({ term, places: [], failed: true }); },
      );
    }, 280);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [tripId, term, attempt]);

  const list = term ? searched?.term === term ? searched : undefined : tab === "saved" ? saved : recommended;
  const uniquePlaces = new Map(list?.places.map((place) => [place.placeId, place]));
  const filtered = [...uniquePlaces.values()].filter((place) => (
    term || tab === "saved" || (!scheduledDays.has(place.placeId)
      && (tab === "recommended" || categoryTab[place.category ?? "OTHER"] === tab))
  ));
  const nearestByPlace = new Map(filtered.map((place) => [place.placeId, nearestStop(place, stops)]));
  if (stops.length && !term && tab !== "saved") {
    filtered.sort((a, b) => (nearestByPlace.get(a.placeId)?.meters ?? Infinity) - (nearestByPlace.get(b.placeId)?.meters ?? Infinity));
  }
  const idsToSave = selected.filter((placeId) => !scheduledDays.has(placeId));
  // The reference shows five full cards (three for search). A selected card's
  // outline adds one pixel; an already-scheduled card has no outline.
  const previewRows = filtered.slice(0, term ? 3 : 5);
  const restingHeight = previewRows.reduce((height, place) => {
    if (scheduledDays.has(place.placeId)) return height - 2;
    return selected.includes(place.placeId) ? height + 1 : height;
  }, term ? 501 : 716);

  function toggle(placeId: string) {
    setError("");
    setSelected((current) => {
      if (current.includes(placeId)) return current.filter((id) => id !== placeId);
      return replacement ? [placeId] : [...current, placeId];
    });
  }

  async function addSelectedPlaces() {
    if (!idsToSave.length || saving.current) return;
    saving.current = true;
    setPending(true);
    setError("");
    const addedIds: string[] = [];
    let itinerary: ItineraryVersionView | undefined;
    try {
      if (replacement) {
        await replacement.onSave(idsToSave[0]);
        return;
      }
      for (const placeId of idsToSave) {
        try {
          itinerary = await addPlaceOnDate(tripId, placeId, day, date);
        } catch (reason) {
          const latest = await getLatestItinerary(tripId).catch(() => undefined);
          if (!latest) throw reason;
          itinerary = latest;
          const alreadyIn = latest.draft.days.find((item) => item.visits.some((visit) => visit.placeId === placeId));
          if (alreadyIn && alreadyIn.date !== date) {
            throw new Error("다른 일차에 이미 추가된 장소예요. 최신 일정으로 갱신했어요.");
          }
          if (!alreadyIn) throw reason;
        }
        addedIds.push(placeId);
      }
    } catch (reason) {
      setError(placeDayError(reason));
    } finally {
      if (itinerary) {
        const { places } = await getSavedPlaces(tripId).catch(() => ({ places: undefined }));
        const completed = addedIds.length === idsToSave.length;
        setAddedCount((count) => count + addedIds.length);
        setSelected((current) => current.filter((id) => !addedIds.includes(id)));
        onSaved?.(itinerary, addedIds, places, completed);
      }
      saving.current = false;
      setPending(false);
    }
  }

  const buttonLabel = replacement
    ? pending ? "장소를 바꾸고 있어요" : idsToSave.length ? "선택한 장소로 바꾸기" : "바꿀 장소를 골라주세요"
    : pending ? "장소를 추가하고 있어요" : idsToSave.length ? `${idsToSave.length}곳을 ${day}일차에 추가` : "추가할 장소를 골라주세요";

  return (
    <S.Sheet
      title={replacement ? "비슷한 곳으로 바꾸기" : `${day}일차에 장소 추가`}
      variant="course"
      contentGap={0}
      $searching={Boolean(term)}
      courseHeight={restingHeight}
      closeIcon={closeIcon}
      onClose={onClose}
      closeDisabled={pending}
      footer={<>
        {error && <ErrorText role="alert">{addedCount ? `${addedCount}곳을 추가했어요. ` : ""}{error}</ErrorText>}
        <S.Save type="button" disabled={!idsToSave.length || pending} onClick={() => void addSelectedPlaces()}>
          {buttonLabel}
        </S.Save>
      </>}
    >
      <S.Content aria-busy={pending}>
        <S.Search data-query={Boolean(term)}>
          <img src={searchIcon} alt="" />
          <input ref={searchInput} aria-label="장소, 맛집, 숙소 검색" placeholder="장소, 맛집, 숙소 검색"
            value={query} disabled={pending} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" aria-label="검색어 지우기" disabled={pending}
            onClick={() => { setQuery(""); searchInput.current?.focus(); }}><img src={clearIcon} alt="" /></button>}
        </S.Search>
        {!term && <S.Tabs aria-label="장소 분류">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" data-saved={id === "saved" || undefined} aria-pressed={tab === id} disabled={pending} onClick={() => setTab(id)}>
              {id === "saved" && tab === "saved" && <img src={googleMapsLogo} alt="" />}
              {label}
            </button>
          ))}
        </S.Tabs>}
        {list && !list.failed && (term ? <S.Caption>검색 결과 {filtered.length}곳</S.Caption>
          : tab === "saved" ? <S.Caption><img src={googleMapsLogo} alt="" />
            <span>Google Maps에 저장한 {city} 장소 <b>{filtered.length}곳</b></span></S.Caption>
            : <S.Caption>{anchor ? "지금 동선에서 가까운 순" : "인기 장소"}</S.Caption>)}
        <S.Results key={term || tab}>
          {!list ? <p role="status">장소를 불러오고 있어요.</p> : list.failed ? <>
            <p role="alert">장소를 불러오지 못했어요.</p>
            <button type="button" onClick={() => setAttempt((current) => current + 1)}>다시 불러오기</button>
          </> : !filtered.length ? <p>{term ? "검색 결과가 없어요." : "표시할 장소가 없어요."}</p> : filtered.map((place) => {
            const addedDay = scheduledDays.get(place.placeId);
            const checked = selected.includes(place.placeId);
            const category = tabs.find(([id]) => id === categoryTab[place.category ?? "OTHER"])?.[1];
            const description = addedDay ? `이미 ${addedDay}일차에 있어요` : rowDescription(place, nearestByPlace.get(place.placeId));
            const content = <>
              <span className="picker-photo">
                <PlaceThumbnail placeId={place.placeId} name={place.name} />
              </span>
              <S.Copy><strong>{place.name}</strong><small>
                {category && category !== "추천" && <>{category}{description && <i aria-hidden="true" />}</>}
                {description && <span>{description}</span>}
              </small></S.Copy>
              {!addedDay && <img src={checked ? selectedIcon : unselectedIcon} alt="" />}
            </>;
            return addedDay
              ? <S.Row key={place.placeId} data-scheduled="true">{content}</S.Row>
              : <S.Row as="button" key={place.placeId} type="button" aria-pressed={checked} disabled={pending}
                onClick={() => toggle(place.placeId)}>{content}</S.Row>;
          })}
        </S.Results>
      </S.Content>
    </S.Sheet>
  );
}
