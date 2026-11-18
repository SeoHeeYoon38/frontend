import assert from "node:assert/strict";
import test from "node:test";
import type { ChatMessage, ChatPoll } from "../src/api/chat.ts";
import { mergePolls, pollWinner, readRecentPolls, withPollCards } from "../src/utils/chatPolls.ts";

function poll(overrides: Partial<ChatPoll> = {}): ChatPoll {
  return { pollId: 7, question: "어디로 갈까요?", status: "OPEN", totalMembers: 3, votedCount: 1,
    candidates: [
      { id: 11, placeId: "castle", name: "성", tagline: null, votes: 1, voterUserIds: [1] },
      { id: 12, placeId: "park", name: "공원", tagline: null, votes: 0, voterUserIds: [] },
    ], ...overrides };
}

test("투표 변경 응답으로 선택 후보·득표·투표자를 교체하고 같은 투표를 중복 생성하지 않는다", () => {
  const before = poll();
  const changed = poll({ candidates: [
    { ...before.candidates[0], votes: 0, voterUserIds: [] },
    { ...before.candidates[1], votes: 1, voterUserIds: [1] },
  ] });
  const result = mergePolls([before], [changed]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], changed);
  assert.equal(before.candidates[0].votes, 1);
});

test("서버 CLOSED 상태를 반영하고 늦게 도착한 OPEN 응답으로 다시 열지 않는다", () => {
  const closed = poll({ status: "CLOSED", votedCount: 3 });
  assert.equal(mergePolls([poll()], [closed])[0].status, "CLOSED");
  assert.deepEqual(mergePolls([closed], [poll()]), [closed]);
  assert.equal(pollWinner(closed)?.placeId, "castle");
});

test("마감 전·무득표·공동 1위는 일정 반영 대상을 임의로 고르지 않는다", () => {
  assert.equal(pollWinner(poll()), undefined);
  assert.equal(pollWinner(poll({ status: "CLOSED", candidates: [] })), undefined);
  const tied = poll({ status: "CLOSED" });
  tied.candidates[1].votes = 1;
  assert.equal(pollWinner(tied), undefined);
  tied.candidates.forEach((candidate) => { candidate.votes = 0; });
  assert.equal(pollWinner(tied), undefined);
});

test("최근 투표만 복구되어도 카드를 표시하고 저장된 채팅 카드가 있으면 중복을 만들지 않는다", () => {
  const recent = poll();
  const result = withPollCards([], [recent]);
  assert.equal(result[0].payload?.card?.pollId, 7);
  const saved: ChatMessage = { ...result[0], id: 123 };
  assert.deepEqual(withPollCards([saved], [recent]), [saved]);
  assert.equal(mergePolls([recent], []).length, 1);
});

test("최근 투표 응답은 배열 또는 polls 목록을 읽고 잘못된 응답은 기존 상태를 덮어쓰지 않는다", () => {
  assert.deepEqual(readRecentPolls([poll()]), [poll()]);
  assert.deepEqual(readRecentPolls({ polls: [poll()] }), [poll()]);
  assert.deepEqual(readRecentPolls([]), []);
  assert.throws(() => readRecentPolls({}), /최근 투표 응답/);
  assert.throws(() => readRecentPolls([{ pollId: 7 }]), /최근 투표 응답/);
});
