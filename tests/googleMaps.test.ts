import assert from "node:assert/strict";
import test from "node:test";
import { courseMapViewport, googleMapsEmbedUrl, googleMapsViewUrl, groupCourseMapPins, isMapCoordinate } from "../src/utils/googleMaps.ts";

test("course map centers on the selected day's coordinates", () => {
  const viewport = courseMapViewport([
    { latitude: 34.665, longitude: 135.497 },
    { latitude: 34.687, longitude: 135.525 },
  ], 402, 380);
  assert.ok(viewport);
  assert.ok(viewport.latitude > 34.665 && viewport.latitude < 34.687);
  assert.ok(viewport.longitude > 135.497 && viewport.longitude < 135.525);
  const embedded = new URL(googleMapsEmbedUrl(viewport));
  const external = new URL(googleMapsViewUrl(viewport));
  assert.equal(embedded.searchParams.get("ll"), external.searchParams.get("center"));
  assert.equal(embedded.hostname, "www.google.com");
});

test("missing or out-of-range coordinates do not create a map", () => {
  const located = [{ latitude: 100, longitude: 135 }, { latitude: 35, longitude: null }].filter(isMapCoordinate);
  assert.equal(courseMapViewport(located, 402, 380), null);
});

test("overlapping map pins merge in visit order and nearby pins separate at higher zoom", () => {
  const stops = [
    { latitude: 34.702, longitude: 135.490, order: 1 },
    { latitude: 34.675, longitude: 135.505, order: 2 },
    { latitude: 34.702, longitude: 135.490, order: 5 },
    { latitude: 34.701, longitude: 135.491, order: 6 },
  ];
  assert.deepEqual(groupCourseMapPins(stops, 13).map((pin) => pin.label), ["1·5·6", "2"]);
  const detailed = groupCourseMapPins(stops, 17);
  assert.deepEqual(detailed.map((pin) => pin.label), ["1·5", "2", "6"]);
  assert.deepEqual(detailed[0].places, [stops[0], stops[2]]);
});
