import type { CompanionCode, ReservationResponse, TripResponse } from "../api/types";
import { mockTripCities } from "../data/mocks/tripData";
import type { TripSummary } from "../types/home";
import type { Companion, TripDraft } from "../types/trip";
import { formatTripDateRange } from "./importedTrip";
import { dateKey, dayCount, durationLabel, emptyDraft } from "./trip";

const companionLabels: Record<CompanionCode, Companion> = {
  ALONE: "혼자",
  FRIEND: "친구",
  COUPLE: "연인",
  FAMILY: "가족",
};

export function apiTripToDraft(trip: TripResponse, draft = emptyDraft()): TripDraft {
  return {
    ...draft,
    tripId: String(trip.id),
    city: trip.city,
    country: mockTripCities.find((city) => city.name === trip.city)?.country ?? "",
    startDate: trip.startDate,
    endDate: trip.endDate,
    companion: companionLabels[trip.companion],
    people: trip.companionCount,
  };
}

function reservationFlight(
  flight: NonNullable<NonNullable<ReservationResponse["flights"]>["outbound"]>,
  date: string,
) {
  return {
    code: flight.number,
    airline: flight.airline ?? flight.number,
    date,
    departure: flight.departure.time.slice(11, 16),
    arrival: flight.arrival.time.slice(11, 16),
    from: flight.departure.airport,
    to: flight.arrival.airport,
    apiFlight: flight,
  };
}

export function applyReservationsToDraft(
  draft: TripDraft,
  reservations?: ReservationResponse,
): TripDraft {
  if (!reservations) return draft;
  return {
    ...draft,
    outbound: reservations.flights?.outbound
      ? reservationFlight(reservations.flights.outbound, draft.startDate)
      : null,
    inbound: reservations.flights?.return
      ? reservationFlight(reservations.flights.return, draft.endDate)
      : null,
    stays: reservations.stays.map((stay) => ({
      id: `stay-${stay.placeId}-${stay.checkIn}`,
      placeId: stay.placeId,
      name: stay.name,
      address: stay.address,
      city: draft.city,
      startDate: stay.checkIn,
      endDate: stay.checkOut,
    })),
    rental: reservations.rental
      ? {
          days: reservations.rental.dates,
          location: reservations.rental.name,
          placeId: reservations.rental.placeId,
        }
      : null,
  };
}

export function apiTripToSummary(trip: TripResponse): TripSummary {
  const today = dateKey(new Date());
  const daysUntil = dayCount(today, trip.startDate) - 1;
  const duration = durationLabel(trip.startDate, trip.endDate);
  return {
    id: String(trip.id),
    title: `${trip.city} ${duration}`,
    city: trip.city,
    dateLabel: formatTripDateRange(trip.startDate, trip.endDate),
    countdownLabel: daysUntil > 0 ? `D-${daysUntil}` : daysUntil === 0 ? "D-DAY" : "",
    status: trip.endDate < today ? "past" : "upcoming",
    durationLabel: duration,
    coverImage: mockTripCities.find((city) => city.name === trip.city)?.image ?? "",
    memberAvatars: [],
  };
}
