export type ApiMode = "auto" | "live" | "mock";

export function resolveApiMode(
  configuredMode: string | undefined,
  production: boolean,
): ApiMode {
  if (production) return "live";
  if (
    configuredMode === "live" ||
    configuredMode === "mock" ||
    configuredMode === "auto"
  ) {
    return configuredMode;
  }
  return "auto";
}

export function allowsMockFallback(mode: ApiMode) {
  return mode !== "live";
}
