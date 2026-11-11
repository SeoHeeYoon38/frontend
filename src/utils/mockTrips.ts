import type { CoursePlace } from "../types/courseCompletion.ts";
import type { MockTrip, MockTripDay } from "../types/mockTrip.ts";
import { addDays, companions, dayCount, validDate } from "./trip.ts";

export const MOCK_TRIPS_KEY = "dotlo:trips:v1";

function validPlace(value: unknown): value is CoursePlace {
  if (!value || typeof value !== "object") return false;
  const place = value as CoursePlace;
  return Number.isInteger(place.id) &&
    [place.name, place.category, place.detail, place.image, place.icon].every(
      (item) => typeof item === "string",
    ) &&
    [place.travel, place.distance, place.description, place.changeLabel].every(
      (item) => item === undefined || typeof item === "string",
    ) &&
    (place.fixed === undefined || typeof place.fixed === "boolean");
}

export function validMockTrip(value: unknown): value is MockTrip {
  if (!value || typeof value !== "object") return false;
  const trip = value as MockTrip;
  if (
    !trip.id || typeof trip.id !== "string" ||
    !trip.title || typeof trip.title !== "string" ||
    !trip.city || typeof trip.city !== "string" ||
    typeof trip.country !== "string" || typeof trip.coverImage !== "string" ||
    !companions.includes(trip.companion) ||
    !Number.isInteger(trip.people) || trip.people < 1 || trip.people > 10 ||
    !["generated", "direct", "imported", "sample"].includes(trip.source) ||
    typeof trip.saved !== "boolean" ||
    !Array.isArray(trip.days) || !trip.days.length
  ) return false;
  const undated = trip.startDate === "" && trip.endDate === "";
  if (!undated && (
    !validDate(trip.startDate) || !validDate(trip.endDate) ||
    trip.endDate < trip.startDate || dayCount(trip.startDate, trip.endDate) !== trip.days.length
  )) return false;
  return trip.days.every((day, index) => {
    if (!day || typeof day.date !== "string" || !Array.isArray(day.places)) return false;
    const expectedDate = undated ? "" : addDays(trip.startDate, index);
    return day.date === expectedDate && day.places.every(validPlace) &&
      new Set(day.places.map((place) => place.id)).size === day.places.length;
  });
}

export function readStoredTrips(storage: Pick<Storage, "getItem">): MockTrip[] {
  const raw = storage.getItem(MOCK_TRIPS_KEY);
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error("저장된 여행 형식을 확인해 주세요.");
  const trips = value.filter(validMockTrip);
  if (trips.length !== value.length) throw new Error("저장된 여행 형식을 확인해 주세요.");
  return trips;
}

export function writeStoredTrip(storage: Pick<Storage, "getItem" | "setItem">, trip: MockTrip): void {
  if (!validMockTrip(trip)) throw new Error("여행 정보를 확인해 주세요.");
  const trips = readStoredTrips(storage);
  storage.setItem(MOCK_TRIPS_KEY, JSON.stringify([
    trip,
    ...trips.filter((item) => item.id !== trip.id),
  ]));
}

export function moveDayPlace(day: MockTripDay, fromId: number, toId: number): MockTripDay {
  const from = day.places.findIndex((place) => place.id === fromId);
  const to = day.places.findIndex((place) => place.id === toId);
  if (from < 0 || to < 0 || from === to) return day;
  const places = [...day.places];
  const [place] = places.splice(from, 1);
  places.splice(to, 0, place);
  return { ...day, places };
}
