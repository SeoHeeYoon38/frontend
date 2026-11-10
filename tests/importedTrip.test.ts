import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  courseDateLabels,
  formatTripDateRange,
  parseImportedTripRegistration,
} from "../src/utils/importedTrip.ts";

test("2박 3일 코스 날짜를 시작일 기준으로 계산한다", () => {
  assert.equal(addDays("2026-05-18", 2), "2026-05-20");
  assert.deepEqual(courseDateLabels("2026-05-18", 3), ["5.18", "5.19", "5.20"]);
  assert.equal(formatTripDateRange("2026-05-18", "2026-05-20"), "2026.5.18 – 5.20");
});

test("저장된 여행 등록 정보가 올바를 때만 복원한다", () => {
  const saved = JSON.stringify({
    startDate: "2026-05-18",
    endDate: "2026-05-20",
    companionType: "친구",
    peopleCount: 3,
  });
  assert.equal(parseImportedTripRegistration(saved)?.peopleCount, 3);
  assert.equal(parseImportedTripRegistration('{"peopleCount":20}'), null);
  assert.equal(parseImportedTripRegistration("broken"), null);
});
