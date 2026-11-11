import type { TripDraft, TripPlace } from "../types/trip";
import type {
  CompanionCode,
  PlaceCategoryCode,
  PreferenceAnalysis,
  PreferenceChip,
  PreferenceInput,
  PreferenceProfile,
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

const onboardingInterestCodes: Record<string, PlaceCategoryCode> = {
  "맛집 탐방": "FOOD",
  "카페 투어": "CAFE",
  "자연 풍경": "NATURE",
  "역사와 문화": "CULTURE",
  "쇼핑": "SHOPPING",
  "야경": "NIGHTLIFE",
  "사진 명소": "SIGHTSEEING",
  "액티비티": "ACTIVITY",
  "온천과 휴식": "OTHER",
  "골목 산책": "SIGHTSEEING",
};

interface PreferenceResult {
  preferences: PreferenceProfile;
  chips: PreferenceChip[];
  rawText?: string | null;
}

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
  return preferenceResultToDraft(analysis, draft);
}

export function preferenceResultToDraft(
  result: PreferenceResult,
  draft: TripDraft,
): TripDraft["preferences"] {
  const tastes = result.chips
    .filter((chip) => chip.type === "INTEREST")
    .map((chip) => chip.label);
  const pace = result.chips
    .filter((chip) => ["PACE", "WALKING", "DAY_START"].includes(chip.type))
    .map((chip) => chip.label);

  return {
    text: result.rawText ?? draft.preferences.text,
    tastes,
    pace: pace.length ? pace : ["보통 강도"],
    companion: draft.companion ? [draft.companion] : [],
    analyzed: true,
    apiProfile: result.preferences,
  };
}

export function onboardingPreferencesToInput(
  selected: string[],
): PreferenceInput {
  const interests = selected
    .map((label) => onboardingInterestCodes[label])
    .filter((code): code is PlaceCategoryCode => Boolean(code));

  return {
    pace: "NORMAL",
    walking: "NORMAL",
    dayStart: "NORMAL",
    interests: [...new Set(interests)],
    avoid: [],
    notes: [],
    rawText: null,
  };
}

