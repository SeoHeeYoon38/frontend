import { apiRequest } from "./client";
import type {
  PreferenceAnalysis,
  PreferenceInput,
  PreferenceView,
} from "./types";

export function analyzePreferences(
  tripId: number,
  text: string,
  signal?: AbortSignal,
) {
  return apiRequest<PreferenceAnalysis>(
    `/api/trips/${tripId}/preferences/analyze`,
    { method: "POST", json: { text }, signal, timeoutMs: 180_000 },
  );
}

export function savePreferences(
  tripId: number,
  input: PreferenceInput,
  signal?: AbortSignal,
) {
  return apiRequest<PreferenceView>(`/api/trips/${tripId}/preferences`, {
    method: "PUT",
    json: input,
    signal,
  });
}

export function getPreferences(tripId: number, signal?: AbortSignal) {
  return apiRequest<PreferenceView>(`/api/trips/${tripId}/preferences`, {
    signal,
  });
}

