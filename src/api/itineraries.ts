import { apiRequest } from "./client";
import type {
  GeneratedItineraryResponse,
  ItineraryEditPreview,
  ItineraryDayInput,
  ItineraryVersionSummary,
  ItineraryVersionView,
  ValidationResult,
} from "./types";

export function generateItinerary(tripId: number, signal?: AbortSignal) {
  return apiRequest<GeneratedItineraryResponse>(`/api/trips/${tripId}/itineraries/generate`, {
    method: "POST",
    signal,
    timeoutMs: 180_000,
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
  baseVersion: number,
  signal?: AbortSignal,
) {
  return apiRequest<ItineraryVersionView>(
    `/api/trips/${tripId}/itineraries/${baseVersion}/apply`,
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

