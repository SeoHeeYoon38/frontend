import { apiRequest, queryString } from "./client";
import type {
  PlaceCandidate,
  PlaceImportResponse,
  SavedPlaceListResponse,
} from "./types";

export function searchPlaces(
  tripId: number,
  query: string,
  signal?: AbortSignal,
) {
  return apiRequest<PlaceCandidate[]>(
    `/api/places/search${queryString({ query, tripId })}`,
    { signal },
  );
}

export function getSavedPlaces(tripId: number, signal?: AbortSignal) {
  return apiRequest<SavedPlaceListResponse>(`/api/trips/${tripId}/places`, {
    signal,
  });
}

export function addSavedPlace(
  tripId: number,
  placeId: string,
  signal?: AbortSignal,
) {
  return apiRequest<SavedPlaceListResponse>(`/api/trips/${tripId}/places`, {
    method: "POST",
    json: { placeId },
    signal,
  });
}

export function uploadTakeout(
  tripId: number,
  file: File,
  signal?: AbortSignal,
) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<PlaceImportResponse>(`/api/trips/${tripId}/places/upload`, {
    method: "POST",
    body: form,
    signal,
    timeoutMs: 120_000,
  });
}

export function importSharedList(
  tripId: number,
  url: string,
  signal?: AbortSignal,
) {
  return apiRequest<PlaceImportResponse>(`/api/trips/${tripId}/places/link`, {
    method: "POST",
    json: { url },
    signal,
    timeoutMs: 120_000,
  });
}

export function enrichSavedPlaces(tripId: number, signal?: AbortSignal) {
  return apiRequest<SavedPlaceListResponse>(
    `/api/trips/${tripId}/places/enrich`,
    { method: "POST", signal, timeoutMs: 120_000 },
  );
}

export function matchSavedPlace(
  tripId: number,
  savedPlaceId: number,
  googlePlaceId: string,
  signal?: AbortSignal,
) {
  return apiRequest<SavedPlaceListResponse>(
    `/api/trips/${tripId}/places/${savedPlaceId}/match`,
    { method: "PATCH", json: { placeId: googlePlaceId }, signal },
  );
}

export function deleteSavedPlace(
  tripId: number,
  savedPlaceId: number,
  signal?: AbortSignal,
) {
  return apiRequest<void>(`/api/trips/${tripId}/places/${savedPlaceId}`, {
    method: "DELETE",
    signal,
  });
}

