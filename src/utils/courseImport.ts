import { addDays, validDate } from "./trip.ts";

export function courseImportEndDate(startDate: string, dayCount: number) {
  if (!validDate(startDate) || !Number.isInteger(dayCount) || dayCount < 1) return "";
  return addDays(startDate, dayCount - 1);
}

export function courseImportUncertain(reason: unknown) {
  return reason instanceof TypeError || (reason !== null && typeof reason === "object" &&
    (("status" in reason && reason.status === 408) || ("code" in reason && reason.code === "IMPORT_RESULT_UNKNOWN")));
}
