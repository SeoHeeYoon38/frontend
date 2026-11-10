export const mockScenarios = [
  "home-empty",
  "direct-search-empty",
  "direct-google-unlinked",
  "direct-exit-confirm",
  "settings-unsaved-close",
] as const;

export type MockScenario = (typeof mockScenarios)[number];

export function readMockScenario(search: string): MockScenario | null {
  const value = new URLSearchParams(search).get("mock");
  return mockScenarios.includes(value as MockScenario)
    ? (value as MockScenario)
    : null;
}
