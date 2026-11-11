import { validDate } from "./trip.ts";

export type CompanionType = "혼자" | "친구" | "연인" | "가족";

export interface ImportedTripRegistration {
  startDate: string;
  endDate: string;
  companionType: CompanionType;
  peopleCount: number;
}

export const importedTripRegistrationKey = (courseId: string) =>
  `dotlo:imported-course:${courseId}:registration`;

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatMonthDay(date: string): string {
  if (!date) return "";
  const value = new Date(`${date}T12:00:00`);
  return `${value.getMonth() + 1}.${value.getDate()}`;
}

export function formatTripDateRange(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "날짜 미정";
  const start = new Date(`${startDate}T12:00:00`);
  return `${start.getFullYear()}.${formatMonthDay(startDate)} – ${formatMonthDay(endDate)}`;
}

export function courseDateLabels(startDate: string, dayCount: number): string[] {
  if (!startDate) return Array.from({ length: dayCount }, () => "");
  return Array.from({ length: dayCount }, (_, index) =>
    formatMonthDay(addDays(startDate, index)),
  );
}

export function parseImportedTripRegistration(
  value: string | null,
): ImportedTripRegistration | null {
  if (!value) return null;
  try {
    const data = JSON.parse(value) as Partial<ImportedTripRegistration>;
    const companionTypes: CompanionType[] = ["혼자", "친구", "연인", "가족"];
    if (
      typeof data.startDate !== "string" ||
      typeof data.endDate !== "string" ||
      !validDate(data.startDate) || !validDate(data.endDate) ||
      data.endDate < data.startDate ||
      !companionTypes.includes(data.companionType as CompanionType) ||
      typeof data.peopleCount !== "number" ||
      !Number.isInteger(data.peopleCount) ||
      data.peopleCount < 1 ||
      data.peopleCount > 10
    ) {
      return null;
    }
    return data as ImportedTripRegistration;
  } catch {
    return null;
  }
}
