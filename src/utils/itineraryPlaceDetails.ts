import type { ItineraryVersionView, SavedPlaceResponse } from "../api/types";
import { isMapCoordinate } from "./googleMaps.ts";

export type ItineraryPlaceDetails = Pick<SavedPlaceResponse, "name" | "address" | "latitude" | "longitude"> & {
  placeId: string;
  category?: SavedPlaceResponse["category"];
};

export function olderItinerary(received: ItineraryVersionView | null, current?: ItineraryVersionView | null) {
  return (received?.version ?? 0) < (current?.version ?? 0);
}

export function itineraryPlaceDetails(
  saved: SavedPlaceResponse[],
  details: ItineraryPlaceDetails[],
) {
  const byId = new Map(details.map((place) => [place.placeId, place]));
  for (const place of saved) {
    if (!place.placeId) continue;
    const known = byId.get(place.placeId);
    const coordinate = isMapCoordinate(place) ? place : known;
    byId.set(place.placeId, {
      placeId: place.placeId, name: place.name || known?.name || "",
      address: place.address ?? known?.address ?? null,
      category: place.category ?? known?.category,
      latitude: coordinate?.latitude ?? null,
      longitude: coordinate?.longitude ?? null,
    });
  }
  return byId;
}
