import assert from "node:assert/strict";
import test from "node:test";
import { allowsMockFallback, resolveApiMode } from "../src/api/mode.ts";

test("배포 빌드는 설정값과 관계없이 실서버 모드를 사용한다", () => {
  assert.equal(resolveApiMode(undefined, true), "live");
  assert.equal(resolveApiMode("auto", true), "live");
  assert.equal(resolveApiMode("mock", true), "live");
});

test("로컬 개발은 명시한 API 모드를 사용한다", () => {
  assert.equal(resolveApiMode(undefined, false), "auto");
  assert.equal(resolveApiMode("mock", false), "mock");
  assert.equal(resolveApiMode("live", false), "live");
});

test("실서버 모드에서는 목업 폴백을 허용하지 않는다", () => {
  assert.equal(allowsMockFallback("live"), false);
  assert.equal(allowsMockFallback("auto"), true);
  assert.equal(allowsMockFallback("mock"), true);
});
