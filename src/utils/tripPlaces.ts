import type { CityResponse, PlaceCategoryCode, SavedPlaceResponse } from "../api/types.ts";
import { straightLineMeters } from "./googleMaps.ts";

// Match the distance limit applied by the saved-place enrichment API.
const cityLimitMeters = 50_000;

export const savedPlaceCategoryLabels: Record<PlaceCategoryCode, string> = {
  FOOD: "맛집",
  CAFE: "카페",
  SIGHTSEEING: "명소",
  SHOPPING: "쇼핑",
  NATURE: "자연",
  CULTURE: "문화",
  NIGHTLIFE: "야경",
  ACTIVITY: "체험",
  OTHER: "기타",
};

export function savedPlacesForTripCity(places: SavedPlaceResponse[], city: Pick<CityResponse, "lat" | "lng">) {
  const center = { latitude: city.lat, longitude: city.lng };
  return places.flatMap((place): SavedPlaceResponse[] => {
    if (place.matchStatus === "OUT_OF_CITY") return [];
    const distance = straightLineMeters(center, place);
    if (distance === undefined && place.matchStatus === "MATCHED") {
      return [{ ...place, matchStatus: "NEEDS_REVIEW" }];
    }
    return distance !== undefined && distance > cityLimitMeters ? [] : [place];
  });
}
