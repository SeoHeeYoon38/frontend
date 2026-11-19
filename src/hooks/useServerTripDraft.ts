import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import { isServerTripId, tripDraftToApiInput } from "../api/adapters";
import { createTrip, saveNewTripDraft, updateTrip } from "../api/trips";
import type { TripDraft } from "../types/trip";
import { basicError } from "../utils/trip";

export type PrepareServerTrip = (draft: TripDraft) => Promise<number>;

export default function useServerTripDraft(
  setDraft: Dispatch<SetStateAction<TripDraft>>,
  newAiTrip = false,
): PrepareServerTrip {
  const saved = useRef<{ localId: string; id: number; inputKey: string } | undefined>(undefined);
  const pending = useRef<Promise<void>>(Promise.resolve());

  return useCallback((draft) => {
    const input = tripDraftToApiInput(draft);
    const error = basicError(draft);
    if (error || !input) return Promise.reject(new Error(error || "여행 기본 정보를 입력해 주세요."));

    const inputKey = JSON.stringify(input);
    // Search and Continue may both need the same server draft.
    const request = pending.current.then(async () => {
      const previous = saved.current;
      const id = previous?.localId === draft.tripId ? previous.id
        : isServerTripId(draft.tripId) ? Number(draft.tripId) : undefined;
      if (!newAiTrip && previous && previous.id === id && previous.inputKey === inputKey) return previous.id;

      const trip = newAiTrip ? await saveNewTripDraft(id, input)
        : id === undefined ? await createTrip(input) : await updateTrip(id, input);
      const localId = previous && previous.id === trip.id ? previous.localId : draft.tripId;
      saved.current = { localId, id: trip.id, inputKey };
      const tripId = String(trip.id);
      setDraft((current) => {
        if (current.tripId !== draft.tripId || current.tripId === tripId) return current;
        if (isServerTripId(current.tripId)) {
          return { ...current, tripId, places: [], selectedPlaceIds: [], source: "none" };
        }
        return { ...current, tripId };
      });
      return trip.id;
    });
    pending.current = request.then(() => undefined, () => undefined);
    return request;
  }, [setDraft, newAiTrip]);
}
