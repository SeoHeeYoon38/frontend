import assert from "node:assert/strict";
import test from "node:test";
import { readMockScenario } from "../src/utils/mockScenario.ts";

test("지원하는 빈 화면 목업 시나리오만 읽는다", () => {
  assert.equal(readMockScenario("?mock=home-empty"), "home-empty");
  assert.equal(
    readMockScenario("?mode=direct&mock=direct-search-empty"),
    "direct-search-empty",
  );
  assert.equal(readMockScenario("?mock=unknown"), null);
  assert.equal(readMockScenario(""), null);
});
