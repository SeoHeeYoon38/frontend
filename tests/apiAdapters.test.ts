import assert from "node:assert/strict";
import test from "node:test";
import {
  isServerTripId,
  onboardingPreferencesToInput,
  preferenceResultToDraft,
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

test("온보딩 관심사를 사용자 기본 취향 요청으로 변환한다", () => {
  assert.deepEqual(
    onboardingPreferencesToInput([
      "맛집 탐방",
      "카페 투어",
      "사진 명소",
      "골목 산책",
    ]),
    {
      pace: "NORMAL",
      walking: "NORMAL",
      dayStart: "NORMAL",
      interests: ["FOOD", "CAFE", "SIGHTSEEING"],
      avoid: [],
      notes: [],
      rawText: null,
    },
  );
});

test("사용자 기본 취향 응답을 여행 취향 화면 모델로 재사용한다", () => {
  const preferences = preferenceResultToDraft(
    {
      preferences: {
        pace: "RELAXED",
        walking: "LESS",
        dayStart: "LATE",
        interests: ["CAFE", "NATURE"],
        avoid: [],
        notes: [],
      },
      chips: [
        { type: "PACE", value: "RELAXED", label: "여유롭게" },
        { type: "WALKING", value: "LESS", label: "적게 걷기" },
        { type: "DAY_START", value: "LATE", label: "늦게 시작" },
        { type: "INTEREST", value: "CAFE", label: "카페" },
        { type: "INTEREST", value: "NATURE", label: "자연" },
      ],
      rawText: "천천히 다니고 싶어요",
    },
    draft,
  );

  assert.equal(preferences.text, "천천히 다니고 싶어요");
  assert.deepEqual(preferences.tastes, ["카페", "자연"]);
  assert.deepEqual(preferences.pace, ["여유롭게", "적게 걷기", "늦게 시작"]);
  assert.equal(preferences.analyzed, true);
});

