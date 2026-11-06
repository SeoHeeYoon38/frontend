import type { TripDraft } from "../../types/trip";
import { durationLabel } from "../../utils/trip";

const GENERATED_TRIP_KEY = "dotlo:generated-trip:v1";
const SAVED_PLAN_KEY = "dotlo:saved-plan:v1";

export interface GeneratedTripSummary {
  tripId: string;
  title: string;
  city: string;
  country: string;
  dateLabel: string;
  durationLabel: string;
  companionLabel: string;
  selectedPlaceNames: string[];
}

export function saveGeneratedTrip(draft: TripDraft): void {
  const selectedIds = new Set(draft.selectedPlaceIds);
  const summary: GeneratedTripSummary = {
    tripId: draft.tripId,
    title: `${draft.city} ${durationLabel(draft.startDate, draft.endDate)}`,
    city: draft.city,
    country: draft.country,
    dateLabel: `${draft.startDate} - ${draft.endDate}`,
    durationLabel: durationLabel(draft.startDate, draft.endDate),
    companionLabel: `${draft.companion ?? "동행"} ${draft.people}명`,
    selectedPlaceNames: draft.places
      .filter((place) => selectedIds.has(place.id))
      .map((place) => place.title),
  };

  try {
    localStorage.setItem(GENERATED_TRIP_KEY, JSON.stringify(summary));
  } catch {
    // 저장소를 사용할 수 없는 환경에서도 화면 흐름은 계속 진행합니다.
  }
}

export function saveFigmaCoursePlan(): void {
  try {
    localStorage.setItem(
      SAVED_PLAN_KEY,
      JSON.stringify({
        id: "osaka-3n4d",
        title: "오사카 3박 4일",
        city: "오사카",
        dates: "2026.05.18 - 05.21",
        savedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // 저장소를 사용할 수 없는 환경에서도 목업 화면은 정상 동작합니다.
  }
}

export function isFigmaCoursePlanSaved(): boolean {
  try {
    return localStorage.getItem(SAVED_PLAN_KEY) !== null;
  } catch {
    return false;
  }
}
