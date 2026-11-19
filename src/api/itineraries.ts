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
    method: "POST", json: { placeId }, signal, timeoutMs: 180_000,
  });
}

export function addPlaceToItinerary(tripId: number, placeId: string, day: number, signal?: AbortSignal) {
  return apiRequest<{
    placeName: string;
    reason: string;
    itinerary: ItineraryVersionView;
    diff: ItineraryDiff;
  }>(`/api/trips/${tripId}/itineraries/add-place`, {
    method: "POST",
    json: { placeId, day },
    signal,
    timeoutMs: 180_000,
  });
}

export async function addPlaceOnDate(tripId: number, placeId: string, day: number, date: string, signal?: AbortSignal) {
  const suggestion = await suggestPlaceDay(tripId, placeId, signal);
  // The user already chose a day on the itinerary, before opening the place picker.
  const selected = suggestion.days.find((choice) => choice.day === day && choice.date === date);
  if (!selected) throw new ApiError(409, "ITINERARY_VERSION_CONFLICT", "선택한 여행 날짜가 변경됐어요.");
  signal?.throwIfAborted();
  return (await addPlaceToItinerary(tripId, placeId, selected.day, signal)).itinerary;
}

export async function reloadAfterPlaceAddError(tripId: number, reason: unknown, signal?: AbortSignal) {
  if (!(reason instanceof ApiError)) return;
  const conflict = reason.status === 409 && reason.code === "ITINERARY_VERSION_CONFLICT";
  if (!conflict && reason.code !== "PLACE_ALREADY_IN_ITINERARY") return;
  try {
    return await getLatestItinerary(tripId, signal);
  } catch (loadError) {
    if (signal?.aborted) throw loadError;
    throw new Error("일정이 변경됐지만 최신 일정을 불러오지 못했어요. 다시 시도해 주세요.");
  }
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

