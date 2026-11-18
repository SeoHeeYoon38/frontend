import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";
import type { ItineraryVersionView } from "../src/api/types.ts";
import { canRevertVersion, restoredPlan, revertErrorMessage } from "../src/utils/itineraryRevert.ts";

function itinerary(version: number): ItineraryVersionView {
  return { version, source: "REVERT", baseVersion: version - 1, createdBy: 7,
    createdAt: "2026-11-18T10:00:00", draft: { days: [{ date: "2026-12-10", visits: [
      { itemId: "visit-a", placeId: "same-place", stayMinutes: 90 },
      { itemId: "visit-b", placeId: "same-place", stayMinutes: 30 },
    ] }] }, validation: { days: [], issues: [], summary: { valid: true } } } as ItineraryVersionView;
}

test("최신 버전·없는 번호에는 되돌리기를 제공하지 않는다", () => {
  assert.equal(canRevertVersion(1, 4), true);
  for (const target of [4, 5, 0, -1, 1.5, NaN]) assert.equal(canRevertVersion(target, 4), false);
});

test("복원 응답의 방문 ID·당시 검증 결과·직전 최신 baseVersion을 그대로 반영하고 이력을 보존한다", () => {
  const previous = itinerary(4);
  const restored = itinerary(5);
  const current = { itinerary: previous, history: [previous], interactions: { comments: [{ id: 1 }] }, tripId: 12 };
  const result = restoredPlan(current, restored);
  assert.equal(result.itinerary, restored);
  assert.equal(result.itinerary.validation, restored.validation);
  assert.deepEqual(result.itinerary.draft.days[0].visits.map((visit) => visit.itemId), ["visit-a", "visit-b"]);
  assert.equal(result.itinerary.baseVersion, 4);
  assert.deepEqual(result.history.map((item) => item.version), [5, 4]);
  assert.equal(result.interactions, undefined);
  assert.equal(current.interactions.comments.length, 1);
  assert.equal(current.itinerary.version, 4);
  assert.equal(restoredPlan(result, restored).history.length, 2);
});

test("최신 버전 요청과 대상 버전 없음·권한 오류를 구분한다", () => {
  assert.match(revertErrorMessage({ code: "ITINERARY_ALREADY_LATEST" }), /이미 최신/);
  assert.match(revertErrorMessage({ code: "ITINERARY_VERSION_NOT_FOUND" }), /버전을 찾지/);
  assert.match(revertErrorMessage({ code: "TRIP_NOT_FOUND" }), /권한/);
  assert.equal(revertErrorMessage(new Error("연결 실패")), "연결 실패");
});

test("되돌리기는 선택한 대상 버전으로 본문 없이 POST하고 성공 응답과 오류를 그대로 전달한다", async () => {
  const server = await createServer({ envDir: false, define: {
    "import.meta.env.VITE_API_MODE": JSON.stringify("live"),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://example.test"),
  }, server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "http://localhost" }, localStorage: { getItem: () => null }, setTimeout, clearTimeout,
  } });
  const calls: Array<{ url: string; method?: string; body?: BodyInit | null }> = [];
  let failure: { status: number; code: string } | undefined;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method, body: init?.body });
    return new Response(JSON.stringify(failure ?? itinerary(5)), {
      status: failure?.status ?? 200, headers: { "Content-Type": "application/json" },
    });
  };
  try {
    const api = await server.ssrLoadModule("/src/api/itineraries.ts");
    assert.deepEqual(await api.revertItinerary(12, 1), itinerary(5));
    assert.deepEqual(calls[0], { url: "https://example.test/api/trips/12/itineraries/1/revert", method: "POST", body: undefined });
    for (const error of [
      { status: 400, code: "ITINERARY_ALREADY_LATEST" },
      { status: 404, code: "ITINERARY_VERSION_NOT_FOUND" },
      { status: 404, code: "TRIP_NOT_FOUND" },
    ]) {
      failure = error;
      await assert.rejects(api.revertItinerary(12, 1), error);
    }
    assert.equal(calls.length, 4);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});
