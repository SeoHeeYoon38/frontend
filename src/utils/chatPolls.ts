import type { ChatMessage, ChatPoll } from "../api/chat.ts";

export function pollWinner(poll: ChatPoll) {
  if (poll.status !== "CLOSED") return undefined;
  const highest = Math.max(0, ...poll.candidates.map((item) => item.votes));
  const winners = poll.candidates.filter((item) => item.votes === highest);
  return highest > 0 && winners.length === 1 ? winners[0] : undefined;
}

export function mergePolls(current: ChatPoll[], incoming: ChatPoll[]) {
  const byId = new Map(current.map((poll) => [poll.pollId, poll]));
  incoming.forEach((poll) => {
    if (byId.get(poll.pollId)?.status === "CLOSED" && poll.status === "OPEN") return;
    byId.set(poll.pollId, poll);
  });
  return [...byId.values()].sort((a, b) => a.pollId - b.pollId);
}

export function withPollCards(messages: ChatMessage[], polls: ChatPoll[]): ChatMessage[] {
  const shown = new Set(messages.filter((item) => item.payload?.card?.kind === "POLL")
    .map((item) => item.payload?.card?.pollId));
  return [...messages, ...polls.filter((poll) => !shown.has(poll.pollId)).map((poll): ChatMessage => ({
    id: -1_000_000_000 - poll.pollId, type: "AI", sender: null, text: poll.question,
    payload: { card: { kind: "POLL", pollId: poll.pollId } }, createdAt: "",
  }))];
}

export function readRecentPolls(value: unknown): ChatPoll[] {
  const polls = Array.isArray(value) ? value
    : value && typeof value === "object" && "polls" in value ? value.polls : undefined;
  if (!Array.isArray(polls) || !polls.every((poll) => poll && typeof poll === "object" &&
    Number.isInteger(poll.pollId) && typeof poll.question === "string" &&
    ["OPEN", "CLOSED"].includes(poll.status) && Number.isInteger(poll.totalMembers) &&
    Number.isInteger(poll.votedCount) && Array.isArray(poll.candidates) &&
    poll.candidates.every((item: ChatPoll["candidates"][number]) => item && Number.isInteger(item.id) &&
      typeof item.placeId === "string" && typeof item.name === "string" && Number.isInteger(item.votes) &&
      Array.isArray(item.voterUserIds) && item.voterUserIds.every(Number.isInteger)))) {
    throw new Error("최근 투표 응답을 확인하지 못했어요. 다시 시도해 주세요.");
  }
  return polls;
}
