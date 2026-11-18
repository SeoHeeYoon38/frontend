import { addDays, validDate } from "./trip.ts";

export function courseImportEndDate(startDate: string, dayCount: number) {
  if (!validDate(startDate) || !Number.isInteger(dayCount) || dayCount < 1) return "";
  return addDays(startDate, dayCount - 1);
}

export function courseImportUncertain(reason: unknown) {
  if (reason instanceof TypeError) return true;
  if (reason === null || typeof reason !== "object") return false;
  if ("code" in reason && reason.code === "IMPORT_RESULT_UNKNOWN") return true;

  const status = "status" in reason ? reason.status : undefined;
  return typeof status === "number" && (status === 408 || (status >= 500 && status < 600));
}
