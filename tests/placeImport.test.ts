import assert from "node:assert/strict";
import test from "node:test";
import { validateMapsListLink, validateTakeoutFile } from "../src/utils/placeImport.ts";

test("Takeout ZIP·CSV는 20MB까지 선택할 수 있다", () => {
  const limit = 20 * 1024 * 1024;
  assert.equal(validateTakeoutFile({ name: "takeout.ZIP", size: limit }), "");
  assert.equal(validateTakeoutFile({ name: "오사카 맛집.csv", size: 100 }), "");
  assert.match(validateTakeoutFile({ name: "takeout.zip", size: limit + 1 }), /20MB/);
  assert.match(validateTakeoutFile({ name: "saved.json", size: 100 }), /ZIP 또는 CSV/);
  assert.match(validateTakeoutFile({ name: "empty.csv", size: 0 }), /빈 파일/);
});

test("Google Maps 공유 링크의 주소 형식을 검사한다", () => {
  assert.equal(validateMapsListLink(" https://maps.app.goo.gl/sample "), "");
  assert.equal(validateMapsListLink("https://www.google.com/maps/placelists/list/sample"), "");
  assert.notEqual(validateMapsListLink("https://maps.app.goo.gl.example.com/sample"), "");
  assert.notEqual(validateMapsListLink("https://maps.app.goo.gl/"), "");
  assert.notEqual(validateMapsListLink("http://maps.app.goo.gl/sample"), "");
  assert.notEqual(validateMapsListLink("https://www.google.com/search"), "");
});
