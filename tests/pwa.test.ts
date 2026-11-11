import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("PWA 매니페스트가 설치 가능한 기본 정보를 제공한다", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
  ) as {
    display: string;
    icons: Array<{ purpose: string; sizes: string; src: string }>;
    name: string;
    start_url: string;
  };

  assert.equal(manifest.name, "Dotlo - 함께 만드는 여행 일정");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons, [
    {
      src: "/dotlo-icon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable",
    },
  ]);
});

test("서비스 워커는 외부 API 요청을 캐시 대상에서 제외한다", () => {
  const serviceWorker = readFileSync(
    new URL("../public/sw.js", import.meta.url),
    "utf8",
  );

  assert.match(serviceWorker, /url\.origin !== self\.location\.origin/);
  assert.match(serviceWorker, /request\.method !== "GET"/);
});
