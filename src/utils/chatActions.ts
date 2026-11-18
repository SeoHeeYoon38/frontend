export const chatActions = [
  { id: "coordinate", label: "AI 일정 조율", loading: "도틀로가 일정을 살펴보고 있어요…" },
  { id: "recommend", label: "AI 장소 추천", loading: "도틀로가 여행에 어울리는 장소를 찾고 있어요…" },
  { id: "poll", label: "투표 만들기", loading: "도틀로가 투표 후보를 찾고 있어요…" },
] as const;

export type ChatAction = typeof chatActions[number]["id"];

export const chatStarters: Array<{ text: string; action: ChatAction }> = [
  { text: "가고 싶은 장소 정하기", action: "recommend" },
  { text: "일정 함께 조율하기", action: "coordinate" },
  { text: "서로 다른 의견 조율하기", action: "coordinate" },
];

export function requestedChatAction(text: string): ChatAction | undefined {
  const starter = chatStarters.find((item) => item.text === text);
  if (starter) return starter.action;
  if (!/^@도틀로(?:\s|$)/.test(text)) return undefined;
  if (text.includes("투표")) return "poll";
  if (/장소|추천|맛집|카페/.test(text) && !text.includes("일정 조율")) return "recommend";
  return "coordinate";
}

export function isChatActionLabel(text: string) {
  return chatActions.some(({ label }) => text === `@도틀로 ${label}`);
}
