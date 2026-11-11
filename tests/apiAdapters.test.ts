import assert from "node:assert/strict";
import test from "node:test";
import {
  isServerTripId,
  savedPlaceToTripPlace,
  tripDraftToApiInput,
} from "../src/api/adapters.ts";
import type { TripDraft } from "../src/types/trip.ts";

const draft: TripDraft = {
  version: 1,
  tripId: "demo",
  city: "오사카",
  country: "일본",
  startDate: "2026-11-18",
  endDate: "2026-11-21",
  companion: "친구",
  people: 3,
  outbound: null,
  inbound: null,
  stays: [],
  rental: null,
  places: [],
  selectedPlaceIds: [],
  source: "none",
  preferences: {
    text: "",
    tastes: [],
    pace: [],
    companion: [],
    analyzed: false,
  },
};

test("여행 초안을 백엔드 여행 생성 DTO로 변환한다", () => {
  assert.deepEqual(tripDraftToApiInput(draft), {
    city: "오사카",
    startDate: "2026-11-18",
    endDate: "2026-11-21",
    companion: "FRIEND",
    companionCount: 3,
  });
  assert.equal(isServerTripId("58"), true);
  assert.equal(isServerTripId("demo"), false);
});

test("백엔드 저장 장소의 확인 필요 상태를 화면 모델로 보존한다", () => {
  const place = savedPlaceToTripPlace(
    {
      id: 7,
      featureId: null,
      name: "34.64, 135.51",
      note: "구글맵 핀",
      googleUrl: null,
      source: "TAKEOUT",
      listNames: ["오사카"],
      placeId: null,
      address: null,
      latitude: null,
      longitude: null,
      category: null,
      matchStatus: "NEEDS_REVIEW",
    },
    "오사카",
  );

  assert.equal(place.id, "7");
  assert.equal(place.serverId, 7);
  assert.equal(place.needsMatch, true);
  assert.equal(place.title, "34.64, 135.51");
});

