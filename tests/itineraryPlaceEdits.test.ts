import assert from "node:assert/strict";
import test from "node:test";
import { editItineraryPlace } from "../src/utils/itineraryPlaceEdits.ts";

const visit = { itemId: "visit-a", placeId: "osaka-castle", stayMinutes: 30 };
const days = [{ date: "2026-12-01", visits: [visit] }, { date: "2026-12-02", visits: [] }];

test("장소의 방문 ID와 소요 시간을 유지하며 선택한 날짜로 옮긴다", () => {
  const result = editItineraryPlace(days, visit.itemId, { kind: "move", day: 2 });
  assert.deepEqual(result[0].visits, []);
  assert.deepEqual(result[1].visits, [{ ...visit, travelMode: null }]);
  assert.equal(days[0].visits.length, 1);
  assert.throws(() => editItineraryPlace(days, visit.itemId, { kind: "move", day: 1 }));
});

test("다른 장소로 바꾸면 이전 장소의 댓글과 좋아요가 연결되지 않도록 새 방문 ID를 쓴다", () => {
  const result = editItineraryPlace(days, visit.itemId, { kind: "replace", placeId: "park", itemId: "visit-b" });
  assert.deepEqual(result[0].visits, [{ ...visit, itemId: "visit-b", placeId: "park", travelMode: null }]);
  assert.equal(result[1], days[1]);
});

test("중간 방문을 이동·삭제·교체하면 바로 다음 방문만 이동 수단을 다시 계산한다", () => {
  const middle = { itemId: "v2", placeId: "park", travelMode: "DRIVE" as const };
  const after = { itemId: "v3", placeId: visit.placeId, travelMode: "TRANSIT" as const };
  const last = { itemId: "v4", placeId: "cafe", travelMode: "WALK" as const };
  const original = [{ ...days[0], visits: [visit, middle, after, last] }, days[1]];
  const removed = editItineraryPlace(original, middle.itemId, { kind: "remove" });
  assert.deepEqual(removed[0].visits, [visit, { ...after, travelMode: null }, last]);
  const moved = editItineraryPlace(original, middle.itemId, { kind: "move", day: 2 });
  assert.deepEqual(moved[0].visits, removed[0].visits);
  assert.deepEqual(moved[1].visits, [{ ...middle, travelMode: null }]);
  const replaced = editItineraryPlace(original, middle.itemId, { kind: "replace", placeId: "museum", itemId: "new" });
  assert.deepEqual(replaced[0].visits, [
    visit, { ...middle, placeId: "museum", itemId: "new", travelMode: null }, { ...after, travelMode: null }, last,
  ]);
  assert.equal(original[0].visits[2], after);
});
