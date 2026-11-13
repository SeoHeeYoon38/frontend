import type { ReservationResponse } from "./types";
import type { TripDraft } from "../types/trip";

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
