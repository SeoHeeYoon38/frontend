import { apiRequest, queryString } from "./client";
import { coordinationMessages } from "../utils/chatCoordination";

export interface ChatCoordinationResult {
  text: string;
  card: { kind: "OPINION_SUMMARY"; summaries: Array<{ userId: number; point: string }> };
  options: { title: string; items: Array<{ id: string; label: string }> };
}

export interface ChatMessage {
  id: number;
  type: "USER" | "SYSTEM" | "AI";
  sender: { id: number; nickname: string; characterId: number | null } | null;
  text: string;
  payload: {
    card?: { kind: string; pollId?: number; summaries?: Array<{ userId: number; point: string }> };
    options?: { title: string; items: Array<{ id: string; label: string }> };
  } | null;
  createdAt: string;
}

export interface ChatPoll {
  pollId: number;
  question: string;
  status: "OPEN" | "CLOSED";
  totalMembers: number;
  votedCount: number;
  candidates: Array<{
    id: number;
    placeId: string;
    name: string;
    tagline: string | null;
    votes: number;
    voterUserIds: number[];
  }>;
}

export interface ChatMessageList {
  messages: ChatMessage[];
  polls: ChatPoll[];
}

export function getChatMessages(tripId: number, after?: number, signal?: AbortSignal) {
  return apiRequest<ChatMessageList>(`/api/trips/${tripId}/chat/messages${queryString({ after })}`, { signal });
}

export function sendChatMessage(tripId: number, value: string) {
  return apiRequest<ChatMessage>(`/api/trips/${tripId}/chat/messages`, {
    method: "POST", json: { text: value },
  });
}

export function coordinateChat(tripId: number, messages: ChatMessage[], memberIds: number[]) {
  const input = coordinationMessages(messages, memberIds);
  if (!input.length) throw new Error("조율할 대화가 없어요. 현재 일행과 먼저 이야기를 나눠 주세요.");
  return apiRequest<ChatCoordinationResult>(`/api/trips/${tripId}/chat/coordinate`, {
    method: "POST", json: { messages: input }, timeoutMs: 180_000,
  });
}

export function createChatPoll(tripId: number, direction: string, messages: ChatMessage[], memberIds: number[]) {
  if (!direction.trim() || direction.length > 100) throw new Error("조율 방향은 1~100자로 선택해 주세요.");
  return apiRequest<ChatPoll>(`/api/trips/${tripId}/chat/poll-candidates`, {
    method: "POST",
    json: { direction, messages: coordinationMessages(messages, memberIds) },
    timeoutMs: 180_000,
  });
}

export function voteChatPoll(tripId: number, pollId: number, candidateId: number) {
  return apiRequest<ChatPoll>(`/api/trips/${tripId}/chat/polls/${pollId}/votes`, {
    method: "POST", json: { candidateId },
  });
}
