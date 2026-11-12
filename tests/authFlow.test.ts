import assert from "node:assert/strict";
import test from "node:test";
import { shouldCompleteSignup } from "../src/utils/authFlow.ts";

test("가입 완료 전 사용자는 약관 동의로 보낸다", () => {
  assert.equal(shouldCompleteSignup(false), true);
  assert.equal(shouldCompleteSignup(undefined), true);
});

test("가입 완료 사용자는 앱으로 보낸다", () => {
  assert.equal(shouldCompleteSignup(true), false);
});
