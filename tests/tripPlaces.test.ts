import assert from "node:assert/strict";
import test from "node:test";
import type { SavedPlaceResponse } from "../src/api/types.ts";
import { savedPlacesForTripCity } from "../src/utils/tripPlaces.ts";

const osaka: SavedPlaceResponse = {
  id: 1, featureId: null, name: "도톤보리", note: null, googleUrl: null,
  source: "SHARED_LINK", listNames: [], placeId: "dotonbori", address: null,
  latitude: 34.6687, longitude: 135.5013, category: "SIGHTSEEING", matchStatus: "MATCHED",
};
const daNang: SavedPlaceResponse = {
  ...osaka, id: 2, name: "미케 비치", placeId: "my-khe", latitude: 16.062, longitude: 108.246,
};

test("여행 도시를 변경하면 이전 도시에 매칭된 저장 장소는 일정에 담지 않는다", () => {
  const places = [osaka, daNang];
  assert.deepEqual(savedPlacesForTripCity(places, { lat: 16.0544, lng: 108.2022 }), [daNang]);
  assert.deepEqual(savedPlacesForTripCity(places, { lat: 34.6937, lng: 135.5023 }), [osaka]);
});

test("좌표가 없는 저장 장소는 확인을 요구하고 서버가 도시 밖으로 분류한 장소를 제외한다", () => {
  const unknown = { ...daNang, id: 3, latitude: null, longitude: null };
  const outside = { ...daNang, id: 4, matchStatus: "OUT_OF_CITY" as const };
  assert.deepEqual(savedPlacesForTripCity([unknown, outside], { lat: 16.0544, lng: 108.2022 }), [
    { ...unknown, matchStatus: "NEEDS_REVIEW" },
  ]);
  assert.equal(unknown.matchStatus, "MATCHED");
});
