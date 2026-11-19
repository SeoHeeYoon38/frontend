import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";
import { extractMapsListLink, googleMapsImportTarget, validateMapsListLink, validateTakeoutFile } from "../src/utils/placeImport.ts";

test("가져온 장소의 외부 조회만 실패하면 같은 여행에 저장된 목록을 다시 읽는다", async () => {
  const server = await createServer({
    envDir: false, appType: "custom", logLevel: "error",
    define: {
      "import.meta.env.VITE_API_MODE": JSON.stringify("live"),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://example.test"),
    },
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  const oldFetch = globalThis.fetch;
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "http://localhost" }, localStorage: { getItem: () => null }, setTimeout, clearTimeout,
  } });
  const saved = { places: [{ id: 3, matchStatus: "NEEDS_REVIEW", name: "도톤보리" }] };
  const reads: string[] = [];
  let failure = "EXTERNAL_API_ERROR";
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path === "/api/trips/12/places/enrich" && init?.method === "POST")
      return Response.json({ code: failure }, { status: 502 });
    reads.push(path);
    return Response.json(saved);
  };
  try {
    const { enrichSavedPlaces } = await server.ssrLoadModule("/src/api/places.ts");
    assert.deepEqual(await enrichSavedPlaces(12), saved);
    failure = "TRIP_NOT_FOUND";
    await assert.rejects(enrichSavedPlaces(12), { code: failure });
    assert.deepEqual(reads, ["/api/trips/12/places"]);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});

test("Takeout ZIP·CSV는 20MB까지 선택할 수 있다", () => {
  const limit = 20 * 1024 * 1024;
  assert.equal(validateTakeoutFile({ name: "takeout.ZIP", size: limit }), "");
  assert.equal(validateTakeoutFile({ name: "오사카 맛집.csv", size: 100 }), "");
  assert.match(validateTakeoutFile({ name: "takeout.zip", size: limit + 1 }), /20MB/);
  assert.match(validateTakeoutFile({ name: "saved.json", size: 100 }), /ZIP 또는 CSV/);
  assert.match(validateTakeoutFile({ name: "empty.csv", size: 0 }), /빈 파일/);
});

test("Google Maps 공유 링크의 주소 형식을 검사한다", () => {
  assert.equal(validateMapsListLink(" https://maps.app.goo.gl/sample "), "");
  assert.equal(validateMapsListLink("https://www.google.com/maps/placelists/list/sample"), "");
  assert.notEqual(validateMapsListLink("https://maps.app.goo.gl.example.com/sample"), "");
  assert.notEqual(validateMapsListLink("https://maps.app.goo.gl/"), "");
  assert.notEqual(validateMapsListLink("http://maps.app.goo.gl/sample"), "");
  assert.notEqual(validateMapsListLink("https://www.google.com/search"), "");
});

test("Google Maps 공유 텍스트에서 목록 URL만 추출한다", () => {
  const url = "https://maps.app.goo.gl/sample?g_st=ic";
  assert.equal(extractMapsListLink(`즐겨찾는 장소 · 예빈 ${url}`), url);
  assert.equal(extractMapsListLink(`즐겨찾는 장소 · 예빈\n${url}\nGoogle 지도`), url);
  assert.equal(extractMapsListLink(`즐겨찾는 장소 · 예빈 (${url})`), url);
  assert.equal(extractMapsListLink(`${url} 즐겨찾는 장소 · 예빈`), url);
  assert.equal(extractMapsListLink(` https://example.com/help ${url} `), url);
  assert.equal(extractMapsListLink("즐겨찾는 장소 https://maps.app.goo.gl.example.com/sample"), undefined);
});

test("휴대폰과 iPad에서는 지도 앱이 지원하는 지도 열기 주소를 사용한다", () => {
  const android = { userAgent: "Android", platform: "Linux", maxTouchPoints: 5 };
  const iphone = { userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 5 };
  const ipad = { userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 5 };
  for (const device of [android, iphone, ipad]) {
    assert.deepEqual(googleMapsImportTarget(device), {
      href: "https://www.google.com/maps/@?api=1&map_action=map",
      opensSavedList: false,
    });
  }
  const desktop = { userAgent: "Windows NT", platform: "Win32", maxTouchPoints: 0 };
  assert.deepEqual(googleMapsImportTarget(desktop), {
    href: "https://www.google.com/maps/@/data=!4m2!10m1!1e1?hl=ko",
    opensSavedList: true,
  });
});
