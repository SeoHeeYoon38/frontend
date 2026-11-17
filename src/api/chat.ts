import { apiRequest, queryString } from "./client";

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

export function coordinateChat(tripId: number) {
  return apiRequest<unknown>(`/api/trips/${tripId}/chat/coordinate`, {
    method: "POST", timeoutMs: 180_000,
  });
}

export function createChatPoll(tripId: number, direction: string, messages: ChatMessage[]) {
  return apiRequest<ChatPoll>(`/api/trips/${tripId}/chat/poll-candidates`, {
    method: "POST",
    json: { direction, messages: messages.filter((item) => item.type === "USER").slice(-100)
      .map((item) => ({ userId: item.sender?.id ?? null, text: item.text })) },
    timeoutMs: 180_000,
  });
}

export function voteChatPoll(tripId: number, pollId: number, candidateId: number) {
  return apiRequest<ChatPoll>(`/api/trips/${tripId}/chat/polls/${pollId}/votes`, {
    method: "POST", json: { candidateId },
  });
}
