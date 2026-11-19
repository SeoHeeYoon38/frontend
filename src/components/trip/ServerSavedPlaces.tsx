import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  addSavedPlace,
  deleteSavedPlace,
  enrichSavedPlaces,
  getSavedPlaces,
  importSharedList,
  matchSavedPlace,
  searchPlaces,
  uploadTakeout,
} from "../../api/places";
import { getTripCity } from "../../api/trips";
import type { CityResponse, PlaceCandidate, SavedPlaceResponse } from "../../api/types";
import { isMapCoordinate } from "../../utils/googleMaps";
import { savedPlaceCategoryLabels, savedPlacesForTripCity } from "../../utils/tripPlaces";
import PlaceImportForm, { type PlaceImportInput, type PlaceImportView } from "./PlaceImportForm";
import SavedPlacesEmptyState from "./SavedPlacesEmptyState";
import ServerRecommendedCourses from "./ServerRecommendedCourses";
import { PlaceThumbnail } from "../common/PlacePhoto";
import googleMapsLogo from "../../assets/images/brand-google-maps.webp";
import foodIcon from "../../assets/icons/category-food.svg";
import cafeIcon from "../../assets/icons/category-cafe.svg";
import sightseeingIcon from "../../assets/icons/category-sightseeing.svg";
import shoppingIcon from "../../assets/icons/category-shopping.svg";
import * as S from "./Trip.styled";
import * as P from "./SavedPlacesStep.styled";

type CategoryFilter = "ALL" | "FOOD" | "CAFE" | "SIGHTSEEING" | "SHOPPING";

const categoryFilters: Array<{ value: CategoryFilter; label: string; icon?: string }> = [
  { value: "ALL", label: "전체" },
  { value: "FOOD", label: "맛집", icon: foodIcon },
  { value: "CAFE", label: "카페", icon: cafeIcon },
  { value: "SIGHTSEEING", label: "명소", icon: sightseeingIcon },
  { value: "SHOPPING", label: "쇼핑", icon: shoppingIcon },
];

const coordinateName = /^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/;

async function loadSavedPlaces(tripId: number, cityName: string | undefined, signal: AbortSignal) {
  const [response, city] = await Promise.all([
    getSavedPlaces(tripId, signal),
    cityName ? getTripCity(cityName, signal) : undefined,
  ]);
  return { places: response.places, city };
}

interface ServerSavedPlacesProps {
  tripId: number;
  recommendationCity?: string;
  initialSelectedIds?: string[];
  onSelectionChange?: (places: SavedPlaceResponse[]) => void;
  onContinue?: (places: SavedPlaceResponse[]) => void;
  onPick?: (place: SavedPlaceResponse) => void;
  onPickMany?: (places: SavedPlaceResponse[]) => void;
  pickDay?: number;
  pickedPlaceIds?: Set<string>;
  pickLabel?: string;
  pickedLabel?: string;
  importView?: PlaceImportView;
  onImportViewChange?: (view: PlaceImportView) => void;
  onLoadingChange?: (loading: boolean) => void;
  onTripError?: (reason: unknown) => boolean;
}

