import type { ChatMessage } from "../api/chat.ts";

export function coordinationMessages(messages: ChatMessage[], memberIds: number[]) {
  const members = new Set(memberIds);
  return messages.filter((item) => item.type === "USER" && item.sender &&
    members.has(item.sender.id) && item.text.trim().length > 0 && item.text.length <= 500)
    .sort((a, b) => a.id - b.id).slice(-100)
    .map((item) => ({ userId: item.sender!.id, text: item.text }));
}

function resultKey(message: ChatMessage) {
  const card = message.payload?.card;
  if (card?.kind === "POLL") return JSON.stringify([card.kind, card.pollId]);
  return JSON.stringify([message.text, card?.kind,
    card?.summaries?.map((item) => [item.userId, item.point]),
    message.payload?.options?.title,
    message.payload?.options?.items.map((item) => [item.id, item.label])]);
}

export function visibleChatMessages(saved: ChatMessage[], local: ChatMessage[]) {
  const keys = new Set(saved.filter((item) => item.type === "AI").map(resultKey));
  return [...saved, ...local.filter((item) => !keys.has(resultKey(item)))];
}

export function chatActionError(reason: unknown) {
  if (reason && typeof reason === "object" && "code" in reason) {
    if (reason.code === "NO_MESSAGES_TO_COORDINATE") return "조율할 대화가 없어요. 현재 일행과 먼저 이야기를 나눠 주세요.";
    if (reason.code === "NO_POLL_CANDIDATES") return "일정과 중복되지 않는 후보를 두 곳 이상 찾지 못했어요. 다른 방향을 선택해 주세요.";
  }
  return reason instanceof Error ? reason.message : "요청을 처리하지 못했어요. 다시 시도해 주세요.";
}
