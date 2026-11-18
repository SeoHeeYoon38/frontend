import assert from "node:assert/strict";
import { test } from "node:test";
import { destinationParticle } from "../src/utils/trip.ts";

test("city selection uses the Korean particle for its final consonant", () => {
  assert.equal(destinationParticle("다낭"), "으로");
  assert.equal(destinationParticle("방콕"), "으로");
  assert.equal(destinationParticle("오사카"), "로");
  assert.equal(destinationParticle("서울"), "로");
  assert.equal(destinationParticle(""), "로");
});
