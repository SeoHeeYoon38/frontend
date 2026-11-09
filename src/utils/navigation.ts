import { routes } from "../config/routes.ts";

export type PlanOrigin = "home" | "courses" | "generated";

const planOrigins: PlanOrigin[] = ["home", "courses", "generated"];

export function readPlanOrigin(search: string): PlanOrigin {
  const value = new URLSearchParams(search).get("from");
  return planOrigins.includes(value as PlanOrigin)
    ? (value as PlanOrigin)
    : "home";
}

export function tripPlanPath(
  origin: PlanOrigin,
  courseId?: string,
): string {
  const params = new URLSearchParams({ from: origin });
  if (courseId) params.set("course", courseId);
  return `${routes.tripPlan}?${params.toString()}`;
}

export function tripSettingsPath(origin: PlanOrigin): string {
  return `${routes.tripSettings}?${new URLSearchParams({ from: origin }).toString()}`;
}

export function tripCommunityPath(origin: PlanOrigin): string {
  return `${routes.tripCommunity}?${new URLSearchParams({ from: origin }).toString()}`;
}

export function tripPlanBackPath(search: string): string {
  return readPlanOrigin(search) === "courses" ? routes.courses : routes.home;
}

export function settingsBackPath(search: string): string {
  return tripPlanPath(readPlanOrigin(search));
}
