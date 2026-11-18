import type { ItineraryVersionSummary, ItineraryVersionView } from "../api/types.ts";

export function canRevertVersion(target: number, current: number) {
  return Number.isInteger(target) && target > 0 && target < current;
}

export function restoredPlan<T extends { itinerary: ItineraryVersionView | null; history: ItineraryVersionSummary[]; interactions?: unknown }>(
  current: T, itinerary: ItineraryVersionView,
) {
  const { version, source, baseVersion, createdBy, createdAt } = itinerary;
  return {
    ...current, itinerary, interactions: undefined,
    history: [...current.history.filter((item) => item.version !== version),
      { version, source, baseVersion, createdBy, createdAt }].sort((a, b) => b.version - a.version),
  };
}

export function revertErrorMessage(reason: unknown) {
  if (reason && typeof reason === "object" && "code" in reason) {
    if (reason.code === "ITINERARY_ALREADY_LATEST") return "이미 최신 일정이에요. 여행 일정을 다시 열어 확인해 주세요.";
    if (reason.code === "ITINERARY_VERSION_NOT_FOUND") return "되돌릴 버전을 찾지 못했어요. 변경 이력을 다시 확인해 주세요.";
    if (reason.code === "TRIP_NOT_FOUND") return "여행을 찾을 수 없거나 접근 권한이 없어요.";
  }
  return reason instanceof Error ? reason.message : "일정을 되돌리지 못했어요. 다시 시도해 주세요.";
}
