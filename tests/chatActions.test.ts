import assert from "node:assert/strict";
import test from "node:test";
import { chatActions, isChatActionLabel, requestedChatAction } from "../src/utils/chatActions.ts";

test("채팅 하단의 세 도틀로 요청을 각 AI 기능으로 연결한다", () => {
  for (const { id, label } of chatActions) {
    assert.equal(requestedChatAction(`@도틀로 ${label}`), id);
    assert.equal(isChatActionLabel(`@도틀로 ${label}`), true);
  }
  assert.equal(requestedChatAction("@도틀로 난바 근처 맛집 추천해줘"), "recommend");
  assert.equal(requestedChatAction("가고 싶은 장소 정하기"), "recommend");
  assert.equal(requestedChatAction("일정 함께 조율하기"), "coordinate");
});

test("일반 메시지는 도틀로 요청으로 처리하지 않는다", () => {
  assert.equal(requestedChatAction("근처 맛집 추천해줄 수 있어?"), undefined);
  assert.equal(requestedChatAction("우리끼리 투표 만들기 해볼까?"), undefined);
});
