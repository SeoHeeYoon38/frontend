import assert from "node:assert/strict";
import test from "node:test";
import { shouldCompleteOnboarding } from "../src/utils/authFlow.ts";

test("신규 사용자와 닉네임을 완료하지 않은 기존 사용자는 온보딩으로 보낸다", () => {
  assert.equal(shouldCompleteOnboarding(true, { nickname: null }), true);
  assert.equal(shouldCompleteOnboarding(false, { nickname: null }), true);
  assert.equal(shouldCompleteOnboarding(false, { nickname: "   " }), true);
});

test("닉네임을 저장한 기존 사용자는 홈으로 보낸다", () => {
  assert.equal(shouldCompleteOnboarding(false, { nickname: "서희" }), false);
});
