import assert from "node:assert/strict";
import test from "node:test";
import type { ChatMessage } from "../src/api/chat.ts";
import { chatActionError, coordinationMessages, visibleChatMessages } from "../src/utils/chatCoordination.ts";

function message(id: number, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return { id, type: "USER", sender: { id: 1, nickname: "일행", characterId: 1 },
    text: `대화 ${id}`, payload: null, createdAt: "2026-11-18T10:00:00", ...overrides };
}

test("현재 구성원의 유효한 사용자 대화만 최근 100개를 오래된 순서로 전송한다", () => {
  const messages = Array.from({ length: 105 }, (_, index) => message(index + 1)).reverse();
  messages.push(message(106, { type: "AI" }), message(107, { type: "SYSTEM" }),
    message(108, { sender: null }), message(109, { text: "   " }),
    message(110, { text: "가".repeat(501) }),
    message(111, { sender: { id: 2, nickname: "나간 일행", characterId: null } }));
  const result = coordinationMessages(messages, [1]);
  assert.equal(result.length, 100);
  assert.deepEqual(result[0], { userId: 1, text: "대화 6" });
  assert.deepEqual(result.at(-1), { userId: 1, text: "대화 105" });
  assert.equal(messages[0].id, 105);
  assert.deepEqual(coordinationMessages(messages, []), []);
  assert.equal(coordinationMessages([message(1, { text: "가".repeat(500) })], [1])[0].text.length, 500);
});

test("조율 응답을 즉시 표시하고 서버에 같은 요약이 저장되면 중복 표시하지 않는다", () => {
  const payload = { card: { kind: "OPINION_SUMMARY", summaries: [{ userId: 1, point: "산책" }] },
    options: { title: "조율 방향", items: [{ id: "talk-more", label: "조금 더 이야기해 볼게요" }] } };
  const local = message(-1, { type: "AI", text: "요약", payload });
  assert.deepEqual(visibleChatMessages([], [local]), [local]);
  const saved = { ...local, id: 123 };
  assert.deepEqual(visibleChatMessages([saved], [local]), [saved]);
  const other = { ...saved, text: "다른 요약" };
  assert.equal(visibleChatMessages([other], [local]).length, 2);
});

test("투표 후보 응답은 pollId 기준으로 서버 메시지와 중복을 제거한다", () => {
  const local = message(-2, { type: "AI", payload: { card: { kind: "POLL", pollId: 7 } } });
  const saved = { ...local, id: 124, text: "서버 투표 안내" };
  assert.deepEqual(visibleChatMessages([saved], [local]), [saved]);
});

test("조율할 대화 없음과 후보 부족을 구분하고 일반 오류는 유지한다", () => {
  assert.match(chatActionError({ code: "NO_MESSAGES_TO_COORDINATE" }), /조율할 대화가 없어요/);
  assert.match(chatActionError({ code: "NO_POLL_CANDIDATES" }), /두 곳 이상/);
  assert.equal(chatActionError(new Error("연결 실패")), "연결 실패");
});
