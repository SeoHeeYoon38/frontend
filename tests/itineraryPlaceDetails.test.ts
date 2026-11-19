import assert from "node:assert/strict";
import test from "node:test";
import type { ItineraryVersionView, SavedPlaceResponse } from "../src/api/types.ts";
import { itineraryPlaceDetails, olderItinerary } from "../src/utils/itineraryPlaceDetails.ts";

const confirmed = { placeId: "p1", name: "용다리", address: "Đà Nẵng", latitude: 16.061, longitude: 108.227 };
const saved: SavedPlaceResponse = {
  ...confirmed, id: 1, name: "다낭 용다리", note: null, listNames: [], featureId: null,
  googleUrl: null, source: "MANUAL_SEARCH", category: "SIGHTSEEING", matchStatus: "MATCHED",
};

test("장소 목록 재조회 실패 후 선택한 장소의 이름과 한 쌍의 좌표를 유지한다", () => {
  assert.deepEqual(itineraryPlaceDetails([], [confirmed]).get("p1"), confirmed);
  const incomplete = { ...saved, latitude: null, longitude: 109 };
  const recovered = itineraryPlaceDetails([incomplete], [confirmed]).get("p1");
  assert.equal(recovered?.name, saved.name);
  assert.equal(recovered.latitude, confirmed.latitude);
  assert.equal(recovered.longitude, confirmed.longitude);
  assert.equal(itineraryPlaceDetails([{ ...saved, longitude: 108.23 }], [confirmed]).get("p1")?.longitude, 108.23);
});

test("늦게 도착한 이전 버전이나 빈 응답은 방금 저장한 일정 버전을 덮지 않는다", () => {
  const version = (version: number) => ({ version }) as ItineraryVersionView;
  assert.equal(olderItinerary(version(3), version(4)), true);
  assert.equal(olderItinerary(null, version(4)), true);
  assert.equal(olderItinerary(version(4), version(4)), false);
  assert.equal(olderItinerary(version(5), version(4)), false);
  assert.equal(olderItinerary(version(1)), false);
});
