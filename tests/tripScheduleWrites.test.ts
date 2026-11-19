import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

test("장소는 사용자가 고른 유효한 날에 한 번 저장하고, 충돌은 최신 일정으로 갱신한다", async () => {
  const server = await createServer({ envDir: false, define: {
    "import.meta.env.VITE_API_MODE": JSON.stringify("live"),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://example.test"),
  }, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", logLevel: "error" });
  const oldFetch = globalThis.fetch;
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "http://localhost" }, localStorage: { getItem: () => null }, setTimeout, clearTimeout,
  } });
  const date = "2026-12-10";
  let hasItinerary = true;
  let addError: { status: number; code: string; message: string } | undefined;
  let booked = false;
  let readFails = false;
  const days = [{ date: "2026-12-09", visits: [{ itemId: "visit-1", placeId: "first" }] },
    { date, visits: [{ itemId: "visit-2", placeId: "second" }] }];
  const writes: { baseVersion?: number; days?: typeof days; startDate?: string; endDate?: string }[] = [];
  const json = (value: unknown, status = 200) => Response.json(value, { status });
  const steps: string[] = [];
  const suggestion = { recommendedDay: 1, days: days.map((item, index) => ({ day: index + 1, date: item.date })) };
  const stored = { version: 7, draft: { days } };
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path.endsWith("/add-place/suggest")) {
      assert.equal(init?.method, "POST");
      assert.deepEqual(JSON.parse(String(init?.body)), { placeId: "new-place" });
      steps.push("suggest");
      return json(suggestion);
    }
    if (path.endsWith("/add-place")) {
      assert.equal(init?.method, "POST");
      assert.deepEqual(JSON.parse(String(init?.body)), { placeId: "new-place", day: 2 });
      steps.push("add");
      return addError ? json(addError, addError.status) : json({ itinerary: stored });
    }
    if (path.endsWith("/latest")) {
      steps.push("latest");
      if (readFails) return json({ code: "SERVER_ERROR" }, 503);
      return hasItinerary ? json(stored) : json({ code: "ITINERARY_NOT_FOUND" }, 404);
    }
    if (path.endsWith("/reservations")) return json({ flights: null, rental: null,
      stays: booked ? [{ checkIn: date, checkOut: "2026-12-11" }] : [] });
    if (init?.method === "PATCH" || path.endsWith("/itineraries") && init?.method === "POST") {
      const payload = JSON.parse(String(init.body));
      writes.push(payload);
      return json(payload);
    }
    throw new Error(`Unexpected request: ${path}`);
  };
  try {
    const { addPlaceOnDate, reloadAfterPlaceAddError } = await server.ssrLoadModule("/src/api/itineraries.ts");
    assert.deepEqual(await addPlaceOnDate(12, "new-place", 2, date), stored);
    assert.deepEqual(steps.splice(0), ["suggest", "add"]);
    await assert.rejects(addPlaceOnDate(12, "new-place", 1, date), { code: "ITINERARY_VERSION_CONFLICT" });
    assert.deepEqual(steps.splice(0), ["suggest"]);
    for (const failure of [
      { status: 400, code: "PLACE_ADD_FAILED", message: "저장 장소 목록에 담아 두었으니 직접 넣으실 수 있습니다." },
      { status: 502, code: "EXTERNAL_API_ERROR", message: "장소 조회 실패" },
      { status: 500, code: "INTERNAL_SERVER_ERROR", message: "AI 실패" },
      { status: 409, code: "ITINERARY_VERSION_CONFLICT", message: "일정 변경" },
      { status: 400, code: "PLACE_ALREADY_IN_ITINERARY", message: "이미 일정에 있는 장소" },
    ]) {
      addError = failure;
      const reason = await addPlaceOnDate(12, "new-place", 2, date).catch((reason: unknown) => reason);
      assert.equal(reason.code, failure.code);
      assert.equal(reason.message, failure.message);
      const changed = failure.status === 409 || failure.code === "PLACE_ALREADY_IN_ITINERARY";
      assert.deepEqual(await reloadAfterPlaceAddError(12, reason), changed ? stored : undefined);
      assert.deepEqual(steps.splice(0), changed ? ["suggest", "add", "latest"] : ["suggest", "add"]);
    }
    assert.equal(writes.length, 0);

    const { updateTripDates } = await server.ssrLoadModule("/src/api/trips.ts");
    const dates = { startDate: "2026-12-09", endDate: date };
    await assert.rejects(updateTripDates(12, dates), /저장된 일정/);
    hasItinerary = false;
    booked = true;
    await assert.rejects(updateTripDates(12, dates), /예약 날짜/);
    booked = false;
    readFails = true;
    await assert.rejects(updateTripDates(12, dates), { code: "SERVER_ERROR" });
    assert.equal(writes.length, 0);
    readFails = false;
    await updateTripDates(12, dates);
    assert.deepEqual(writes, [dates]);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});
