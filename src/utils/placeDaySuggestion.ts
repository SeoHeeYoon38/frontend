import type { PlaceDaySuggestion } from "../api/types.ts";

export function initialSuggestedDay(suggestion: PlaceDaySuggestion) {
  return suggestion.days.some((item) => item.day === suggestion.recommendedDay)
    ? suggestion.recommendedDay ?? undefined : undefined;
}

export function placeDayError(reason: unknown) {
  const messages: Record<string, string> = {
    PLACE_ALREADY_IN_ITINERARY: "이미 일정에 있는 장소예요. 다른 장소를 선택해 주세요.",
    PLACE_NOT_PLANNABLE: "폐업했거나 여행 지역 밖 또는 확인이 필요한 장소예요. 다른 장소를 선택해 주세요.",
    STAY_REQUIRED: "등록하지 않은 숙박일이 있어요. 숙소 정보를 먼저 완성해 주세요.",
    ITINERARY_NOT_FOUND: "저장된 일정이 없어요. 일정을 먼저 저장해 주세요.",
    ITINERARY_VERSION_CONFLICT: "다른 변경사항이 있어요. 최신 일정에서 날짜를 확인하고 다시 시도해 주세요.",
    EXTERNAL_API_ERROR: "Google에서 장소 정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
  };
  if (reason && typeof reason === "object" && "code" in reason && typeof reason.code === "string") {
    if (reason.code === "PLACE_ADD_FAILED" && "message" in reason && typeof reason.message === "string") return reason.message;
    if (messages[reason.code]) return messages[reason.code];
    if ("status" in reason && reason.status === 500) return "AI가 장소를 배치하지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
  return reason instanceof Error ? reason.message : "요청을 처리하지 못했어요. 다시 시도해 주세요.";
}
