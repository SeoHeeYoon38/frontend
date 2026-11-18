import type { ItineraryDayInput } from "../api/types.ts";

export type ItineraryPlaceEdit =
  | { kind: "remove" }
  | { kind: "move"; day: number }
  | { kind: "replace"; placeId: string; itemId: string };

export function editItineraryPlace(days: ItineraryDayInput[], itemId: string, edit: ItineraryPlaceEdit): ItineraryDayInput[] {
  const source = days.find((day) => day.visits.some((visit) => visit.itemId === itemId));
  const visit = source?.visits.find((item) => item.itemId === itemId);
  if (!source || !visit) throw new Error("현재 일정에서 이 장소를 찾지 못했어요. 일정을 다시 열어 주세요.");

  if (edit.kind === "replace") {
    if (source.visits.some((item) => item.placeId === edit.placeId)) {
      throw new Error("이미 이날 일정에 있는 장소예요.");
    }
    return days.map((day) => day === source ? { ...day, visits: day.visits.map((item) =>
      item.itemId === itemId ? { ...item, itemId: edit.itemId, placeId: edit.placeId } : item,
    ) } : day);
  }

  const target = edit.kind === "move" ? days[edit.day - 1] : undefined;
  if (edit.kind === "move" && (!target || target === source || target.visits.some((item) => item.placeId === visit.placeId))) {
    throw new Error("이 날짜로 장소를 옮길 수 없어요. 다른 날짜를 골라 주세요.");
  }

  return days.map((day) => {
    if (day === source) return { ...day, visits: day.visits.filter((item) => item.itemId !== itemId) };
    if (day === target) return { ...day, visits: [...day.visits, visit] };
    return day;
  });
}
