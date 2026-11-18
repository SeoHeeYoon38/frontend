import type { ItineraryVersionView } from "../api/types";

export function isNewGeneratedItinerary(
  latest: Pick<ItineraryVersionView, "source" | "version"> | null,
  previousVersion: number,
) {
  return latest?.source === "AI_GENERATED" && latest.version > previousVersion;
}
