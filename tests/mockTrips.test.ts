import assert from "node:assert/strict";
import test from "node:test";
import { MOCK_TRIPS_KEY, moveDayPlace, readStoredTrips, validMockTrip, writeStoredTrip } from "../src/utils/mockTrips.ts";
import type { MockTrip } from "../src/types/mockTrip.ts";
import { settingsBackPath, tripSettingsPath } from "../src/utils/navigation.ts";
import { createServer } from "vite";
import { emptyDraft } from "../src/utils/trip.ts";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

function exampleTrip(id: string): MockTrip {
  return {
    id, title: "도쿄 여행", city: "도쿄", country: "일본",
    startDate: "2026-11-20", endDate: "2026-11-21",
    companion: "친구", people: 2, coverImage: "/cover.webp",
    source: "generated", saved: true,
    days: [
      { date: "2026-11-20", places: [1, 2].map((placeId) => ({
        id: placeId, name: `장소 ${placeId}`, category: "명소",
        detail: "샘플 장소", image: "/place.webp", icon: "/pin.svg",
      })) },
      { date: "2026-11-21", places: [] },
    ],
  };
}

test("여행 두 건을 저장하고 다시 읽어도 편집 내용이 서로 섞이지 않는다", () => {
  const storage = memoryStorage();
  const first = exampleTrip("first");
  const second = { ...exampleTrip("second"), title: "두 번째 여행", source: "direct" as const };
  writeStoredTrip(storage, first);
  writeStoredTrip(storage, second);
  const restored = readStoredTrips(storage).find((trip) => trip.id === first.id)!;
  restored.days[0] = moveDayPlace(restored.days[0], 2, 1);
  restored.days[1].places = [restored.days[0].places.pop()!];
  writeStoredTrip(storage, restored);
  const trips = readStoredTrips(storage);
  assert.equal(trips.length, 2);
  assert.deepEqual(trips.find((trip) => trip.id === "first")?.days.map((day) => day.places.map((place) => place.id)), [[2], [1]]);
  assert.deepEqual(trips.find((trip) => trip.id === "second"), second);
  restored.days[0].places = [];
  assert.equal(readStoredTrips(storage)[0].days[0].places.length, 1);
});

test("빈 일차와 날짜 미정인 가져온 코스를 복원한다", () => {
  const storage = memoryStorage();
  const trip = exampleTrip("imported");
  trip.source = "imported";
  trip.startDate = "";
  trip.endDate = "";
  trip.days = trip.days.map((day) => ({ ...day, date: "" }));
  writeStoredTrip(storage, trip);
  assert.deepEqual(readStoredTrips(storage), [trip]);
});

test("잘못된 날짜, 중복 장소, 잘못된 저장 형식은 복원하지 않는다", () => {
  const trip = exampleTrip("invalid");
  assert.equal(validMockTrip({ ...trip, startDate: "bad" }), false);
  assert.equal(validMockTrip({ ...trip, people: 1.5 }), false);
  assert.equal(validMockTrip({ ...trip, days: [{ date: "2026-11-20", places: [trip.days[0].places[0], trip.days[0].places[0]] }] }), false);
  const storage = memoryStorage();
  storage.setItem(MOCK_TRIPS_KEY, "broken");
  assert.throws(() => readStoredTrips(storage));
  storage.setItem(MOCK_TRIPS_KEY, JSON.stringify([trip, null]));
  assert.throws(() => readStoredTrips(storage));
});

test("저장소가 쓰기를 거부하면 성공으로 처리하지 않는다", () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); } };
  assert.throws(() => writeStoredTrip(storage, exampleTrip("full")), /QuotaExceededError/);
});

test("순서 변경은 원본을 수정하지 않고 대상 일차만 바꾼다", () => {
  const trip = exampleTrip("order");
  const moved = moveDayPlace(trip.days[0], 1, 2);
  assert.deepEqual(moved.places.map((place) => place.id), [2, 1]);
  assert.deepEqual(trip.days[0].places.map((place) => place.id), [1, 2]);
  assert.equal(moveDayPlace(trip.days[0], 999, 2), trip.days[0]);
});

test("여행 설정에서 돌아와도 선택한 여행 ID를 유지한다", () => {
  const path = tripSettingsPath("my-trips", "my-trip");
  assert.equal(settingsBackPath(path.slice(path.indexOf("?"))), "/trips/plan?from=my-trips&course=my-trip");
});

test("실제 목업 생성·저장·조회 함수가 선택 장소와 이전 저장 데이터를 복원한다", async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = memoryStorage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  try {
    const service = await server.ssrLoadModule("/src/data/mocks/mockTripService.ts");
    const draft = {
      ...emptyDraft(), tripId: "generated-test", city: "도쿄", country: "일본",
      startDate: "2026-11-20", endDate: "2026-11-21", companion: "혼자" as const, people: 1,
      places: ["센소지", "도쿄 타워", "시부야"].map((title, index) => ({
        id: `tokyo-${index}`, title, city: "도쿄", category: "명소" as const,
        description: "도쿄", image: "/tokyo.webp",
      })),
      selectedPlaceIds: ["tokyo-0", "tokyo-1"],
    };
    const generated = service.createGeneratedTrip(draft);
    assert.equal(generated.title, "도쿄 1박 2일");
    assert.deepEqual(generated.days.map((day: MockTrip["days"][number]) => day.places.map((place) => place.name)), [["센소지"], ["도쿄 타워"]]);
    assert.equal(service.saveMockTrip({ ...generated, saved: true }), true);
    const imported = service.createImportedTrip("imported-test");
    assert.equal(service.saveMockTrip(imported), true);
    assert.equal(service.readMockTrip("generated-test").city, "도쿄");
    assert.equal(service.readHomeTrips().trips.some((trip: MockTrip) => trip.id === "generated-test"), true);
    imported.days[0].places.reverse();
    service.saveMockTrip(imported);
    assert.deepEqual(service.readMockTrip("generated-test").days, JSON.parse(JSON.stringify(generated.days)));

    storage.setItem("dotlo:generated-trip:v1", JSON.stringify({
      tripId: "legacy-test", title: "도쿄 1박 2일", city: "도쿄",
      dateLabel: "2026-11-20 - 2026-11-21", selectedPlaceNames: ["센소지", "도쿄 타워"],
    }));
    assert.equal(service.readMockTrip("legacy-test").days[1].places[0].name, "도쿄 타워");
    storage.setItem("dotlo:imported-course:kyoto-walk:registration", JSON.stringify({
      startDate: "2026-12-01", endDate: "2026-12-03", companionType: "가족", peopleCount: 4,
    }));
    assert.equal(service.readMockTrip("kyoto").people, 4);

    Object.defineProperty(globalThis, "localStorage", { configurable: true, get: () => { throw new Error("SecurityError"); } });
    assert.doesNotThrow(() => service.readMockTrips());
    assert.equal(service.saveMockTrip(generated), false);
    assert.equal(service.readMockTrip("generated-test").saved, false);
    assert.equal(service.readTripStorageNotice(), service.tripStorageNotice);
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
    await server.close();
  }
});
