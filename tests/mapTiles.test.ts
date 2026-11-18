import assert from "node:assert/strict";
import test from "node:test";
import { mapTileLayout } from "../src/utils/mapTiles.ts";

test("실제 좌표의 지도 핀을 화면 안에 배치한다", () => {
  const layout = mapTileLayout([
    { latitude: 34.6687, longitude: 135.5013 },
    { latitude: 34.6937, longitude: 135.5023 },
  ], 362, 264);
  assert.ok(layout);
  assert.ok(layout.tiles.length > 0);
  assert.ok(layout.pins.every(({ x, y }) => x >= 32 && x <= 330 && y >= 32 && y <= 232));
  assert.ok(layout.zoom >= 2 && layout.zoom <= 16);
});

test("좌표가 없거나 잘못되면 지도를 만들지 않는다", () => {
  assert.equal(mapTileLayout([], 362, 264), null);
  assert.equal(mapTileLayout([{ latitude: NaN, longitude: 135 }], 362, 264), null);
});
