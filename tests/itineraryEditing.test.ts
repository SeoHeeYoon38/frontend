import assert from "node:assert/strict";
import test from "node:test";
import { editedItineraryDays, moveVisit, reorderVisit } from "../src/utils/itineraryEditing.ts";

const dates = ["2026-12-10", "2026-12-11"];
const places = {
  "visit-a": { travelModeFrom: `@${dates[0]}`, visit: { itemId: "visit-a", placeId: "same-place", stayMinutes: 90, fixedStart: null, travelMode: "WALK" as const } },
  "visit-b": { travelModeFrom: "visit-a", visit: { itemId: "visit-b", placeId: "other-place", stayMinutes: 30, fixedStart: "12:00", travelMode: "TRANSIT" as const } },
  "visit-c": { travelModeFrom: `@${dates[1]}`, visit: { itemId: "visit-c", placeId: "same-place", stayMinutes: 45, fixedStart: null, travelMode: null } },
};

test("같은 장소의 복수 방문을 삭제·정렬·날짜 이동해도 남은 방문 ID와 세부 정보를 보존한다", () => {
  const original = { 1: ["visit-a", "visit-b"], 2: ["visit-c"] };
  const reordered = { ...original, 1: reorderVisit(original[1], "visit-b", -1) };
  const moved = moveVisit(reordered, "visit-a", 2);
  const edited = { ...moved, 1: moved[1].filter((id) => id !== "visit-b") };
  const days = editedItineraryDays(dates, edited, places);

  assert.deepEqual(days, [
    { date: dates[0], visits: [] },
    { date: dates[1], visits: [places["visit-c"].visit, { ...places["visit-a"].visit, travelMode: null }] },
  ]);
  assert.deepEqual(original, { 1: ["visit-a", "visit-b"], 2: ["visit-c"] });
  const reactions = new Map([
    ["visit-a", { likeCount: 2, commentCount: 3 }],
    ["visit-c", { likeCount: 1, commentCount: 4 }],
  ]);
  assert.deepEqual(days[1].visits.map((visit) => reactions.get(visit.itemId!)), [
    { likeCount: 1, commentCount: 4 }, { likeCount: 2, commentCount: 3 },
  ]);
  days[1].visits[0].stayMinutes = 120;
  assert.equal(places["visit-c"].visit.stayMinutes, 45);
});

test("구간이 달라졌을 때만 이동 수단을 비우고 새 구간에서 다시 선택한 수단을 보존한다", () => {
  const reordered = { 1: ["visit-b", "visit-a"], 2: ["visit-c"] };
  assert.deepEqual(editedItineraryDays(dates, reordered, places)[0].visits, [
    { ...places["visit-b"].visit, travelMode: null },
    { ...places["visit-a"].visit, travelMode: null },
  ]);
  const withNewChoice = {
    ...places,
    "visit-a": { travelModeFrom: "visit-b", visit: { ...places["visit-a"].visit, travelMode: "DRIVE" as const } },
  };
  assert.equal(editedItineraryDays(dates, reordered, withNewChoice)[0].visits[1].travelMode, "DRIVE");
  const originalOrder = { 1: ["visit-a", "visit-b"], 2: ["visit-c"] };
  assert.deepEqual(editedItineraryDays(dates, originalOrder, places)[0].visits, [places["visit-a"].visit, places["visit-b"].visit]);
  assert.equal(editedItineraryDays(dates, { 1: ["visit-c"], 2: ["visit-a", "visit-b"] }, places)[1].visits[1].travelMode, "TRANSIT");
});

test("방문 순서 변경 시 경계와 없는 방문을 무시하고 원본 배열을 보존한다", () => {
  const ids = ["visit-a", "visit-b"];
  assert.deepEqual(reorderVisit(ids, "visit-b", -1), ["visit-b", "visit-a"]);
  assert.deepEqual(reorderVisit(ids, "visit-a", 1), ["visit-b", "visit-a"]);
  assert.equal(reorderVisit(ids, "visit-a", -1), ids);
  assert.equal(reorderVisit(ids, "visit-b", 1), ids);
  assert.equal(reorderVisit(ids, "missing", 1), ids);
  assert.deepEqual(ids, ["visit-a", "visit-b"]);
});

test("저장할 방문 정보가 없으면 조용히 누락시키지 않는다", () => {
  assert.throws(() => editedItineraryDays(dates, { 1: ["missing"] }, places), /장소 정보/);
});
