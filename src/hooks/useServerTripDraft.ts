import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import { isServerTripId, tripDraftToApiInput } from "../api/adapters";
import { createTrip, updateTrip } from "../api/trips";
import type { TripDraft } from "../types/trip";
import { basicError } from "../utils/trip";

export type PrepareServerTrip = (draft: TripDraft) => Promise<number>;

export default function useServerTripDraft(setDraft: Dispatch<SetStateAction<TripDraft>>): PrepareServerTrip {
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
      const id = isServerTripId(draft.tripId)
        ? Number(draft.tripId)
        : previous?.localId === draft.tripId ? previous.id : undefined;
      if (previous && previous.id === id && previous.inputKey === inputKey) return previous.id;

      const trip = id === undefined ? await createTrip(input) : await updateTrip(id, input);
      saved.current = { localId: draft.tripId, id: trip.id, inputKey };
      const tripId = String(trip.id);
      setDraft((current) => current.tripId === draft.tripId && draft.tripId !== tripId
        ? { ...current, tripId }
        : current);
      return trip.id;
    });
    pending.current = request.then(() => undefined, () => undefined);
    return request;
  }, [setDraft]);
}
