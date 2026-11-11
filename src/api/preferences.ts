import { apiRequest } from "./client";
import type {
  PreferenceAnalysis,
  PreferenceInput,
  PreferenceView,
  UserPreferenceView,
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

export function saveUserPreferences(
  input: PreferenceInput,
  signal?: AbortSignal,
) {
  return apiRequest<UserPreferenceView>("/api/users/me/preferences", {
    method: "PUT",
    json: input,
    signal,
  });
}

export function getUserPreferences(signal?: AbortSignal) {
  return apiRequest<UserPreferenceView>("/api/users/me/preferences", {
    signal,
  });
}

