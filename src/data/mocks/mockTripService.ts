import type { MockTrip } from "../../types/mockTrip";
import type { TripDraft } from "../../types/trip";
import type { CoursePlace } from "../../types/courseCompletion";
import { dateKey, durationLabel, rangeDates, selectedPlaces } from "../../utils/trip";
import { formatTripDateRange, parseImportedTripRegistration } from "../../utils/importedTrip";
import { readStoredTrips, writeStoredTrip } from "../../utils/mockTrips";
import { initialCoursePlaces } from "./courseCompletionData";
import { mockTripCities, mockTripPlaces } from "./tripData";
import { upcomingTrips, pastTrips } from "./myTripsData";
import { travelerCourse } from "./travelerCourseData";
import { mockHomeData } from "./homeData";
import pinIcon from "../../assets/course-completion/icon-pin.svg";
import cafeIcon from "../../assets/course-completion/category-cafe.svg";
import foodIcon from "../../assets/course-completion/category-food.svg";

export const tripStorageNotice = "브라우저에 여행을 저장하지 못했어요. 저장소 설정을 확인한 뒤 다시 시도해 주세요.";

let storageNotice = "";
const temporaryTrips = new Map<string, MockTrip>();

export function placeIcon(category: string): string {
  if (category.includes("카페")) return cafeIcon;
  if (category.includes("맛집") || category.includes("시장")) return foodIcon;
  return pinIcon;
}

export function createGeneratedTrip(draft: TripDraft): MockTrip {
  const dates = rangeDates(draft.startDate, draft.endDate);
  const places = selectedPlaces(draft);
  return {
    id: draft.tripId,
    title: `${draft.city} ${durationLabel(draft.startDate, draft.endDate)}`,
    city: draft.city,
    country: draft.country,
    startDate: draft.startDate,
    endDate: draft.endDate,
    companion: draft.companion ?? "혼자",
    people: draft.people,
    coverImage: mockTripCities.find((city) => city.name === draft.city)?.image ?? places[0]?.image ?? "",
    source: "generated",
    saved: false,
    days: dates.map((date, day) => ({
      date,
      places: places.flatMap((place, index) =>
        Math.floor(index * dates.length / places.length) === day ? [{
          id: index + 1,
          name: place.title,
          category: place.category,
          detail: place.description,
          description: place.description,
          image: place.image,
          icon: placeIcon(place.category),
          latitude: place.latitude,
          longitude: place.longitude,
        }] : [],
      ),
    })),
  };
}

export function createImportedTrip(id: string): MockTrip {
  return {
    id,
    title: "교토 2박 3일",
    city: travelerCourse.city,
    country: "일본",
    startDate: "",
    endDate: "",
    companion: "친구",
    people: 2,
    coverImage: travelerCourse.hero,
    source: "imported",
    saved: true,
    days: travelerCourse.days.map((day, dayIndex) => ({
      date: "",
      places: day.places.map((place, index) => ({
        id: dayIndex * 100 + index + 1,
        name: place.name,
        category: place.category,
        detail: place.category,
        travel: place.travelTime,
        distance: place.distance,
        image: place.image,
        icon: placeIcon(place.category),
      })),
    })),
  };
}

function sampleTrips(): MockTrip[] {
  const trips = [...upcomingTrips, ...pastTrips].map((summary) => {
    if (summary.id === "kyoto") return createImportedTrip("kyoto");
    const dates = summary.dateLabel.match(/(\d{4})\.(\d+)\.(\d+)\s*–\s*(\d+)\.(\d+)/);
    const startDate = dates ? `${dates[1]}-${dates[2].padStart(2, "0")}-${dates[3].padStart(2, "0")}` : "2026-05-18";
    const endDate = dates ? `${dates[1]}-${dates[4].padStart(2, "0")}-${dates[5].padStart(2, "0")}` : "2026-05-21";
    const places: CoursePlace[] = summary.city === "오사카" ? initialCoursePlaces :
      mockTripPlaces.filter((place) => place.city === summary.city).map((place, index) => ({
        id: index + 1, name: place.title, category: place.category,
        detail: place.description, image: place.image, icon: placeIcon(place.category),
        latitude: place.latitude, longitude: place.longitude,
      }));
    return {
      id: summary.id, title: summary.title, city: summary.city, country: "",
      startDate, endDate, companion: "친구" as const, people: 3,
      coverImage: summary.coverImage, source: "sample" as const, saved: true,
      sampleStatus: upcomingTrips.some((trip) => trip.id === summary.id) ? "upcoming" as const : "past" as const,
      days: rangeDates(startDate, endDate).map((date, index, days) => ({
        date,
        places: places.filter((_, placeIndex) => Math.floor(placeIndex * days.length / places.length) === index),
      })),
    };
  });
  return trips;
}

