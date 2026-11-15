import { useEffect, useRef, useState } from "react";
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
import type { PlaceCandidate, SavedPlaceResponse } from "../../api/types";
import PlaceImportForm, { type PlaceImportInput } from "./PlaceImportForm";
import ServerRecommendedCourses from "./ServerRecommendedCourses";
import * as S from "./Trip.styled";
import * as P from "./SavedPlacesStep.styled";

interface ServerSavedPlacesProps {
  tripId: number;
  recommendationCity?: string;
  onContinue?: (places: SavedPlaceResponse[]) => void;
  onPick?: (place: SavedPlaceResponse) => void;
  onPickMany?: (places: SavedPlaceResponse[]) => void;
  pickDay?: number;
  pickedPlaceIds?: Set<string>;
  pickLabel?: string;
  pickedLabel?: string;
}

function ServerSavedPlaces({
  tripId, recommendationCity, onContinue, onPick, onPickMany, pickDay, pickedPlaceIds,
  pickLabel = "일정에 담기", pickedLabel = "이날 일정에 담았어요",
}: ServerSavedPlacesProps) {
  const [places, setPlaces] = useState<SavedPlaceResponse[]>();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [tab, setTab] = useState<"saved" | "recommended">("saved");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceCandidate[]>();
  const [matchId, setMatchId] = useState<number>();
  const [showImport, setShowImport] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [importNotice, setImportNotice] = useState("");
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void getSavedPlaces(tripId, signal).then(
      (response) => {
        if (!signal.aborted) {
          setPlaces(response.places);
          setShowImport(!recommendationCity && response.places.length === 0);
        }
      },
      () => { if (!signal.aborted) setError("저장 장소를 불러오지 못했어요."); },
    );
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, [tripId, recommendationCity]);

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
      if (!controller.signal.aborted) {
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
      const response = await enrichSavedPlaces(tripId, signal);
      if (!signal.aborted) {
        setPlaces(response.places);
        setImportNotice(imported.totalNewCount > 0
          ? `새 장소 ${imported.totalNewCount}곳을 가져왔어요.`
          : "가져오기를 완료했어요. 새로 추가된 장소는 없어요.");
        setShowImport(false);
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

  const canContinue = places?.some((place) => place.matchStatus === "MATCHED" && place.placeId);
  const selection = (places ?? []).filter((place) =>
    place.matchStatus === "MATCHED" && place.placeId &&
    !pickedPlaceIds?.has(place.placeId) && selectedIds.includes(place.id),
  );

  function addRecommended(ids: string[]) {
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
        if (onPickMany && !pickedPlaceIds?.has(id)) {
          const saved = latest.find((place) => place.placeId === id && place.matchStatus === "MATCHED");
          if (saved) setSelectedIds((current) => current.includes(saved.id) ? current : [...current, saved.id]);
        }
      }
      if (ids.some((id) => !latest.some((place) => place.placeId === id && place.matchStatus === "MATCHED"))) {
        throw new Error("일부 장소를 일정에 담을 수 없어요. 저장 장소에서 장소 상태를 확인해 주세요.");
      }
    });
  }

  if (showImport) {
    return (
      <P.ConnectStep aria-busy={busy}>
        <PlaceImportForm
          onImport={importPlaces}
          onSkip={() => setShowImport(false)}
          busy={busy}
          importError={error}
        />
      </P.ConnectStep>
    );
  }

  return (
    <P.PlacesStep $empty={false} aria-busy={busy}>
      <P.PlacesTitle>저장 장소</P.PlacesTitle>
      {recommendationCity && (
        <P.PlaceTabs aria-label="장소 선택 방법">
          <button type="button" aria-pressed={tab === "saved"} disabled={busy} onClick={() => { setError(""); setTab("saved"); }}>
            {onPickMany ? "Google Maps 저장" : "저장 장소"}
          </button>
          <button type="button" aria-pressed={tab === "recommended"} disabled={busy} onClick={() => { setError(""); setTab("recommended"); }}>
            {onPickMany ? "추천" : "추천 코스"}
          </button>
        </P.PlaceTabs>
      )}
      {importNotice && <p role="status">{importNotice}</p>}
      {onContinue && <S.Subtitle>확인된 저장 장소를 바탕으로 AI 일정을 만들어요.</S.Subtitle>}
      {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
      {!places && !error && <p role="status">저장 장소를 불러오고 있어요.</p>}
      {!places && error && (
        <P.MatchButton type="button" disabled={busy} onClick={() => void run(async (signal) => {
          const response = await getSavedPlaces(tripId, signal);
          if (!signal.aborted) setPlaces(response.places);
        })}>다시 불러오기</P.MatchButton>
      )}
      {places && tab === "recommended" && recommendationCity && (
        <ServerRecommendedCourses
          city={recommendationCity}
          busy={busy}
          saveError={error}
          onOpen={() => setError("")}
          onAdd={addRecommended}
        />
      )}
      {places && tab === "saved" && (
        <>
          {places.length === 0 && <p>저장된 장소가 없어요. 장소를 검색하거나 Google Maps에서 가져와 보세요.</p>}
          <P.PlaceList>
            {places.map((place) => (
              <P.PlaceRow key={place.id}>
                <div>
                  <strong>{place.name}</strong>
                  <small>{place.address}</small>
                  {place.matchStatus !== "MATCHED" && (
                    <p>{place.matchStatus === "CLOSED" ? "폐업" : place.matchStatus === "OUT_OF_CITY" ? "여행 도시 밖" : "확인 필요"}</p>
                  )}
                </div>
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
                {["PENDING", "NEEDS_REVIEW", "NOT_FOUND"].includes(place.matchStatus) && (
                  <P.MatchButton type="button" disabled={busy} onClick={() => {
                    setMatchId(place.id);
                    setQuery(place.name);
                    setResults(undefined);
                  }}>장소 확인</P.MatchButton>
                )}
                <P.MatchButton type="button" disabled={busy} aria-label={`${place.name} 저장 장소에서 삭제`} onClick={() => {
                  void run(async (signal) => {
                    await deleteSavedPlace(tripId, place.id, signal);
                    if (signal.aborted) return;
                    setPlaces((current) => current?.filter((item) => item.id !== place.id));
                    setSelectedIds((current) => current.filter((id) => id !== place.id));
                    if (matchId === place.id) {
                      setMatchId(undefined);
                      setResults(undefined);
                      setQuery("");
                    }
                  });
                }}>삭제</P.MatchButton>
              </P.PlaceRow>
            ))}
          </P.PlaceList>
          <form onSubmit={(event) => {
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
          {matchId !== undefined && <P.MatchButton type="button" disabled={busy} onClick={() => {
            setMatchId(undefined);
            setResults(undefined);
            setQuery("");
          }}>장소 확인 취소</P.MatchButton>}
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
          <P.MatchButton type="button" disabled={busy} aria-expanded={showImport} onClick={() => setShowImport(!showImport)}>
            Google Maps에서 가져오기
          </P.MatchButton>
        </>
      )}
      {onContinue && <S.Primary type="button" disabled={busy || !canContinue} onClick={() => places && onContinue(places)}>다음</S.Primary>}
      {onPickMany && (
        <S.Primary type="button" disabled={busy || !selection.length} onClick={() => onPickMany(selection)}>
          {selection.length ? `${selection.length}곳을 ${pickDay}일차에 담기` : "담을 장소를 골라주세요"}
        </S.Primary>
      )}
    </P.PlacesStep>
  );
}

export default ServerSavedPlaces;
