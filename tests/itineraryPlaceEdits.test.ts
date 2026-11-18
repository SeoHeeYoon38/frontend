import assert from "node:assert/strict";
import test from "node:test";
import { editItineraryPlace } from "../src/utils/itineraryPlaceEdits.ts";

const visit = { itemId: "visit-a", placeId: "osaka-castle", stayMinutes: 30 };
const days = [{ date: "2026-12-01", visits: [visit] }, { date: "2026-12-02", visits: [] }];

test("장소의 방문 ID와 소요 시간을 유지하며 선택한 날짜로 옮긴다", () => {
  const result = editItineraryPlace(days, visit.itemId, { kind: "move", day: 2 });
  assert.deepEqual(result[0].visits, []);
  assert.deepEqual(result[1].visits, [visit]);
  assert.equal(days[0].visits.length, 1);
  assert.throws(() => editItineraryPlace(days, visit.itemId, { kind: "move", day: 1 }));
});

test("다른 장소로 바꾸면 이전 장소의 댓글과 좋아요가 연결되지 않도록 새 방문 ID를 쓴다", () => {
  const result = editItineraryPlace(days, visit.itemId, { kind: "replace", placeId: "park", itemId: "visit-b" });
  assert.deepEqual(result[0].visits, [{ ...visit, itemId: "visit-b", placeId: "park" }]);
  assert.equal(result[1], days[1]);
});
