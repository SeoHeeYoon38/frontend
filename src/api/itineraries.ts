import { ApiError, apiRequest, queryString } from "./client";
import type {
  GeneratedItineraryResponse,
  ItineraryEditPreview,
  ItineraryDayInput,
  ItineraryDiff,
  ItineraryVersionSummary,
  ItineraryVersionView,
  ValidationResult,
  PlaceDaySuggestion,
  TravelLeg,
} from "./types";

export type TravelOption = Pick<TravelLeg, "mode" | "minutes" | "distanceMeters"> & { estimated: boolean };

export function getTravelOptions(
  tripId: number,
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  departAt?: string,
  signal?: AbortSignal,
) {
  return apiRequest<TravelOption[]>(
    `/api/trips/${tripId}/travel-options${queryString({
      fromLat: from.latitude,
      fromLng: from.longitude,
      toLat: to.latitude,
      toLng: to.longitude,
      departAt,
    })}`,
    { signal },
  );
}

export function generateItinerary(tripId: number, signal?: AbortSignal, savedPlaceIds?: number[]) {
  return apiRequest<GeneratedItineraryResponse>(`/api/trips/${tripId}/itineraries/generate`, {
    method: "POST",
    json: savedPlaceIds ? { savedPlaceIds } : undefined,
    signal,
    timeoutMs: 195_000,
  });
}

export function checkItinerary(
  tripId: number,
  days: ItineraryDayInput[],
  origin: "AI_GENERATED" | "USER_EDITED",
  signal?: AbortSignal,
) {
  return apiRequest<ValidationResult>(`/api/trips/${tripId}/itineraries/check`, {
    method: "POST",
    json: { origin, days },
    signal,
    timeoutMs: 180_000,
  });
}

export function saveItinerary(
  tripId: number,
  days: ItineraryDayInput[],
  baseVersion: number | null,
  signal?: AbortSignal,
) {
  return apiRequest<ItineraryVersionView>(`/api/trips/${tripId}/itineraries`, {
    method: "POST",
    json: { baseVersion, days },
    signal,
    timeoutMs: 180_000,
  });
}

export function getLatestItinerary(tripId: number, signal?: AbortSignal) {
  return apiRequest<ItineraryVersionView>(
    `/api/trips/${tripId}/itineraries/latest`,
    { signal },
  );
}

export function suggestPlaceDay(tripId: number, placeId: string, signal?: AbortSignal) {
  return apiRequest<PlaceDaySuggestion>(`/api/trips/${tripId}/itineraries/add-place/suggest`, {
    method: "POST", json: { placeId }, signal,
  });
}

export function addPlaceToItinerary(tripId: number, placeId: string, day: number) {
  return apiRequest<{
    placeName: string;
    reason: string;
    itinerary: ItineraryVersionView;
    diff: ItineraryDiff;
  }>(`/api/trips/${tripId}/itineraries/add-place`, {
    method: "POST",
    json: { placeId, day },
    timeoutMs: 180_000,
  });
}

export async function addPlaceOnDate(tripId: number, placeId: string, day: number, date: string) {
  try {
    return (await addPlaceToItinerary(tripId, placeId, day)).itinerary;
  } catch (reason) {
    if (!(reason instanceof ApiError && reason.code === "PLACE_ADD_FAILED")) throw reason;
  }
  // The add endpoint saved the place, but could not fit it into its suggested route.
  // Keep the existing order and let the manual-save endpoint validate the appended visit.
  const latest = await getLatestItinerary(tripId);
  const alreadyIn = latest.draft.days.find((item) => item.visits.some((visit) => visit.placeId === placeId));
  if (alreadyIn?.date === date) return latest;
  if (alreadyIn) throw new Error("다른 일차에 이미 추가된 장소예요.");
  if (!latest.draft.days.some((item) => item.date === date)) throw new Error("일정의 날짜가 변경됐어요. 날짜를 다시 선택해 주세요.");
  const days = latest.draft.days.map((item) => item.date !== date ? item : {
    ...item, visits: [...item.visits, { itemId: crypto.randomUUID(), placeId }],
  });
  return saveItinerary(tripId, days, latest.version);
}

export function requestItineraryEdit(
  tripId: number,
  message: string,
  signal?: AbortSignal,
) {
  return apiRequest<ItineraryEditPreview>(
    `/api/trips/${tripId}/itineraries/edit-requests`,
    { method: "POST", json: { message }, signal, timeoutMs: 180_000 },
  );
}

export function applyItineraryEdit(
  tripId: number,
  editRequestId: number,
  signal?: AbortSignal,
) {
  return apiRequest<ItineraryVersionView>(
    `/api/trips/${tripId}/itineraries/edit-requests/${editRequestId}/apply`,
    { method: "POST", signal, timeoutMs: 180_000 },
  );
}

export function getItineraryHistory(tripId: number, signal?: AbortSignal) {
  return apiRequest<ItineraryVersionSummary[]>(
    `/api/trips/${tripId}/itineraries`,
    { signal },
  );
}

export function revertItinerary(
  tripId: number,
  version: number,
  signal?: AbortSignal,
) {
  return apiRequest<ItineraryVersionView>(
    `/api/trips/${tripId}/itineraries/${version}/revert`,
    { method: "POST", signal },
  );
}

