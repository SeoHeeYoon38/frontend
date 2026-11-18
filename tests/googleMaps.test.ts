import assert from "node:assert/strict";
import test from "node:test";
import { courseMapViewport, googleMapsEmbedUrl, googleMapsViewUrl, isMapCoordinate, layoutCourseMapPins } from "../src/utils/googleMaps.ts";

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

test("map pins stay separate even for identical coordinates and close visits", () => {
  const anchors = [{ x: 42, y: 28 }, { x: 42, y: 28 }, { x: 51, y: 29 }, { x: 200, y: 140 }];
  const placed = layoutCourseMapPins(anchors, 362, 264);
  assert.equal(placed.length, anchors.length);
  assert.deepEqual(placed[0], anchors[0]);
  assert.deepEqual(placed[3], anchors[3]);
  for (const [index, pin] of placed.entries()) {
    for (const other of placed.slice(index + 1)) {
      assert.ok(Math.hypot(pin.x - other.x, pin.y - other.y) >= 26);
    }
  }
});

test("a pin near the edge moves toward space inside a small map", () => {
  const anchor = { x: 287, y: 176 };
  const [first, second] = layoutCourseMapPins([anchor, anchor], 304, 200);
  assert.deepEqual(first, anchor);
  assert.ok(second.x >= 12 && second.x <= 292);
  assert.ok(second.y >= 12 && second.y <= 188);
  assert.ok(Math.hypot(first.x - second.x, first.y - second.y) >= 26);
});
