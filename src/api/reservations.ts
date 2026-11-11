import { apiRequest, queryString } from "./client";
import type { FlightInfo, ReservationResponse } from "./types";

export function searchFlights(
  number: string,
  date: string,
  signal?: AbortSignal,
) {
  return apiRequest<FlightInfo[]>(
    `/api/flights${queryString({ number, date })}`,
    { signal },
  );
}

export function getReservations(tripId: number, signal?: AbortSignal) {
  return apiRequest<ReservationResponse>(`/api/trips/${tripId}/reservations`, {
    signal,
  });
}

export function saveFlights(
  tripId: number,
  outbound: FlightInfo | null,
  returnFlight: FlightInfo | null,
  signal?: AbortSignal,
) {
  return apiRequest<ReservationResponse>(
    `/api/trips/${tripId}/reservations/flights`,
    {
      method: "PUT",
      json: { outbound, return: returnFlight },
      signal,
    },
  );
}

export function saveStays(
  tripId: number,
  stays: Array<{ placeId: string; checkIn: string; checkOut: string }>,
  signal?: AbortSignal,
) {
  return apiRequest<ReservationResponse>(
    `/api/trips/${tripId}/reservations/stays`,
    { method: "PUT", json: { stays }, signal },
  );
}

export function saveRental(
  tripId: number,
  dates: string[],
  placeId: string | null,
  signal?: AbortSignal,
) {
  return apiRequest<ReservationResponse>(
    `/api/trips/${tripId}/reservations/rental`,
    { method: "PUT", json: { dates, placeId }, signal },
  );
}

