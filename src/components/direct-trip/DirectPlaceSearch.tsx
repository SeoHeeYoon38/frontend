import { useEffect, useRef, useState } from "react";
import { addSavedPlace, enrichSavedPlaces, getPopularPlaces, getSavedPlaces, importSharedList, searchPlaces, uploadTakeout } from "../../api/places";
import type { PlaceCandidate, PlaceCategoryCode, PopularPlaceResponse, SavedPlaceResponse } from "../../api/types";
import { PlaceThumbnail } from "../common/PlacePhoto";
import PlaceImportForm, { type PlaceImportInput } from "../trip/PlaceImportForm";
import type { DirectTripPlace } from "../../types/directTrip";
import googleMapsLogo from "../../assets/images/brand-google-maps.webp";
import backIcon from "../../assets/figma/direct-search/back.svg";
import searchIcon from "../../assets/figma/direct-search/search.svg";
import dayChevron from "../../assets/figma/direct-search/day-chevron.svg";
import selectedIcon from "../../assets/figma/direct-search/selected.svg";
import clearIcon from "../../assets/figma/direct-search/clear.svg";
import removeIcon from "../../assets/figma/direct-search/remove.svg";
import sheetCloseIcon from "../../assets/figma/direct-search/sheet-close.svg";
import * as S from "./DirectPlaceSearch.styled";

type SearchTab = "recommended" | "saved";
type Category = "ALL" | "FOOD" | "CAFE" | "SIGHTSEEING" | "SHOPPING";
type Choice = {
  placeId: string;
  name: string;
  address: string;
  category?: PlaceCategoryCode | null;
  saved?: SavedPlaceResponse;
  demo?: DirectTripPlace;
  source: "saved" | "popular" | "search";
};

interface DayOption {
  day: number;
  date: string;
  weekday: string;
  placeCount: number;
}

interface DirectPlaceSearchProps {
  tripId?: number;
  city: string;
  selectedDay: number;
  days: DayOption[];
  pickedPlaceIds: Set<string>;
  demoPlaces?: DirectTripPlace[];
  demoGoogleUnlinked?: boolean;
  initialQuery?: string;
  onSelectDay: (day: number) => void;
  onAddLive: (places: SavedPlaceResponse[]) => void;
  onAddDemo: (placeIds: string[]) => void;
  onClose: () => void;
}

const categoryFilters: Array<{ value: Category; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "FOOD", label: "맛집" },
  { value: "CAFE", label: "카페" },
  { value: "SIGHTSEEING", label: "관광" },
  { value: "SHOPPING", label: "쇼핑" },
];

const categoryLabels: Partial<Record<PlaceCategoryCode, string>> = {
  FOOD: "맛집", CAFE: "카페", SIGHTSEEING: "관광", SHOPPING: "쇼핑",
  NATURE: "자연", CULTURE: "문화", NIGHTLIFE: "야경", ACTIVITY: "체험", OTHER: "기타",
};

function categoryMatches(value: PlaceCategoryCode | null | undefined, filter: Category) {
  if (filter === "ALL") return true;
  if (filter === "SIGHTSEEING") return value === "SIGHTSEEING" || value === "NATURE" || value === "CULTURE";
  return value === filter;
}

function savedChoice(place: SavedPlaceResponse): Choice | null {
  if (!place.placeId || place.matchStatus !== "MATCHED") return null;
  return {
    placeId: place.placeId,
    name: place.name,
    address: place.address ?? "",
    category: place.category,
    saved: place,
    source: "saved",
  };
}

function popularChoice(place: PopularPlaceResponse): Choice {
  return {
    placeId: place.placeId,
    name: place.name,
    address: place.address ?? "",
    category: place.category,
    source: "popular",
  };
}

function candidateChoice(place: PlaceCandidate): Choice {
  return {
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    category: place.category,
    source: "search",
  };
}

function demoChoice(place: DirectTripPlace): Choice {
  const label = place.category;
  const category: PlaceCategoryCode = /카페|디저트/.test(label) ? "CAFE"
    : /맛집|라멘|시장/.test(label) ? "FOOD"
      : /쇼핑/.test(label) ? "SHOPPING" : "SIGHTSEEING";
  return {
    placeId: place.id,
    name: place.name,
    address: place.detail,
    category,
    demo: place,
    source: place.source === "google" ? "saved" : "popular",
  };
}

const recentKey = (city: string) => `dotlo:direct-place-search:${city}`;

