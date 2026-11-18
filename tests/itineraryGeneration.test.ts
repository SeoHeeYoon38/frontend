import assert from "node:assert/strict";
import test from "node:test";
import { isNewGeneratedItinerary } from "../src/utils/itineraryGeneration.ts";

test("시간 초과 뒤 기존 일정이나 수동 수정본을 새 AI 생성 결과로 오인하지 않는다", () => {
  assert.equal(isNewGeneratedItinerary(null, 0), false);
  assert.equal(isNewGeneratedItinerary({ source: "AI_GENERATED", version: 2 }, 2), false);
  assert.equal(isNewGeneratedItinerary({ source: "MANUAL_EDIT", version: 3 }, 2), false);
});

test("서버에 새 AI 일정 버전이 생기면 시간 초과 후에도 생성 성공으로 처리할 수 있다", () => {
  assert.equal(isNewGeneratedItinerary({ source: "AI_GENERATED", version: 1 }, 0), true);
  assert.equal(isNewGeneratedItinerary({ source: "AI_GENERATED", version: 3 }, 2), true);
});
