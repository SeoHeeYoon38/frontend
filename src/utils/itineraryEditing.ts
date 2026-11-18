import type { ItineraryDayInput, ItineraryVisitInput } from "../api/types.ts";

export function moveVisit(days: Record<number, string[]>, itemId: string, targetDay: number) {
  const next = Object.fromEntries(Object.entries(days).map(([day, ids]) => [
    day, ids.filter((id) => id !== itemId),
  ]));
  next[targetDay] = [...(next[targetDay] ?? []), itemId];
  return next;
}

export function reorderVisit(ids: string[], itemId: string, offset: -1 | 1) {
  const index = ids.indexOf(itemId);
  const target = index + offset;
  if (index < 0 || target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function editedItineraryDays(
  dates: string[],
  days: Record<number, string[]>,
  places: Record<string, { visit: ItineraryVisitInput }>,
): ItineraryDayInput[] {
  return dates.map((date, index) => ({
    date,
    visits: (days[index + 1] ?? []).map((id) => {
      const place = places[id];
      if (!place) throw new Error("편집한 장소 정보를 찾지 못했어요. 여행 일정을 다시 열어 주세요.");
      return { ...place.visit };
    }),
  }));
}