function readRecent(city: string) {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(recentKey(city)) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

export default function DirectPlaceSearch({
  tripId, city, selectedDay, days, pickedPlaceIds, demoPlaces, demoGoogleUnlinked = false, initialQuery = "",
  onSelectDay, onAddLive, onAddDemo, onClose,
}: DirectPlaceSearchProps) {
  const live = tripId !== undefined;
  const [tab, setTab] = useState<SearchTab>(demoGoogleUnlinked ? "saved" : "recommended");
  const [category, setCategory] = useState<Category>("ALL");
  const [query, setQuery] = useState(initialQuery);
  const [saved, setSaved] = useState<SavedPlaceResponse[]>();
  const [popular, setPopular] = useState<PopularPlaceResponse[]>();
  const [searchResult, setSearchResult] = useState<{ query: string; places: PlaceCandidate[] }>();
  const [selected, setSelected] = useState<Choice[]>([]);
  const [recent, setRecent] = useState(() => readRecent(city));
  const [showDays, setShowDays] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [demoLinked, setDemoLinked] = useState(!demoGoogleUnlinked);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [reload, setReload] = useState(0);
  const savePending = useRef(false);

  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    void Promise.allSettled([
      getSavedPlaces(tripId, controller.signal),
      getPopularPlaces(tripId, controller.signal),
    ]).then(([savedResult, popularResult]) => {
      if (controller.signal.aborted) return;
      if (savedResult.status === "fulfilled") setSaved(savedResult.value.places);
      else setLoadError("저장한 장소를 불러오지 못했어요.");
      if (popularResult.status === "fulfilled") setPopular(popularResult.value);
      else setLoadError((current) => current || "추천 장소를 불러오지 못했어요.");
    });
    return () => controller.abort();
  }, [live, tripId, reload]);

  useEffect(() => {
    const value = query.trim();
    if (!value || !live) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchError("");
      void searchPlaces(tripId, value, controller.signal).then(
        (places) => { if (!controller.signal.aborted) setSearchResult({ query: value, places }); },
        () => { if (!controller.signal.aborted) setSearchError("장소를 검색하지 못했어요. 다시 시도해 주세요."); },
      );
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [live, tripId, query]);

  function rememberSearch(value: string) {
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 5);
    setRecent(next);
    try { sessionStorage.setItem(recentKey(city), JSON.stringify(next)); } catch { /* 최근 검색은 선택 기능입니다. */ }
  }

  function toggle(choice: Choice) {
    if (pickedPlaceIds.has(choice.placeId) || busy) return;
    setSaveError("");
    setSelected((current) => current.some((item) => item.placeId === choice.placeId)
      ? current.filter((item) => item.placeId !== choice.placeId)
      : [...current, choice]);
  }

  async function addSelected() {
    if (savePending.current || !selected.length) return;
    savePending.current = true;
    setBusy(true);
    setSaveError("");
    try {
      if (!live) {
        onAddDemo(selected.map((item) => item.placeId));
        return;
      }
      let places = saved ?? [];
      const toAdd: SavedPlaceResponse[] = [];
      for (const item of selected) {
        let found = places.find((place) => place.placeId === item.placeId && place.matchStatus === "MATCHED");
        if (!found) {
          const response = await addSavedPlace(tripId, item.placeId);
          places = response.places;
          setSaved(places);
          found = places.find((place) => place.placeId === item.placeId && place.matchStatus === "MATCHED");
        }
        if (!found) throw new Error(`${item.name} 장소를 확인하지 못했어요. 다시 시도해 주세요.`);
        toAdd.push(found);
      }
      onAddLive(toAdd);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "장소를 담지 못했어요. 다시 시도해 주세요.");
    } finally {
      savePending.current = false;
      setBusy(false);
    }
  }

  async function importPlaces(input: PlaceImportInput) {
    if (savePending.current) return;
    if (!live) {
      setDemoLinked(true);
      setShowImport(false);
      return;
    }
    savePending.current = true;
    setBusy(true);
    setSaveError("");
    try {
      if (input.method === "file") await uploadTakeout(tripId, input.file);
      else await importSharedList(tripId, input.link);
      const response = await enrichSavedPlaces(tripId);
      setSaved(response.places);
      setTab("saved");
      setShowImport(false);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "장소를 가져오지 못했어요.");
    } finally {
      savePending.current = false;
      setBusy(false);
    }
  }

  const demoChoices = (demoPlaces ?? []).map(demoChoice);
  const savedChoices = live ? (saved ?? []).flatMap((place) => savedChoice(place) ?? [])
    : demoLinked ? demoChoices.filter((item) => item.source === "saved") : [];
  const popularChoices = live ? (popular ?? []).map(popularChoice)
    : demoChoices.filter((item) => item.source === "popular");
  const normalizedQuery = query.trim().toLowerCase();
  const matchingSaved = savedChoices.filter((item) =>
    `${item.name} ${item.address}`.toLowerCase().includes(normalizedQuery));
  const resultsReady = !live || searchResult?.query === query.trim();
  const foundChoices = live ? (resultsReady ? (searchResult?.places ?? []).map(candidateChoice) : [])
    : demoChoices.filter((item) => `${item.name} ${item.address}`.toLowerCase().includes(normalizedQuery));
  const resultChoices = foundChoices.filter((item) => !matchingSaved.some((savedItem) => savedItem.placeId === item.placeId));
  const filteredSaved = savedChoices.filter((item) => categoryMatches(item.category, category));
  const day = days.find((item) => item.day === selectedDay);

  function placeRow(item: Choice) {
    const checked = selected.some((choice) => choice.placeId === item.placeId);
    const alreadyAdded = pickedPlaceIds.has(item.placeId);
    return (
      <S.PlaceRow key={`${item.source}-${item.placeId}`} type="button"
        aria-pressed={checked || alreadyAdded} disabled={alreadyAdded || busy} onClick={() => toggle(item)}>
        <S.Thumbnail>
          {item.demo?.image ? <img src={item.demo.image} alt="" />
            : <PlaceThumbnail placeId={item.placeId} name={item.name} />}
        </S.Thumbnail>
        <S.PlaceInfo>
          <strong>{item.name}</strong>
          <small>{item.source === "saved" && <img src={googleMapsLogo} alt="" />}
            {categoryLabels[item.category ?? "OTHER"] ?? "장소"}
            {item.address && <><i aria-hidden="true" />{item.address}</>}
          </small>
        </S.PlaceInfo>
        <S.SelectIndicator $checked={checked || alreadyAdded}>
          {(checked || alreadyAdded) && <img src={selectedIcon} alt="" />}
        </S.SelectIndicator>
      </S.PlaceRow>
    );
  }

  return (
    <S.Screen>
      {showImport ? (
        <>
          <S.ImportBack type="button" onClick={() => setShowImport(false)} aria-label="장소 검색으로 돌아가기"><img src={backIcon} alt="" /></S.ImportBack>
          <S.ImportContent><PlaceImportForm onImport={importPlaces} onSkip={() => setShowImport(false)} busy={busy} importError={saveError} /></S.ImportContent>
        </>
      ) : (
        <>
          <S.Header>
            <button type="button" onClick={onClose} aria-label="일정으로 돌아가기"><img src={backIcon} alt="" /></button>
            <S.SearchField>
              <img src={searchIcon} alt="" />
              <input autoFocus aria-label="장소 검색" placeholder="어디를 담을까요?" value={query}
                onChange={(event) => { setQuery(event.target.value); setSearchResult(undefined); setSearchError(""); }}
                onKeyDown={(event) => { if (event.key === "Enter" && query.trim()) rememberSearch(query.trim()); }} />
              {query && <button type="button" aria-label="검색어 지우기" onClick={() => { setQuery(""); setSearchResult(undefined); }}><img src={clearIcon} alt="" /></button>}
            </S.SearchField>
          </S.Header>
          <S.TargetDay>
            <button type="button" onClick={() => setShowDays(true)} aria-expanded={showDays}>
              {selectedDay}일차 {day?.date}<img src={dayChevron} alt="" />
            </button>
            <span>에 담아요</span>
          </S.TargetDay>
          {!normalizedQuery && <S.Tabs role="tablist" aria-label="장소 찾기 방법">
            <button type="button" role="tab" aria-selected={tab === "recommended"} onClick={() => setTab("recommended")}>추천</button>
            <button type="button" role="tab" aria-selected={tab === "saved"} onClick={() => setTab("saved")}><img src={googleMapsLogo} alt="" />Google Maps 저장 {savedChoices.length || ""}</button>
          </S.Tabs>}
          <S.Scroll>
            {loadError && <S.Error role="alert">{loadError} <button type="button" onClick={() => { setLoadError(""); setReload((current) => current + 1); }}>다시 불러오기</button></S.Error>}
            {searchError && <S.Error role="alert">{searchError}</S.Error>}
            {normalizedQuery ? (
              <>
                {matchingSaved.length > 0 && <S.Section><h2>Google Maps에 저장한 곳</h2>{matchingSaved.map(placeRow)}</S.Section>}
                {!resultsReady && <S.State role="status">장소를 검색하고 있어요.</S.State>}
                {resultsReady && resultChoices.length > 0 && <S.Section><h2>검색 결과 {resultChoices.length}</h2>{resultChoices.map(placeRow)}</S.Section>}
                {resultsReady && !matchingSaved.length && !resultChoices.length && !searchError && <S.EmptyResult>
                  <span><img src={searchIcon} alt="" /></span><h2>검색 결과가 없어요</h2><p>철자를 확인하거나 다른 이름으로 검색해 보세요</p>
                </S.EmptyResult>}
              </>
            ) : tab === "recommended" ? (
              <>
                {recent.length > 0 && <S.Section><S.SectionHead><h2>최근 검색</h2><button type="button" onClick={() => { setRecent([]); try { sessionStorage.removeItem(recentKey(city)); } catch { /* 선택 기능 */ } }}>전체 삭제</button></S.SectionHead>
                  <S.Recent>{recent.map((value) => <button type="button" key={value} onClick={() => setQuery(value)}>{value}<img src={removeIcon} alt="" /></button>)}</S.Recent>
                </S.Section>}
                <S.Section><h2>{city}에서 많이 담는 곳</h2>
                  {live && !popular && !loadError && <S.State role="status">추천 장소를 불러오고 있어요.</S.State>}
                  {popularChoices.map(placeRow)}
                  {popularChoices.length === 0 && (popular || !live) && <S.State>아직 추천 장소가 없어요. 장소 이름을 검색해 보세요.</S.State>}
                </S.Section>
              </>
            ) : live && !saved && !loadError ? <S.State role="status">저장한 장소를 불러오고 있어요.</S.State> : savedChoices.length > 0 ? (
              <>
                <S.Categories aria-label="저장 장소 카테고리">{categoryFilters.map(({ value, label }) => (
                  <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>
                    {label} {value === "ALL" ? savedChoices.length : savedChoices.filter((item) => categoryMatches(item.category, value)).length}
                  </button>
                ))}</S.Categories>
                <S.Section>{filteredSaved.map(placeRow)}{filteredSaved.length === 0 && <S.State>이 카테고리에 저장한 장소가 없어요.</S.State>}</S.Section>
              </>
            ) : (
              <S.EmptyResult>
                <span><img src={googleMapsLogo} alt="" /></span>
                <h2>Google Maps 장소를 불러올까요?</h2>
                <p>저장해 둔 맛집, 카페를 바로 일정에 담을 수 있어요</p>
                <button type="button" onClick={() => setShowImport(true)}><img src={googleMapsLogo} alt="" />Google Maps 연결하기</button>
              </S.EmptyResult>
            )}
          </S.Scroll>
          <S.Footer>
            {selected.length > 0 && <S.SelectedPlaces>{selected.map((item) => <button type="button" key={item.placeId} onClick={() => toggle(item)}>{item.name}<img src={removeIcon} alt="" /></button>)}</S.SelectedPlaces>}
            {saveError && <S.Error role="alert">{saveError}</S.Error>}
            <button className="primary" type="button" disabled={!selected.length || busy} onClick={() => void addSelected()}>
              {busy ? "장소를 담고 있어요" : selected.length ? `${selected.length}곳을 ${selectedDay}일차에 담기` : "담을 장소를 골라주세요"}
            </button>
          </S.Footer>
          {showDays && <S.DayOverlay onMouseDown={() => setShowDays(false)}>
            <S.DaySheet role="dialog" aria-modal="true" aria-label="장소를 담을 날 선택" onMouseDown={(event) => event.stopPropagation()}>
              <span className="grabber" /><header><h2>어느 날에 담을까요?</h2><button type="button" onClick={() => setShowDays(false)} aria-label="닫기"><img src={sheetCloseIcon} alt="" /></button></header>
              {days.map((item) => <button type="button" className="day-row" key={item.day} aria-pressed={item.day === selectedDay} onClick={() => { onSelectDay(item.day); setShowDays(false); }}>
                <span><strong>{item.day}일차 <em>{item.date} {item.weekday}</em></strong><small>{item.placeCount ? `담은 장소 ${item.placeCount}곳` : "아직 담은 장소가 없어요"}</small></span>
                <S.SelectIndicator $checked={item.day === selectedDay}>{item.day === selectedDay && <img src={selectedIcon} alt="" />}</S.SelectIndicator>
              </button>)}
            </S.DaySheet>
          </S.DayOverlay>}
        </>
      )}
    </S.Screen>
  );
}
