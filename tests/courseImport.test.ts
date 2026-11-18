import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";
import { courseImportEndDate, courseImportUncertain } from "../src/utils/courseImport.ts";

test("전체 코스 기간으로 종료일을 계산하고 빈 일차·월말·윤년 경계를 처리한다", () => {
  assert.equal(courseImportEndDate("2026-12-30", 3), "2027-01-01");
  assert.equal(courseImportEndDate("2028-02-28", 3), "2028-03-01");
  assert.equal(courseImportEndDate("2026-12-10", 1), "2026-12-10");
  assert.equal(courseImportEndDate("", 3), "");
  assert.equal(courseImportEndDate("2026-02-30", 3), "");
  assert.equal(courseImportEndDate("2026-12-10", 0), "");
});

test("완료 여부가 불확실한 통신 오류와 명확한 거절 응답을 구분한다", () => {
  assert.equal(courseImportUncertain(new TypeError("Failed to fetch")), true);
  assert.equal(courseImportUncertain({ status: 408 }), true);
  assert.equal(courseImportUncertain({ code: "IMPORT_RESULT_UNKNOWN" }), true);
  assert.equal(courseImportUncertain({ status: 400, code: "INVALID_INPUT" }), false);
  assert.equal(courseImportUncertain({ status: 401 }), false);
});

test("실제 API 클라이언트가 시작일만 전송하고 생성 응답의 일정·방문 ID를 보존한다", async () => {
  const server = await createServer({ envDir: false, define: {
    "import.meta.env.VITE_API_MODE": JSON.stringify("live"),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://example.test"),
  }, server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; method?: string; body?: BodyInit | null }> = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "http://localhost" }, localStorage: { getItem: () => null }, setTimeout, clearTimeout,
  } });
  const result = { tripId: 12, itinerary: { version: 1, source: "COURSE_ADD", baseVersion: null,
    draft: { days: [
      { date: "2026-12-10", visits: [{ itemId: "visit-a", placeId: "same-place" }] },
      { date: "2026-12-12", visits: [{ itemId: "visit-b", placeId: "same-place" }] },
    ] }, validation: { days: [], issues: [], summary: { valid: true } } } };
  let fail = false;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method, body: init?.body });
    return new Response(JSON.stringify(fail ? { status: 400, code: "INVALID_INPUT", message: "날짜 오류" } : result),
      { status: fail ? 400 : 201, headers: { "Content-Type": "application/json" } });
  };
  try {
    const api = await server.ssrLoadModule("/src/api/courses.ts");
    assert.deepEqual(await api.importCourse(3, "2026-12-10"), result);
    assert.deepEqual(calls[0], { url: "https://example.test/api/courses/3/import", method: "POST", body: '{"startDate":"2026-12-10"}' });
    fail = true;
    await assert.rejects(api.importCourse(3, "2026-12-10"), { code: "INVALID_INPUT", status: 400 });
    assert.equal(calls.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});
