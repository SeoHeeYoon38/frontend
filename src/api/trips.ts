import { apiRequest } from "./client";
import { isMapCoordinate } from "../utils/googleMaps";
import type {
  CityResponse,
  TripInput,
  TripResponse,
  TripUpdateInput,
  ItineraryVersionView,
  SavedPlaceResponse,
} from "./types";

export interface SharedTrip {
  trip: Pick<TripResponse, "city" | "startDate" | "endDate" | "companion" | "companionCount">;
  itinerary: Pick<ItineraryVersionView, "version" | "draft" | "validation">;
  places: Pick<SavedPlaceResponse, "placeId" | "name" | "address">[];
}

export function createTripShare(tripId: number, signal?: AbortSignal) {
  return apiRequest<{ token: string }>(`/api/trips/${tripId}/share`, { method: "POST", signal });
}

export function getSharedTrip(token: string, signal?: AbortSignal) {
  return apiRequest<SharedTrip>(`/api/share/${encodeURIComponent(token)}`, { auth: false, signal });
}

export function getCities(signal?: AbortSignal) {
  return apiRequest<CityResponse[]>("/api/cities", { auth: false, signal });
}

export async function getTripCity(name: string, signal?: AbortSignal) {
  const cities = await getCities(signal);
  const city = cities.find((item) => item.name === name);
  if (!city || !isMapCoordinate({ latitude: city.lat, longitude: city.lng })) {
    throw new Error("여행지 위치를 불러오지 못했어요.");
  }
  return city;
}

export function getTrips(signal?: AbortSignal) {
  return apiRequest<TripResponse[]>("/api/trips", { signal });
}

export function getInProgressTrip(signal?: AbortSignal) {
  return apiRequest<TripResponse | undefined>("/api/trips/in-progress", { signal });
}

export function getTrip(tripId: number, signal?: AbortSignal) {
  return apiRequest<TripResponse>(`/api/trips/${tripId}`, { signal });
}

export function deleteTrip(tripId: number) {
  return apiRequest<void>(`/api/trips/${tripId}`, { method: "DELETE" });
}

export function confirmTrip(tripId: number, signal?: AbortSignal) {
  return apiRequest<{
    tripId: number;
    status: "CONFIRMED";
    version: number;
    placesNeedingCheck: number;
  }>(`/api/trips/${tripId}/confirm`, { method: "POST", signal });
}

export function createTrip(input: TripInput, signal?: AbortSignal) {
  return apiRequest<TripResponse>("/api/trips", {
    method: "POST",
    json: input,
    signal,
  });
}

export function updateTrip(
  tripId: number,
  input: TripUpdateInput,
  signal?: AbortSignal,
) {
  return apiRequest<TripResponse>(`/api/trips/${tripId}`, {
    method: "PATCH",
    json: input,
    signal,
  });
}

