import { routes } from "../config/routes.ts";

export const demoInviteId = "osaka-demo";
export const demoInvitePath = routes.invite.replace(":inviteId", demoInviteId);
export const courseFavoritesPath = `${routes.savedItems}?view=likes&tab=courses`;

export function invitePath(token: string): string {
  return routes.invite.replace(":inviteId", encodeURIComponent(token));
}

const pendingInviteKey = "dotlo:auth:pending-invite";
const pendingCourseKey = "dotlo:auth:pending-course";

type InviteStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function savePendingInvite(storage: InviteStorage, token: string) {
  storage.setItem(pendingInviteKey, token);
}

export function takePendingInvitePath(storage: InviteStorage): string | undefined {
  const token = storage.getItem(pendingInviteKey);
  storage.removeItem(pendingInviteKey);
  return token ? invitePath(token) : undefined;
}

export function savePendingCourseLogin(storage: InviteStorage, courseId: number, importCourse: boolean) {
  storage.setItem(pendingCourseKey, `${courseId}:${importCourse ? "import" : "view"}`);
}

export function takePendingLoginPath(storage: InviteStorage): string | undefined {
  const invite = takePendingInvitePath(storage);
  const course = storage.getItem(pendingCourseKey)?.match(/^([1-9]\d*):(import|view)$/);
  storage.removeItem(pendingCourseKey);
  if (invite) return invite;
  if (!course) return undefined;
  return `${travelerCoursePath(course[1])}${course[2] === "import" ? "?import=1" : ""}`;
}

export type PlanOrigin = "home" | "my-trips" | "courses" | "generated";

const planOrigins: PlanOrigin[] = ["home", "my-trips", "courses", "generated"];

export function readPlanOrigin(search: string): PlanOrigin {
  const value = new URLSearchParams(search).get("from");
  return planOrigins.includes(value as PlanOrigin)
    ? (value as PlanOrigin)
    : "home";
}

export function tripPlanPath(
  origin: PlanOrigin,
  courseId?: string,
  day?: number,
): string {
  const params = new URLSearchParams({ from: origin });
  if (courseId) params.set("course", courseId);
  if (day && day > 1) params.set("day", String(day));
  return `${routes.tripPlan}?${params.toString()}`;
}

export function travelerCoursePath(courseId: string): string {
  return `/courses/${encodeURIComponent(courseId)}`;
}

export function serverTripPlanPath(origin: PlanOrigin, tripId: string, day?: number): string {
  const params = new URLSearchParams({ from: origin, tripId });
  if (day && day > 1) params.set("day", String(day));
  return `${routes.tripPlan}?${params}`;
}

export function readPlanDay(search: string): number {
  const value = new URLSearchParams(search).get("day");
  const day = Number(value);
  return value && Number.isSafeInteger(day) && day > 0 ? day : 1;
}

export function resumeTripPath(tripId: string | number): string {
  return `${routes.createTrip}?${new URLSearchParams({ tripId: String(tripId), step: "2" })}`;
}

export function importedTripPath(tripId: string): string {
  return `/my-trips/${encodeURIComponent(tripId)}`;
}

export function tripSettingsPath(origin: PlanOrigin, courseId?: string, returnTripId?: number): string {
  const params = new URLSearchParams({ from: origin });
  if (courseId) params.set("course", courseId);
  if (returnTripId !== undefined) params.set("returnTripId", String(returnTripId));
  return `${routes.tripSettings}?${params.toString()}`;
}

export function tripCommunityPath(origin: PlanOrigin, courseId?: string, returnTripId?: number, day?: number): string {
  const params = new URLSearchParams({ from: origin });
  if (courseId) params.set("course", courseId);
  if (returnTripId !== undefined) params.set("returnTripId", String(returnTripId));
  if (day && day > 1) params.set("day", String(day));
  return `${routes.tripCommunity}?${params.toString()}`;
}

export function tripPlanBackPath(search: string): string {
  const origin = readPlanOrigin(search);
  if (origin === "courses") return routes.courses;
  if (origin === "my-trips") return routes.myTrips;
  return routes.home;
}

export function settingsBackPath(search: string): string {
  const params = new URLSearchParams(search);
  const returnTripId = params.get("returnTripId");
  const day = readPlanDay(search);
  if (returnTripId && /^\d+$/.test(returnTripId)) {
    return serverTripPlanPath(readPlanOrigin(search), returnTripId, day);
  }
  return tripPlanPath(readPlanOrigin(search), params.get("course") ?? undefined, day);
}

export function isDirectTripMode(search: string): boolean {
  const params = new URLSearchParams(search);
  const mode = params.get("mode");
  const mock = params.get("mock");
  return (
    mode === "direct" ||
    mode === "manual" ||
    mock?.startsWith("direct-") === true
  );
}
