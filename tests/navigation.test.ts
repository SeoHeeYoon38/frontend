import assert from "node:assert/strict";
import test from "node:test";
import {
  readPlanOrigin,
  settingsBackPath,
  tripCommunityPath,
  tripPlanBackPath,
  tripPlanPath,
  tripSettingsPath,
} from "../src/utils/navigation.ts";

test("일정 결과 경로에 진입 출처와 코스가 유지된다", () => {
  assert.equal(
    tripPlanPath("courses", "kyoto-walk"),
    "/trips/plan?from=courses&course=kyoto-walk",
  );
  assert.equal(readPlanOrigin("?from=generated"), "generated");
  assert.equal(readPlanOrigin("?from=my-trips"), "my-trips");
  assert.equal(readPlanOrigin("?from=unknown"), "home");
});

test("일정 결과와 설정 화면의 뒤로가기는 앱 안에서 이어진다", () => {
  assert.equal(tripPlanBackPath("?from=courses"), "/courses");
  assert.equal(tripPlanBackPath("?from=my-trips"), "/my-trips");
  assert.equal(tripPlanBackPath("?from=generated"), "/");
  assert.equal(tripSettingsPath("generated"), "/trips/settings?from=generated");
  assert.equal(tripCommunityPath("generated"), "/trips/community?from=generated");
  assert.equal(settingsBackPath("?from=courses"), "/trips/plan?from=courses");
});
