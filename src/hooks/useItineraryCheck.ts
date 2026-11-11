import { useEffect, useRef, useState } from "react";
import { checkItinerary } from "../api/itineraries";
import type { ItineraryDayInput, ValidationResult } from "../api/types";

export function useItineraryCheck(tripId: number) {
  const request = useRef<AbortController | null>(null);
  const [validation, setValidation] = useState<ValidationResult>();
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");

  useEffect(() => () => request.current?.abort(), []);

  function resetCheck() {
    request.current?.abort();
    request.current = null;
    setValidation(undefined);
    setChecking(false);
    setCheckError("");
  }

  async function validate(days: ItineraryDayInput[]) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setChecking(true);
    setValidation(undefined);
    setCheckError("");
    try {
      const result = await checkItinerary(tripId, days, "USER_EDITED", controller.signal);
      if (!controller.signal.aborted) setValidation(result);
    } catch (reason) {
      if (!controller.signal.aborted) {
        setCheckError(reason instanceof Error ? reason.message : "일정을 검증하지 못했어요.");
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setChecking(false);
      }
    }
  }

  return { validation, checking, checkError, resetCheck, validate };
}
