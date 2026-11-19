import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

test("일정 추가는 AI 배치 실패에서 검증된 장소를 복구하고 날짜 변경은 일정·예약을 확인한다", async () => {
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
  let addError = "PLACE_ADD_FAILED";
  let matched = false;
  let booked = false;
  let readFails = false;
  const days = [{ date: "2026-12-09", visits: [{ itemId: "visit-1", placeId: "first" }] },
    { date, visits: [{ itemId: "visit-2", placeId: "second" }] }];
  const writes: { baseVersion?: number; days?: typeof days; startDate?: string; endDate?: string }[] = [];
  const json = (value: unknown, status = 200) => Response.json(value, { status });
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path.endsWith("/add-place")) return json({ code: addError }, addError === "EXTERNAL_API_ERROR" ? 502 : 400);
    if (path.endsWith("/places")) return json({ places: [{ placeId: "provider-place", matchStatus: matched ? "MATCHED" : "PENDING" }] });
    if (path.endsWith("/latest")) {
      if (readFails) return json({ code: "SERVER_ERROR" }, 503);
      return hasItinerary ? json({ version: 7, draft: { days } }) : json({ code: "ITINERARY_NOT_FOUND" }, 404);
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
    const { addPlaceOnDate } = await server.ssrLoadModule("/src/api/itineraries.ts");
    await addPlaceOnDate(12, "new-place", 2, date);
    assert.equal(writes[0].baseVersion, 7);
    assert.deepEqual(writes[0].days?.[0], days[0]);
    assert.deepEqual(writes[0].days?.[1].visits.map((visit) => visit.placeId), ["second", "new-place"]);
    assert.ok(writes[0].days?.[1].visits[1].itemId);
    await addPlaceOnDate(12, "second", 2, date);
    await assert.rejects(addPlaceOnDate(12, "first", 2, date), /다른 일차/);
    addError = "PLACE_NOT_PLANNABLE";
    await assert.rejects(addPlaceOnDate(12, "unavailable", 2, date), { code: addError });
    assert.equal(writes.length, 1);

    addError = "EXTERNAL_API_ERROR";
    await assert.rejects(addPlaceOnDate(12, "provider-place", 2, date), { code: addError });
    await addPlaceOnDate(12, "second", 2, date);
    assert.equal(writes.length, 1);
    matched = true;
    await addPlaceOnDate(12, "provider-place", 2, date);
    assert.equal(writes[1].baseVersion, 7);
    assert.deepEqual(writes[1].days?.[1].visits.map((visit) => visit.placeId), ["second", "provider-place"]);

    const { updateTripDates } = await server.ssrLoadModule("/src/api/trips.ts");
    const dates = { startDate: "2026-12-09", endDate: date };
    await assert.rejects(updateTripDates(12, dates), /저장된 일정/);
    hasItinerary = false;
    booked = true;
    await assert.rejects(updateTripDates(12, dates), /예약 날짜/);
    booked = false;
    readFails = true;
    await assert.rejects(updateTripDates(12, dates), { code: "SERVER_ERROR" });
    assert.equal(writes.length, 2);
    readFails = false;
    await updateTripDates(12, dates);
    assert.deepEqual(writes.slice(2), [dates]);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});