function ServerSavedPlaces({
  tripId, recommendationCity, initialSelectedIds, onSelectionChange, onContinue, onPick, onPickMany, pickDay, pickedPlaceIds,
  pickLabel = "일정에 담기", pickedLabel = "이날 일정에 담았어요", importView, onImportViewChange, onLoadingChange, onTripError,
}: ServerSavedPlacesProps) {
  const isTripCreation = Boolean(onContinue);
  const [places, setPlaces] = useState<SavedPlaceResponse[]>();
  const [city, setCity] = useState<CityResponse>();
  const [selectedIds, setSelectedIds] = useState<number[]>(() => initialSelectedIds?.map(Number) ?? []);
  const [tab, setTab] = useState<"saved" | "popular" | "recommended">("saved");
  const [showPopularTab, setShowPopularTab] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceCandidate[]>();
  const [matchId, setMatchId] = useState<number>();
  const [showImport, setShowImport] = useState(false);
  const [busy, setBusy] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState("");
  const [importNotice, setImportNotice] = useState("");
  const request = useRef<AbortController | null>(null);
  const handleLoadError = useEffectEvent((reason: unknown) => {
    if (!onTripError?.(reason)) setError("저장 장소를 불러오지 못했어요.");
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void loadSavedPlaces(tripId, recommendationCity, signal).then(
      (response) => {
        if (!signal.aborted) {
          setCity(response.city);
          setPlaces(response.places);
          const currentPlaces = response.city ? savedPlacesForTripCity(response.places, response.city) : response.places;
          setShowImport(isTripCreation && currentPlaces.length === 0);
        }
      },
      (reason: unknown) => { if (!signal.aborted) handleLoadError(reason); },
    );
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, [tripId, isTripCreation, recommendationCity]);

  function openImport() {
    setError("");
    onImportViewChange?.("method");
    setShowImport(true);
  }

  async function run(action: (signal: AbortSignal) => Promise<void>) {
    if (request.current) return false;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    try {
      await action(controller.signal);
      return !controller.signal.aborted;
    } catch (reason) {
      if (!controller.signal.aborted && !onTripError?.(reason)) {
        setError(reason instanceof Error ? reason.message : "장소 요청을 처리하지 못했어요.");
      }
      return false;
    } finally {
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  async function importPlaces(input: PlaceImportInput) {
    await run(async (signal) => {
      setImportNotice("");
      const imported = input.method === "file"
        ? await uploadTakeout(tripId, input.file, signal)
        : await importSharedList(tripId, input.link, signal);
      setEnriching(true);
      onLoadingChange?.(true);
      try {
        const response = await enrichSavedPlaces(tripId, signal);
        if (!signal.aborted) {
          setPlaces(response.places);
          setImportNotice(imported.totalNewCount > 0
            ? `새 장소 ${imported.totalNewCount}곳을 가져왔어요.`
            : "가져오기를 완료했어요. 새로 추가된 장소는 없어요.");
          setShowPopularTab(false);
          setTab("saved");
          onImportViewChange?.("method");
          setShowImport(false);
        }
      } finally {
        setEnriching(false);
        onLoadingChange?.(false);
      }
    });
  }

  function chooseResult(candidate: PlaceCandidate) {
    return run(async (signal) => {
      const response = matchId === undefined
        ? await addSavedPlace(tripId, candidate.placeId, signal)
        : await matchSavedPlace(tripId, matchId, candidate.placeId, signal);
      if (signal.aborted) return;
      setPlaces(response.places);
      setResults(undefined);
      setQuery("");
      setMatchId(undefined);
    });
  }

  const cityPlaces = places && (!recommendationCity
    ? places
    : city?.name === recommendationCity ? savedPlacesForTripCity(places, city) : undefined);
  const cityPlaceCount = city ? cityPlaces?.filter(isMapCoordinate).length : cityPlaces?.length;
  const selectablePlaces = (cityPlaces ?? []).filter((place) =>
    place.matchStatus === "MATCHED" && place.placeId && !pickedPlaceIds?.has(place.placeId));
  const visiblePlaces = (cityPlaces ?? []).filter((place) =>
    category === "ALL" || place.category === category);
  const selection = selectablePlaces.filter((place) => selectedIds.includes(place.id));
  const canContinue = selection.length > 0;
  const emptySavedList = tab === "saved" && cityPlaces?.length === 0;
  const allSelected = selectablePlaces.length > 0 && selectablePlaces.every((place) => selectedIds.includes(place.id));

  const rememberSelection = useEffectEvent(() => {
    if (cityPlaces) onSelectionChange?.(selection);
  });
  useEffect(() => {
    rememberSelection();
  }, [selectedIds, places, city]);

  function openRecommended() {
    setError("");
    if (isTripCreation && cityPlaces?.length === 0) setShowPopularTab(true);
    setTab("recommended");
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? selectablePlaces.map((place) => place.id) : []);
  }

  function addRecommended(ids: string[], deselected: string[] = []) {
    if (!places) return Promise.resolve(false);
    return run(async (signal) => {
      let latest = places;
      for (const id of ids) {
        if (!latest.some((place) => place.placeId === id)) {
          const response = await addSavedPlace(tripId, id, signal);
          if (signal.aborted) return;
          latest = response.places;
          setPlaces(latest);
        }
        if ((isTripCreation || onPickMany) && !pickedPlaceIds?.has(id)) {
          const saved = latest.find((place) => place.placeId === id && place.matchStatus === "MATCHED");
          if (saved) setSelectedIds((current) => current.includes(saved.id) ? current : [...current, saved.id]);
        }
      }
      const currentPlaces = city ? savedPlacesForTripCity(latest, city) : latest;
      if (ids.some((id) => !currentPlaces.some((place) => place.placeId === id && place.matchStatus === "MATCHED"))) {
        throw new Error("일부 장소를 일정에 담을 수 없어요. 저장 장소에서 장소 상태를 확인해 주세요.");
      }
      if (deselected.length) {
        const removed = new Set(latest.filter(place => place.placeId && deselected.includes(place.placeId)).map(place => place.id));
        setSelectedIds(current => current.filter(id => !removed.has(id)));
      }
    });
  }

  function toggleRecommended(placeId: string) {
    const picked = selection.find((place) => place.placeId === placeId);
    if (picked) {
      setSelectedIds((current) => current.filter((id) => id !== picked.id));
      return;
    }
    void addRecommended([placeId]);
  }

  if (showImport) {
    return (
      <P.ConnectStep>
        <PlaceImportForm
          onImport={importPlaces}
          onSkip={() => {
            setShowPopularTab(false);
            setTab("saved");
            onImportViewChange?.("method");
            setShowImport(false);
          }}
          busy={busy}
          enriching={enriching}
          importError={error}
          view={importView}
          onViewChange={onImportViewChange}
        />
      </P.ConnectStep>
    );
  }

  return (
    <P.PlacesStep $empty={emptySavedList} aria-busy={busy}>
      {onContinue && (
        <P.PlacesLead>
          <h1>여행에 담을 장소를 골라주세요</h1>
          <P.PlacesSummary>
            {tab === "saved" ? (
              <p><img src={googleMapsLogo} alt="" />Google Maps에 저장한 장소를 불러왔어요</p>
            ) : <p>코스에 포함된 장소를 확인하고 선택해 보세요</p>}
            {cityPlaces && <P.PlaceSearchButton type="button" disabled={busy} onClick={openImport} aria-label="Google Maps에서 장소 가져오기">
              가져오기
            </P.PlaceSearchButton>}
          </P.PlacesSummary>
        </P.PlacesLead>
      )}
      {!onContinue && <P.PlacesTitle>저장 장소</P.PlacesTitle>}
      {recommendationCity && (
        <P.PlaceTabs aria-label="장소 선택 방법">
          <button type="button" aria-pressed={tab === (showPopularTab ? "popular" : "saved")} disabled={busy} onClick={() => { setError(""); setTab(showPopularTab ? "popular" : "saved"); }}>
            {showPopularTab ? "인기 장소" : "저장 장소"}
          </button>
          <button type="button" aria-pressed={tab === "recommended"} disabled={busy} onClick={openRecommended}>
            추천 코스
          </button>
        </P.PlaceTabs>
      )}
      {importNotice && <p role="status">{importNotice}</p>}
      {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
      {!cityPlaces && !error && <p role="status">저장 장소를 불러오고 있어요.</p>}
      {!cityPlaces && error && (
        <P.MatchButton type="button" disabled={busy} onClick={() => void run(async (signal) => {
          const response = await loadSavedPlaces(tripId, recommendationCity, signal);
          if (!signal.aborted) {
            setPlaces(response.places);
            setCity(response.city);
          }
        })}>다시 불러오기</P.MatchButton>
      )}
      {cityPlaces && tab !== "saved" && city && (
        <ServerRecommendedCourses
          city={city}
          tripId={tripId}
          view={tab}
          selectedPlaces={selection}
          busy={busy}
          saveError={error}
          onOpen={() => setError("")}
          onAdd={addRecommended}
          onToggle={toggleRecommended}
        />
      )}
      {cityPlaces && tab === "saved" && (
        <>
          {emptySavedList && (isTripCreation && recommendationCity
            ? <SavedPlacesEmptyState city={recommendationCity} />
            : <p>{recommendationCity ? `${recommendationCity}에 저장한 장소가 없어요.` : "저장된 장소가 없어요."}</p>)}
          {cityPlaces.length > 0 && (
            <>
              <P.PlacesSummary>
                <span>{recommendationCity ?? "여행지"}에 저장한 장소 <b>{cityPlaceCount}곳</b></span>
                {(onContinue || onPickMany) && (
                  <label>
                    <P.Checkbox
                      type="checkbox"
                      checked={allSelected}
                      disabled={busy || selectablePlaces.length === 0}
                      aria-label="저장 장소 전체 선택"
                      onChange={(event) => toggleAll(event.currentTarget.checked)}
                    />
                    전체 선택
                  </label>
                )}
              </P.PlacesSummary>
              <P.Categories aria-label="장소 카테고리">
                {categoryFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={category === filter.value}
                    onClick={() => setCategory(filter.value)}
                  >
                    {filter.icon && <img src={filter.icon} alt="" />}
                    {filter.label}
                  </button>
                ))}
              </P.Categories>
            </>
          )}
          <P.PlaceList>
            {visiblePlaces.map((place) => (
              <P.PlaceRow key={place.id}>
                <P.PlaceThumb>
                  {place.placeId && <PlaceThumbnail placeId={place.placeId} name={place.name} />}
                </P.PlaceThumb>
                <P.PlaceCopy>
                  <div>
                    <strong>{place.name}</strong>
                    <P.PlaceStatus>{place.matchStatus === "MATCHED" ? savedPlaceCategoryLabels[place.category ?? "OTHER"] : place.matchStatus === "CLOSED" ? "폐업" : place.matchStatus === "OUT_OF_CITY" ? "여행 도시 밖" : "확인 필요"}</P.PlaceStatus>
                  </div>
                  <p>{place.note || place.address || "저장한 장소"}</p>
                </P.PlaceCopy>
                {onPick && place.matchStatus === "MATCHED" && place.placeId && (
                  <P.MatchButton
                    type="button"
                    disabled={busy || pickedPlaceIds?.has(place.placeId)}
                    onClick={() => onPick(place)}
                  >
                    {pickedPlaceIds?.has(place.placeId) ? pickedLabel : pickLabel}
                  </P.MatchButton>
                )}
                {onPickMany && place.matchStatus === "MATCHED" && place.placeId && (
                  <P.Checkbox
                    type="checkbox"
                    aria-label={`${place.name} 선택`}
                    checked={pickedPlaceIds?.has(place.placeId) || selectedIds.includes(place.id)}
                    disabled={busy || pickedPlaceIds?.has(place.placeId)}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      setSelectedIds((current) => checked
                        ? [...current, place.id]
                        : current.filter((id) => id !== place.id));
                    }}
                  />
                )}
                {onContinue && place.matchStatus === "MATCHED" && place.placeId && (
                  <P.Checkbox
                    type="checkbox"
                    aria-label={`${place.name} 선택`}
                    checked={selectedIds.includes(place.id)}
                    disabled={busy}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      setSelectedIds((current) => checked
                        ? [...current, place.id]
                        : current.filter((id) => id !== place.id));
                    }}
                  />
                )}
                {["PENDING", "NEEDS_REVIEW", "NOT_FOUND"].includes(place.matchStatus) && (
                  <P.InlineActions>
                    <P.MatchButton type="button" disabled={busy} onClick={() => {
                      setMatchId(place.id);
                      setQuery(coordinateName.test(place.name) ? "" : place.name);
                      setResults(undefined);
                    }}>장소 확인</P.MatchButton>
                    <P.MatchButton type="button" disabled={busy} aria-label={`${place.name} 저장 장소에서 삭제`} onClick={() => {
                      void run(async (signal) => {
                        await deleteSavedPlace(tripId, place.id, signal);
                        if (!signal.aborted) setPlaces((current) => current?.filter((item) => item.id !== place.id));
                      });
                    }}>삭제</P.MatchButton>
                  </P.InlineActions>
                )}
              </P.PlaceRow>
            ))}
          </P.PlaceList>
          {matchId !== undefined && <P.SearchSection><form onSubmit={(event) => {
            event.preventDefault();
            if (!query.trim()) return;
            void run(async (signal) => {
              const candidates = await searchPlaces(tripId, query.trim(), signal);
              if (!signal.aborted) setResults(candidates);
            });
          }}>
            <S.Search>
              <input aria-label="장소 이름 검색" placeholder="장소 이름을 검색해 보세요" value={query} disabled={busy} onChange={(event) => {
                setQuery(event.target.value);
                setResults(undefined);
              }} />
              <P.PlaceSearchButton type="submit" disabled={busy || !query.trim()}>검색</P.PlaceSearchButton>
            </S.Search>
          </form>
          <P.MatchButton type="button" disabled={busy} onClick={() => {
            setMatchId(undefined);
            setResults(undefined);
            setQuery("");
          }}>장소 확인 취소</P.MatchButton></P.SearchSection>}
          {results && (results.length ? (
            <P.PlaceList>
              {results.map((candidate) => (
                <P.PlaceRow key={candidate.placeId}>
                  <div><strong>{candidate.name}</strong><small>{candidate.address}</small></div>
                  <P.MatchButton type="button" disabled={busy} aria-label={`${candidate.name} ${matchId === undefined ? "저장 장소에 추가" : "장소 확인"}`} onClick={() => void chooseResult(candidate)}>
                    {matchId === undefined ? "추가" : "선택"}
                  </P.MatchButton>
                </P.PlaceRow>
              ))}
            </P.PlaceList>
          ) : <p role="status">검색 결과가 없어요.</p>)}
          {!onContinue && cityPlaces.length === 0 && <P.MatchButton type="button" disabled={busy} onClick={openImport}>Google Maps에서 가져오기</P.MatchButton>}
        </>
      )}
      {onContinue && (
        <S.Footer>
          {emptySavedList && recommendationCity ? (
            <S.Primary type="button" disabled={busy} onClick={openRecommended}>
              추천 코스에서 장소 고르기
            </S.Primary>
          ) : (
            <S.Primary type="button" disabled={busy || !canContinue} onClick={() => onContinue(selection)}>
              {selection.length ? `선택한 장소 ${selection.length}곳 담기` : "장소를 선택해 주세요"}
            </S.Primary>
          )}
        </S.Footer>
      )}
      {onPickMany && (
        <S.Footer><S.Primary type="button" disabled={busy || !selection.length} onClick={() => onPickMany(selection)}>
          {selection.length ? `${selection.length}곳을 ${pickDay}일차에 담기` : "담을 장소를 골라주세요"}
        </S.Primary></S.Footer>
      )}
    </P.PlacesStep>
  );
}

export default ServerSavedPlaces;