function legacyTrips(): MockTrip[] {
  const trips: MockTrip[] = [];
  const raw = localStorage.getItem("dotlo:generated-trip:v1");
  if (raw) {
    const summary = JSON.parse(raw);
    const dates = typeof summary.dateLabel === "string" ? summary.dateLabel.split(" - ") : [];
    if (typeof summary.tripId === "string" && typeof summary.city === "string" &&
      typeof summary.title === "string" && Array.isArray(summary.selectedPlaceNames) &&
      summary.selectedPlaceNames.every((name: unknown) => typeof name === "string") &&
      rangeDates(dates[0] ?? "", dates[1] ?? "").length) {
      const city = mockTripCities.find((item) => item.name === summary.city);
      trips.push({
        id: summary.tripId, title: summary.title, city: summary.city, country: city?.country ?? "",
        startDate: dates[0], endDate: dates[1], companion: "친구", people: 2,
        coverImage: city?.image ?? "", source: "generated", saved: false,
        days: rangeDates(dates[0], dates[1]).map((date, day, days) => ({
          date,
          places: summary.selectedPlaceNames.flatMap((name: string, index: number) => {
            if (Math.floor(index * days.length / summary.selectedPlaceNames.length) !== day) return [];
            const place = mockTripPlaces.find((item) => item.title === name && item.city === summary.city);
            return [{ id: index + 1, name, category: place?.category ?? "명소", detail: place?.description ?? "",
              image: place?.image ?? city?.image ?? "", icon: placeIcon(place?.category ?? "명소") }];
          }),
        })),
      });
    }
  }
  const registration = parseImportedTripRegistration(localStorage.getItem(`dotlo:imported-course:${travelerCourse.id}:registration`));
  if (registration) {
    const trip = createImportedTrip("kyoto");
    const dates = rangeDates(registration.startDate, registration.endDate);
    if (dates.length === trip.days.length) trips.push({ ...trip,
      startDate: registration.startDate, endDate: registration.endDate,
      companion: registration.companionType, people: registration.peopleCount,
      days: trip.days.map((day, index) => ({ ...day, date: dates[index] })),
    });
  }
  return trips;
}

export function readMockTrips(): MockTrip[] {
  const trips = new Map(sampleTrips().map((trip) => [trip.id, trip]));
  storageNotice = "";
  try {
    legacyTrips().forEach((trip) => trips.set(trip.id, trip));
  } catch {
    storageNotice = "이전 여행 정보를 복원하지 못했어요. 기본 여행을 표시합니다.";
  }
  try {
    readStoredTrips(localStorage).forEach((trip) => trips.set(trip.id, trip));
  } catch {
    storageNotice = "저장된 여행을 불러오지 못했어요. 브라우저 저장소를 확인해 주세요.";
  }
  temporaryTrips.forEach((trip) => trips.set(trip.id, trip));
  if (temporaryTrips.size) storageNotice = tripStorageNotice;
  return [...trips.values()];
}

export function readMockTrip(id: string): MockTrip | undefined {
  return readMockTrips().find((trip) => trip.id === id);
}

export function readTripStorageNotice(): string {
  return storageNotice;
}

export function saveMockTrip(trip: MockTrip): boolean {
  try {
    writeStoredTrip(localStorage, trip);
    temporaryTrips.delete(trip.id);
    storageNotice = "";
    return true;
  } catch {
    temporaryTrips.set(trip.id, { ...trip, saved: false });
    storageNotice = tripStorageNotice;
    return false;
  }
}

export function mockTripStatus(trip: MockTrip): "upcoming" | "past" {
  return trip.sampleStatus ?? (trip.endDate && trip.endDate < dateKey(new Date()) ? "past" : "upcoming");
}

export function mockTripSummary(trip: MockTrip) {
  return {
    id: trip.id, title: trip.title, city: trip.city,
    dateLabel: trip.startDate ? formatTripDateRange(trip.startDate, trip.endDate) : "날짜 미정",
    countdownLabel: "", coverImage: trip.coverImage,
    status: mockTripStatus(trip), memberAvatars: [],
    durationLabel: trip.startDate ? durationLabel(trip.startDate, trip.endDate) : `${trip.days.length - 1}박 ${trip.days.length}일`,
  };
}

export function readHomeTrips() {
  const trips = readMockTrips().filter((trip) => trip.saved).map(mockTripSummary);
  return { ...mockHomeData, nextTrip: trips.find((trip) => trip.status === "upcoming") ?? null, trips };
}
