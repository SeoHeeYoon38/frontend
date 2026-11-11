import { useEffect, useState } from "react";
import { isApiEnabled } from "../api/config";
import { hasAuthSession } from "../api/tokenStorage";
import { getInProgressTrip, getTrips } from "../api/trips";
import type { TripResponse } from "../api/types";

interface TripListState {
  trips: TripResponse[];
  pending: boolean;
  error: string;
}

export function useMyTrips(includeInProgress = false) {
  const [enabled] = useState(() => isApiEnabled() && hasAuthSession());
  const [state, setState] = useState<TripListState>({
    trips: [],
    pending: enabled,
    error: "",
  });
  const [inProgress, setInProgress] = useState<TripResponse>();
  const [inProgressError, setInProgressError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const { signal } = controller;

    void getTrips(signal).then(
      (trips) => {
        if (!signal.aborted) setState({ trips, pending: false, error: "" });
      },
      () => {
        if (!signal.aborted) setState({
          trips: [],
          pending: false,
          error: "내 여행을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        });
      },
    );

    if (includeInProgress) {
      void getInProgressTrip(signal).then(
        (trip) => { if (!signal.aborted) setInProgress(trip); },
        () => { if (!signal.aborted) setInProgressError(true); },
      );
    }

    return () => controller.abort();
  }, [enabled, includeInProgress]);

  return { enabled, ...state, inProgress, inProgressError };
}
