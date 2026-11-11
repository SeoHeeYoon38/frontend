import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { TripDraft, TripPlace } from "../types/trip";
import {
  DRAFT_KEY,
  basicError,
  placesError,
  readDraft,
  selectedPlaces,
} from "../utils/trip";
import { generateMockTrip } from "../data/mocks/tripService";
import { mockTripCities, mockTripPlaces } from "../data/mocks/tripData";
import { routes } from "../config/routes";
import { createGeneratedTrip, saveMockTrip } from "../data/mocks/mockTripService";
import { tripPlanPath } from "../utils/navigation";
import { createRequestLock } from "../utils/requestLock";
import { isServerTripId, tripDraftToApiInput } from "../api/adapters";
import { shouldUseMockFallback } from "../api/client";
import { isApiEnabled } from "../api/config";
import { hasAuthSession } from "../api/tokenStorage";
import { createTrip as createApiTrip, updateTrip as updateApiTrip } from "../api/trips";
import type { TripResponse } from "../api/types";
import { apiTripToDraft } from "../utils/serverTrip";

function initialDraft(trip?: TripResponse, places?: TripPlace[]): TripDraft {
  let saved: string | null = null;
  try {
    saved = sessionStorage.getItem(DRAFT_KEY);
  } catch {
  }
  const draft = readDraft(saved);
  if (trip) {
    const resumed = apiTripToDraft(trip, draft.tripId === String(trip.id) ? draft : undefined);
    if (!places) return resumed;
    const placeIds = new Set(places.filter((place) => !place.closed && !place.needsMatch).map((place) => place.id));
    return {
      ...resumed,
      places,
      selectedPlaceIds: resumed.selectedPlaceIds.filter((id) => placeIds.has(id)),
      source: places.length ? "manual" : "none",
    };
  }
  try {
    const migrationKey = "dotlo:fukuoka-empty-saved:v1";
    if (!sessionStorage.getItem(migrationKey)) {
      if (draft.city === "후쿠오카" && draft.source === "mock") {
        draft.places = [];
        draft.selectedPlaceIds = [];
      }
      sessionStorage.setItem(migrationKey, "1");
    }
  } catch {
  }
  if (!mockTripCities.some((city) => city.name === draft.city)) draft.city = "";
  draft.places = draft.places.map(
    (place) => mockTripPlaces.find((item) => item.id === place.id) ?? place,
  );
  return { ...draft, tripId: draft.tripId || crypto.randomUUID() };
}
function useTripCreate(trip?: TripResponse, places?: TripPlace[]) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(() => initialDraft(trip, places));
  const [isGenerating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [preparingTrip, setPreparingTrip] = useState(false);
  const request = useRef<AbortController | null>(null);
  const requestLock = useRef(createRequestLock());
  const requested = Number(params.get("step") || 1);
  const bounded = [1, 2, 3].includes(requested) ? requested : 1;
  const step = basicError(draft)
    ? 1
    : bounded === 3 && placesError(draft)
      ? 2
      : bounded;
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
    }
  }, [draft]);
  const generating = isGenerating && step === 3;
  useEffect(() => () => request.current?.abort(), [step]);
  useEffect(() => {
    if (step !== requested)
      setParams(trip ? { tripId: String(trip.id), step: String(step) } : { step: String(step) }, { replace: true });
  }, [step, requested, setParams, trip]);
  function update(next: TripDraft) {
    setDraft(next);
    setError("");
  }
  function move(next: number) {
    setParams(trip ? { tripId: String(trip.id), step: String(next) } : { step: String(next) });
    window.scrollTo(0, 0);
  }
  function back() {
    if (generating) return;
    if (step === 1) navigate(routes.home);
    else move(step - 1);
  }
  async function startPlacesStep() {
    if (preparingTrip) return;
    const input = tripDraftToApiInput(draft);
    if (!input) {
      setError(basicError(draft));
      return;
    }
    if (!isApiEnabled() || !hasAuthSession()) {
      move(2);
      return;
    }

    setPreparingTrip(true);
    setError("");
    try {
      const response = isServerTripId(draft.tripId)
        ? await updateApiTrip(Number(draft.tripId), input)
        : await createApiTrip(input);
      update({ ...draft, tripId: String(response.id) });
      move(2);
    } catch (reason) {
      if (shouldUseMockFallback(reason)) move(2);
      else
        setError(
          reason instanceof Error
            ? reason.message
            : "여행 정보를 저장하지 못했어요. 다시 시도해 주세요.",
        );
    } finally {
      setPreparingTrip(false);
    }
  }
  async function generate() {
    if (!requestLock.current.acquire()) return;
    const validation = basicError(draft) || placesError(draft);
    if (validation) {
      setError(validation);
      requestLock.current.release();
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setGenerating(true);
    setProgress(0);
    setError("");
    window.scrollTo(0, 0);
    let completed = false;
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await generateMockTrip(controller.signal, setProgress);
          break;
        } catch (reason) {
          if (controller.signal.aborted || attempt === 2) throw reason;
        }
      }
      if (controller.signal.aborted) return;
      completed = true;
      setProgress(4);
      saveMockTrip(createGeneratedTrip(draft));
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // 저장소를 사용할 수 없어도 현재 여행 결과로 이동합니다.
      }
      navigate(tripPlanPath("generated", draft.tripId), { replace: true });
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error
            ? reason.message
            : "일정을 만들지 못했어요. 다시 시도해 주세요.",
        );
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!completed) setGenerating(false);
      }
      requestLock.current.release();
    }
  }
  const phases = [
    `저장한 장소 ${selectedPlaces(draft).length}곳 담기`,
    `${draft.preferences.tastes.join(", ") || "선택한 조건"} 순으로 취향 반영`,
    "날짜별 이동 거리와 시간 맞추기",
    "항공, 숙소에 맞춰 첫날과 마지막 날 정리",
  ];
  return {
    draft,
    step,
    generating,
    progress,
    error,
    preparingTrip,
    phases,
    update,
    move,
    back,
    startPlacesStep,
    generate,
  };
}
export default useTripCreate;
