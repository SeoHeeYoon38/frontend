import assert from "node:assert/strict";
import test from "node:test";
import { initialSuggestedDay, placeDayError } from "../src/utils/placeDaySuggestion.ts";
import type { PlaceDaySuggestion } from "../src/api/types.ts";

const suggestion: PlaceDaySuggestion = {
  placeId: "castle", placeName: "오사카성", recommendedDay: 2,
  days: [
    { day: 1, date: "2026-12-10", visitCount: 3, recommended: false },
    { day: 2, date: "2026-12-11", visitCount: 1, recommended: true },
  ],
};

test("추천 날짜는 1부터 시작하는 실제 일차 번호로 선택한다", () => {
  assert.equal(initialSuggestedDay(suggestion), 2);
  assert.equal(suggestion.days[0].visitCount, 3);
});

test("추천이 없거나 목록에 없는 추천이면 수동 선택 전에는 확정하지 않는다", () => {
  assert.equal(initialSuggestedDay({ ...suggestion, recommendedDay: null }), undefined);
  assert.equal(initialSuggestedDay({ ...suggestion, recommendedDay: 3 }), undefined);
  assert.equal(initialSuggestedDay({ ...suggestion, days: [] }), undefined);
});

test("날짜 추천의 주요 오류를 구분하고 일반 오류 메시지를 보존한다", () => {
  assert.match(placeDayError({ code: "PLACE_ALREADY_IN_ITINERARY" }), /이미 일정/);
  assert.match(placeDayError({ code: "PLACE_NOT_PLANNABLE" }), /확인이 필요한/);
  assert.match(placeDayError({ code: "STAY_REQUIRED" }), /숙소/);
  assert.match(placeDayError({ code: "ITINERARY_NOT_FOUND" }), /먼저 저장/);
  assert.equal(placeDayError(new Error("외부 서비스 오류")), "외부 서비스 오류");
});
