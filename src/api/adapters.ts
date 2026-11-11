import type { TripDraft, TripPlace } from "../types/trip";
import type {
  CompanionCode,
  PlaceCategoryCode,
  PreferenceAnalysis,
  SavedPlaceResponse,
  TripInput,
} from "./types";

const companionCodes: Record<NonNullable<TripDraft["companion"]>, CompanionCode> = {
  혼자: "ALONE",
  친구: "FRIEND",
  연인: "COUPLE",
  가족: "FAMILY",
};

const categoryLabels: Record<PlaceCategoryCode, TripPlace["category"]> = {
  FOOD: "맛집",
  CAFE: "카페",
  SIGHTSEEING: "명소",
  SHOPPING: "쇼핑",
  NATURE: "산책",
  CULTURE: "명소",
  NIGHTLIFE: "명소",
  ACTIVITY: "명소",
  OTHER: "명소",
};

export function isServerTripId(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

export function tripDraftToApiInput(draft: TripDraft): TripInput | null {
  if (!draft.companion) return null;
  return {
    city: draft.city,
    startDate: draft.startDate,
    endDate: draft.endDate,
    companion: companionCodes[draft.companion],
    companionCount: draft.people,
  };
}

export function savedPlaceToTripPlace(place: SavedPlaceResponse, city: string): TripPlace {
  return {
    id: String(place.id),
    serverId: place.id,
    placeId: place.placeId ?? undefined,
    title: place.name,
    city,
    category: place.category ? categoryLabels[place.category] : "명소",
    description: place.address ?? place.note ?? place.listNames.join(" · "),
    image: "",
    latitude: place.latitude ?? undefined,
    longitude: place.longitude ?? undefined,
    closed: place.matchStatus === "CLOSED" || place.matchStatus === "OUT_OF_CITY",
    needsMatch:
      place.matchStatus === "PENDING" ||
      place.matchStatus === "NEEDS_REVIEW" ||
      place.matchStatus === "NOT_FOUND",
  };
}

export function preferenceAnalysisToDraft(
  analysis: PreferenceAnalysis,
  draft: TripDraft,
): TripDraft["preferences"] {
  const tastes = analysis.chips
    .filter((chip) => chip.type === "INTEREST")
    .map((chip) => chip.label);
  const pace = analysis.chips
    .filter((chip) => ["PACE", "WALKING", "DAY_START"].includes(chip.type))
    .map((chip) => chip.label);

  return {
    text: draft.preferences.text,
    tastes,
    pace: pace.length ? pace : ["보통 강도"],
    companion: draft.companion ? [draft.companion] : [],
    analyzed: true,
    apiProfile: analysis.preferences,
  };
}

