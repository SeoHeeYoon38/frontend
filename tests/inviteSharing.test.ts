import assert from "node:assert/strict";
import test from "node:test";
import { inviteSmsUrl } from "../src/utils/inviteSharing.ts";

const invite = "https://dotlo-zeta.vercel.app/invite/example";

test("메시지 공유는 링크가 들어간 새 SMS를 열고 수신자를 지정하지 않는다", () => {
  const url = inviteSmsUrl(invite, { userAgent: "Android", platform: "Linux", maxTouchPoints: 5 });
  assert.equal(url, `sms:?body=${encodeURIComponent(invite)}`);
});

test("iPhone과 데스크톱 모드의 iPad는 Apple 메시지 형식을 사용한다", () => {
  const iphone = { userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 5 };
  const ipad = { userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 5 };
  for (const device of [iphone, ipad]) {
    assert.equal(inviteSmsUrl(invite, device), `sms:&body=${encodeURIComponent(invite)}`);
  }
});
