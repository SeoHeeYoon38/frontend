import { ApiError, apiRequest } from "./client";
import { getLatestItinerary } from "./itineraries";
import { getReservations } from "./reservations";
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

/** A locally restored new-trip form can outlive its server draft. */
export async function saveNewTripDraft(id: number | undefined, input: TripInput) {
  if (id !== undefined) {
    try {
      const current = await getTrip(id);
      if (current.status === "DRAFT") {
        if (current.city === input.city && current.startDate === input.startDate &&
          current.endDate === input.endDate && current.companion === input.companion &&
          current.companionCount === input.companionCount) return current;
        return await updateTrip(id, input);
      }
    } catch (reason) {
      if (!(reason instanceof ApiError && reason.status === 404 && reason.code === "TRIP_NOT_FOUND")) throw reason;
    }
  }
  return createTrip(input);
}

export async function updateTripDates(tripId: number, input: TripUpdateInput & { startDate: string; endDate: string }) {
  // Changing trip dates does not move the server's itinerary versions or reservations.
  const itinerary = await getLatestItinerary(tripId).catch((reason: unknown) => {
    if (!(reason instanceof ApiError && reason.code === "ITINERARY_NOT_FOUND")) throw reason;
  });
  if (itinerary) throw new Error("저장된 일정의 날짜와 여행 기간을 함께 변경할 수 없어요.");
  const { flights, stays, rental } = await getReservations(tripId);
  const bookedDates = [
    flights?.outbound?.arrival.time.slice(0, 10), flights?.return?.departure.time.slice(0, 10),
    ...stays.flatMap((stay) => [stay.checkIn, stay.checkOut]), ...(rental?.dates ?? []),
  ];
  if (bookedDates.some((date) => date && (date < input.startDate || date > input.endDate))) {
    throw new Error("항공권·숙소·렌터카의 예약 날짜를 포함하는 여행 기간을 선택해 주세요.");
  }
  return updateTrip(tripId, input);
}

