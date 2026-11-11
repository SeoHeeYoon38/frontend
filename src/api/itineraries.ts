import { apiRequest } from "./client";
import type {
  ItineraryDayInput,
  ItineraryVersionView,
  ValidationResult,
} from "./types";

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

