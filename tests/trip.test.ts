import assert from "node:assert/strict";
import { test } from "node:test";
import { destinationParticle, placeAsObject } from "../src/utils/trip.ts";

test("city selection uses the Korean particle for its final consonant", () => {
  assert.equal(destinationParticle("다낭"), "으로");
  assert.equal(destinationParticle("방콕"), "으로");
  assert.equal(destinationParticle("오사카"), "로");
  assert.equal(destinationParticle("서울"), "로");
  assert.equal(destinationParticle(""), "로");
});

test("장소를 안내할 때 이름의 받침에 맞는 조사를 쓴다", () => {
  assert.equal(placeAsObject("난바 야사카 신사"), "난바 야사카 신사를");
  assert.equal(placeAsObject("구로몬 시장"), "구로몬 시장을");
  assert.equal(placeAsObject("제2"), "제2를");
  assert.equal(placeAsObject("제3"), "제3을");
  assert.equal(placeAsObject("Osaka Castle"), "Osaka Castle");
});
