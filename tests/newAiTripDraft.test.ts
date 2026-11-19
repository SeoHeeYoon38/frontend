import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

test("새 AI 여행은 사라진 초안만 복구하고 기존 확정 일정은 보존한다", async () => {
  const server = await createServer({ envDir: false, define: {
    "import.meta.env.VITE_API_MODE": JSON.stringify("live"),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://example.test"),
  }, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", logLevel: "error" });
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "http://localhost" }, localStorage: { getItem: () => null }, setTimeout, clearTimeout,
  } });
  const input = { city: "오사카", startDate: "2026-11-28", endDate: "2026-11-30", companion: "FRIEND", companionCount: 2 };
  const missing = () => Response.json({ code: "TRIP_NOT_FOUND" }, { status: 404 });
  const writes: string[] = [];
  let read = () => Response.json({ ...input, id: 12, status: "DRAFT" });
  let disappearedWhileSaving = false;
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path === "/api/trips/12" && (!init?.method || init.method === "GET")) return read();
    assert.deepEqual(JSON.parse(String(init?.body)), input);
    writes.push(`${init?.method} ${path}`);
    if (disappearedWhileSaving && init?.method === "PATCH") return missing();
    return Response.json({ ...input, id: init?.method === "POST" ? 19 : 12, status: "DRAFT" });
  };
  try {
    const { saveNewTripDraft } = await server.ssrLoadModule("/src/api/trips.ts");
    assert.equal((await saveNewTripDraft(12, input)).id, 12);
    assert.deepEqual(writes, []);

    read = () => Response.json({ ...input, id: 12, status: "DRAFT", companionCount: 3 });
    assert.equal((await saveNewTripDraft(12, input)).id, 12);
    assert.deepEqual(writes.splice(0), ["PATCH /api/trips/12"]);
    disappearedWhileSaving = true;
    assert.equal((await saveNewTripDraft(12, input)).id, 19);
    assert.deepEqual(writes.splice(0), ["PATCH /api/trips/12", "POST /api/trips"]);

    for (const response of [missing, () => Response.json({ ...input, id: 12, status: "CONFIRMED" })]) {
      read = response;
      assert.equal((await saveNewTripDraft(12, input)).id, 19);
      assert.deepEqual(writes.splice(0), ["POST /api/trips"]);
    }
    for (const status of [403, 404, 503]) {
      read = () => Response.json({ code: "OTHER_ERROR" }, { status });
      await assert.rejects(saveNewTripDraft(12, input), { status });
      assert.deepEqual(writes, []);
    }
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});
