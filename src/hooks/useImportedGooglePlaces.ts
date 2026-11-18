import { useEffect, useMemo, useState } from "react";
import { isApiEnabled } from "../api/config";
import { getMySavedPlaces } from "../api/places";
import { hasAuthSession } from "../api/tokenStorage";
import type { MySavedPlaceResponse } from "../api/types";

interface ImportedPlacesResult {
  places: MySavedPlaceResponse[];
  checkedAt?: Date;
  completedRequest: number;
  error: string;
}

export default function useImportedGooglePlaces() {
  const live = isApiEnabled() && hasAuthSession();
  const [request, setRequest] = useState(0);
  const [result, setResult] = useState<ImportedPlacesResult>({
    places: [],
    completedRequest: -1,
    error: "",
  });

  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    void getMySavedPlaces(controller.signal).then(
      (places) => {
        if (!controller.signal.aborted) {
          setResult({ places, checkedAt: new Date(), completedRequest: request, error: "" });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setResult((current) => ({
            ...current,
            completedRequest: request,
            error: "가져온 장소를 불러오지 못했어요. 다시 시도해 주세요.",
          }));
        }
      },
    );
    return () => controller.abort();
  }, [live, request]);

  const imported = useMemo(() => {
    const all = new Set<string>();
    const byList = new Map<string, Set<string>>();
    for (const { place } of result.places) {
      if (place.source !== "TAKEOUT" && place.source !== "SHARED_LINK") continue;
      const identity = place.placeId ? "place:" + place.placeId
        : place.featureId ? "feature:" + place.featureId
        : "saved:" + place.id;
      all.add(identity);
      for (const name of place.listNames ?? []) {
        if (!name.trim()) continue;
        const entries = byList.get(name) ?? new Set<string>();
        entries.add(identity);
        byList.set(name, entries);
      }
    }
    return { count: all.size, lists: [...byList].map(([name, places]) => ({ name, count: places.size })) };
  }, [result.places]);

  return {
    ...imported,
    pending: live && request !== result.completedRequest,
    checkedAt: result.checkedAt,
    error: result.error,
    reload: () => setRequest((value) => value + 1),
  };
}
