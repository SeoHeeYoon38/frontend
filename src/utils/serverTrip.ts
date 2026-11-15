import type { CompanionCode, TripResponse } from "../api/types";
import { mockTripCities } from "../data/mocks/tripData";
import type { TripSummary } from "../types/home";
import type { Companion, TripDraft } from "../types/trip";
import { formatTripDateRange } from "./importedTrip";
import { durationLabel, emptyDraft, tripDateStatus } from "./trip";

export const companionLabels: Record<CompanionCode, Companion> = {
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

export function apiTripToSummary(trip: TripResponse): TripSummary {
  const { hasDates, status, countdownLabel } = tripDateStatus(trip.startDate, trip.endDate);
  const duration = hasDates ? durationLabel(trip.startDate, trip.endDate) : undefined;
  return {
    id: String(trip.id),
    title: duration ? `${trip.city} ${duration}` : `${trip.city} 여행`,
    city: trip.city,
    dateLabel: hasDates ? formatTripDateRange(trip.startDate, trip.endDate) : "날짜 미정",
    countdownLabel,
    status,
    durationLabel: duration,
    coverImage: mockTripCities.find((city) => city.name === trip.city)?.image ?? "",
    memberAvatars: [],
  };
}
