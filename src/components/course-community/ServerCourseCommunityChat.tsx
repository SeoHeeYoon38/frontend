import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addPlaceToItinerary, requestItineraryEdit } from "../../api/itineraries";
import { getPlaceDetail } from "../../api/places";
import { coordinateChat, createChatPoll, getChatMessages, getRecentChatPolls, sendChatMessage, voteChatPoll,
  type ChatMessage, type ChatPoll } from "../../api/chat";
import { getTripMembers } from "../../api/members";
import { getTrip } from "../../api/trips";
import type { MemberResponse, TripResponse } from "../../api/types";
import { apiTripToSummary } from "../../utils/serverTrip";
import { chatActionError, visibleChatMessages, type LocalChatResult } from "../../utils/chatCoordination";
import { chatActions, chatStarters, isChatActionLabel, requestedChatAction, type ChatAction } from "../../utils/chatActions";
import { mergePolls, pollWinner, withPollCards } from "../../utils/chatPolls";
import { placeDayError } from "../../utils/placeDaySuggestion";
import PlaceDayPicker from "../course-completion/PlaceDayPicker";
import TripSheet from "../common/TripSheet";
import ChatPendingBubble from "./ChatPendingBubble";
import backIcon from "../../assets/course-settings/back.svg";
import aiAvatar from "../../assets/course-community/ai-avatar.png";
import { profileCharacter } from "../../config/profileCharacters";
import sendIcon from "../../assets/course-community/send.svg";
import selectedCheckIcon from "../../assets/icons/status-selected-check.svg";

function mergeMessages(previous: ChatMessage[], incoming: ChatMessage[]) {
  const messages = new Map(previous.map((item) => [item.id, item]));
  incoming.forEach((item) => messages.set(item.id, item));
  return [...messages.values()].sort((a, b) => a.id - b.id);
}

interface Props {
  tripId: number;
  initialDay: number;
  onBack: () => void;
  onViewCourse: (day: number) => void;
}

export default function ServerCourseCommunityChat({ tripId, onBack, onViewCourse }: Props) {
  const [trip, setTrip] = useState<TripResponse>();
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [polls, setPolls] = useState<ChatPoll[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState(false);
  const [pendingAi, setPendingAi] = useState<ChatAction>();
  const [error, setError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [localResults, setLocalResults] = useState<LocalChatResult[]>([]);
  const placeNames = useRef(new Map<string, string>());
  const localId = useRef(-1);
  const [selectedPollId, setSelectedPollId] = useState<number>();
  const pollRevision = useRef(0);
  const history = useRef<ChatMessage[]>([]);
  const lifetime = useRef<AbortController | null>(null);
  const cursor = useRef(0);
  const sendInFlight = useRef(false);
  const actionInFlight = useRef(false);
  const composer = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const receiveMessages = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    history.current = mergeMessages(history.current, incoming);
    setMessages(history.current);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    const roomError = (reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "채팅방을 열지 못했어요.");
    };
    void getTrip(tripId, controller.signal).then((result) => {
      if (!controller.signal.aborted) setTrip(result);
    }).catch(roomError);
    void getTripMembers(tripId, controller.signal).then((result) => {
      if (!controller.signal.aborted) setMembers(result);
    }).catch(roomError);
    let fetching = false;
    const poll = async () => {
      if (fetching || controller.signal.aborted) return;
      const startedRevision = pollRevision.current;
      fetching = true;
      try {
        const response = await getChatMessages(tripId, cursor.current || undefined, controller.signal);
        if (controller.signal.aborted) return;
        receiveMessages(response.messages);
        for (const item of response.messages) cursor.current = Math.max(cursor.current, item.id);
        if (startedRevision === pollRevision.current && response.polls.length) {
          setPolls((current) => mergePolls(current, response.polls));
        }
        setReady(true);
        setSyncError("");
      } catch (reason) {
        if (!controller.signal.aborted) {
          setSyncError("채팅을 불러오지 못해 최근 투표를 확인하고 있어요.");
          try {
            const recent = await getRecentChatPolls(tripId, controller.signal);
            if (!controller.signal.aborted) {
              if (startedRevision === pollRevision.current) setPolls((current) => mergePolls(current, recent));
              setSyncError("최근 투표는 갱신했지만 채팅 조회에 실패했어요. 잠시 후 다시 확인합니다.");
            }
          } catch {
            if (!controller.signal.aborted) setSyncError(reason instanceof Error ? reason.message : "채팅과 최근 투표를 불러오지 못했어요.");
          }
        }
      } finally {
        fetching = false;
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 3_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [tripId, receiveMessages]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages.length, polls.length, localResults.length, pendingAi]);

  const receivePollUpdate = (poll: ChatPoll) => {
    pollRevision.current += 1;
    setPolls((current) => mergePolls(current, [poll]));
  };

  const run = async (action: () => Promise<unknown>, aiAction?: ChatAction) => {
    const signal = lifetime.current?.signal;
    if (actionInFlight.current || signal?.aborted) return;
    actionInFlight.current = true;
    setPending(true);
    setPendingAi(aiAction);
    setError("");
    try {
      await action();
    } catch (reason) {
      if (!signal?.aborted) setError(chatActionError(reason));
    } finally {
      actionInFlight.current = false;
      if (!signal?.aborted) {
        setPending(false);
        setPendingAi(undefined);
      }
    }
  };

  const send = async (value: string, clearComposer = false) => {
    const signal = lifetime.current?.signal;
    sendInFlight.current = true;
    setSending(true);
    setError("");
    if (clearComposer) setMessage("");
    try {
      const sent = await sendChatMessage(tripId, value, signal);
      if (!signal?.aborted) receiveMessages([sent]);
      return sent;
    } catch (reason) {
      if (clearComposer && !signal?.aborted) setMessage((draft) => draft || value);
      throw reason;
    } finally {
      sendInFlight.current = false;
      if (!signal?.aborted) setSending(false);
    }
  };

  const memberIds = members.map((member) => member.userId);
  const appendResult = (text: string, payload: ChatMessage["payload"], requestedAfterId?: number) => {
    const id = localId.current--;
    const afterMessageId = history.current.at(-1)?.id ?? 0;
    setLocalResults((current) => [...current, {
      id, type: "AI", sender: null, text, payload, afterMessageId, requestedAfterId, createdAt: new Date().toISOString(),
    }]);
  };
  const createPoll = async (direction: string, context = history.current) => {
    const signal = lifetime.current?.signal;
    const poll = await createChatPoll(tripId, direction, context, memberIds, signal);
    if (signal?.aborted) return;
    receivePollUpdate(poll);
    appendResult("투표할 장소를 골랐어요.", { card: { kind: "POLL", pollId: poll.pollId } }, context.at(-1)?.id ?? 0);
  };
  const chooseDirection = (label: string, isTalkMore: boolean) => {
    if (isTalkMore) {
      submit(label);
      composer.current?.focus();
      return;
    }
    void run(() => createPoll(label), "poll");
  };

  const recommendPlaces = async (request: string, signal?: AbortSignal) => {
    const prompt = [
      "현재 일정과 겹치지 않는 여행 장소를 최대 3곳 추천해 주세요.",
      "기존 일정은 유지하고 추천 장소만 수정안에 추가해 주세요.",
      request,
    ].filter(Boolean).join(" ");
    const preview = await requestItineraryEdit(tripId, prompt, signal);
    if (signal?.aborted) return;
    const ids = [...new Set(preview.diff.changes.filter((change) => change.kind === "ADDED").map((change) => change.placeId))].slice(0, 3);
    if (!ids.length) {
      appendResult("새로 추천할 장소를 찾지 못했어요. 가고 싶은 곳의 분위기나 지역을 알려주세요.", null);
      return;
    }
    const details = await Promise.allSettled(ids.map(async (id) => {
      const cached = placeNames.current.get(id);
      if (cached) return cached;
      const { name } = await getPlaceDetail(tripId, id, signal);
      if (name) placeNames.current.set(id, name);
      return name;
    }));
    if (signal?.aborted) return;
    const names = details.flatMap((result) => result.status === "fulfilled" && result.value ? [result.value] : []);
    appendResult(names.length
      ? `이런 곳을 추천해요.\n${names.join(" · ")}`
      : "추천 장소의 정보를 불러오지 못했어요. 잠시 후 다시 요청해 주세요.", null);
  };

  const submit = (value: string, action = requestedChatAction(value), clearComposer = false) => {
    if (!value || !ready || sendInFlight.current) return;
    const signal = lifetime.current?.signal;
    if (!action) {
      void send(value, clearComposer).catch((reason: unknown) => {
        if (!signal?.aborted) setError(chatActionError(reason));
      });
      return;
    }
    void run(async () => {
      const sent = await send(value, clearComposer);
      if (signal?.aborted) return;
      if (action === "coordinate") {
        const result = await coordinateChat(tripId, signal);
        if (!signal?.aborted) appendResult(result.text, { card: result.card, options: result.options }, sent.id);
        return;
      }
      const context = history.current;
      const lastTopic = context.findLast((item) => item.type === "USER" && !isChatActionLabel(item.text))?.text.trim();
      if (action === "recommend") await recommendPlaces(lastTopic?.slice(0, 260) ?? "", signal);
      else await createPoll(lastTopic?.slice(0, 100) || "이번 여행에서 가고 싶은 장소를 골라주세요.", context);
    }, action);
  };

  const me = members.find((member) => member.me);
  const title = trip ? apiTripToSummary(trip).title : "함께하는 여행";
  const selectedPoll = polls.find((poll) => poll.pollId === selectedPollId);
  const winner = selectedPoll && pollWinner(selectedPoll);
  const feed = useMemo(() => withPollCards(visibleChatMessages(messages, localResults), polls), [messages, localResults, polls]);

  return <main className="community-chat">
    <header className="community-chat__header">
      <button type="button" aria-label="코스로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button>
      <div><h1>{title}</h1><p>함께하는 {members.length}명</p></div>
      <ul aria-label="함께하는 멤버">{members.slice(0, 3).map((member) =>
        <li key={member.userId} title={member.name}>
          <img src={profileCharacter(member.characterId).image} alt={member.name} />
        </li>)}</ul>
    </header>

    <section className="community-chat__messages" aria-live="polite">
      {!ready && !error && <p role="status">채팅을 불러오고 있어요.</p>}
      {error && <p role="alert">{error}</p>}
      {syncError && <p role="alert">{syncError}</p>}
      {ready && messages.length === 0 && <article className="community-chat__ai-message">
        <img className="community-chat__ai-avatar" src={aiAvatar} alt="도틀로 AI" />
        <div><strong>도틀로 AI</strong><div className="community-chat__ai-bubble">
          <p>안녕하세요! 도틀로 AI예요.</p>
          <p>함께 여행을 준비하며 의견을 나누고 일정을 조율하는 공간이에요. 필요할 때 @도틀로로 불러주세요.</p>
        </div><p className="community-chat__prompt">어떤 이야기부터 나눠볼까요?</p>
          <div className="community-chat__options">
            {chatStarters.map(({ text }) =>
              <button type="button" key={text} disabled={pending} onClick={() => { setMessage(text); composer.current?.focus(); }}>{text}</button>)}
          </div>
        </div>
      </article>}
      {feed.map((item) => {
        if (item.type === "SYSTEM") return <p className="community-chat__system" key={item.id}>{item.text}</p>;
        if (item.type === "USER") return item.sender?.id === me?.userId
          ? <p className="community-chat__my-message" key={item.id}>{item.text}</p>
          : <div className="community-chat__member-message" key={item.id}>
            <img src={profileCharacter(item.sender?.characterId).image} alt="" />
            <div><strong>{item.sender?.nickname ?? "여행 멤버"}</strong><p>{item.text}</p></div>
          </div>;
        const pollId = item.payload?.card?.kind === "POLL" ? item.payload.card.pollId : undefined;
        const poll = polls.find((current) => current.pollId === pollId);
        return <article className="community-chat__ai-message" key={item.id}>
          <img className="community-chat__ai-avatar" src={aiAvatar} alt="" />
          <div><strong>도틀로 AI</strong>
            <div className={`community-chat__ai-bubble${item.payload?.card?.kind === "OPINION_SUMMARY" ? " community-chat__ai-bubble--summary" : ""}`}>
              {poll ? <><p>투표할 장소를 골랐어요.</p><p>마음에 드는 곳에 투표해 주세요!</p></> : <p>{item.text}</p>}
              {item.payload?.card?.kind === "OPINION_SUMMARY" && <ul>
                {item.payload.card.summaries?.map((summary) => {
                  const member = members.find((current) => current.userId === summary.userId);
                  return <li key={summary.userId}>
                    <img src={profileCharacter(member?.characterId).image} alt="" />
                    <span><b>{member?.name ?? "일행"}</b>{summary.point}</span>
                  </li>;
                })}
              </ul>}
            </div>
            {item.payload?.options && <><p className="community-chat__prompt">{item.payload.options.title}</p>
              <div className="community-chat__options">{item.payload.options.items.map((option) =>
                <button type="button" key={option.id} disabled={pending || sending}
                  onClick={() => chooseDirection(option.label, option.id === "talk-more")}>{option.label}</button>)}</div></>}
            {poll && <section className="community-poll" aria-label={poll.question}>
              <header><h2>{poll.question}</h2><span>{poll.totalMembers}명 중 {poll.votedCount}명 투표 · {poll.status === "CLOSED" ? "투표 마감" : "진행 중"}</span></header>
              <div>{poll.candidates.map((candidate) => <button key={candidate.id} type="button"
                disabled={pending || poll.status === "CLOSED" || !me}
                className={candidate.voterUserIds.includes(me?.userId ?? -1) ? "is-selected" : ""}
                aria-pressed={candidate.voterUserIds.includes(me?.userId ?? -1)}
                onClick={() => void run(async () => {
                  const result = await voteChatPoll(tripId, poll.pollId, candidate.id);
                  if (!lifetime.current?.signal.aborted) receivePollUpdate(result);
                })}>
                <span className="community-poll__check" aria-hidden="true">
                  {candidate.voterUserIds.includes(me?.userId ?? -1) && <img src={selectedCheckIcon} alt="" />}
                </span><span><strong>{candidate.name}</strong><small>{candidate.tagline}</small></span>
                <span className="community-poll__voters">
                  {candidate.voterUserIds.slice(0, 3).map((userId) => {
                    const voter = members.find((member) => member.userId === userId);
                    return voter ? <img key={userId} src={profileCharacter(voter.characterId).image} alt={voter.name} /> : null;
                  })}
                  <b>{candidate.votes}</b>
                </span>
              </button>)}</div>
              {poll.status === "OPEN" && <p>마감 전에는 다른 후보로 투표를 바꿀 수 있어요.</p>}
              {poll.status === "CLOSED" && !pollWinner(poll) && <p>단독 1위가 없어 장소를 자동으로 선택하지 않아요. 일행과 다시 조율해 주세요.</p>}
              <button className="community-poll__apply" type="button" disabled={pending || !pollWinner(poll)}
                onClick={() => setSelectedPollId(poll.pollId)}>1위 장소 일정에 넣기</button>
            </section>}
          </div>
        </article>;
      })}
      {pendingAi && <ChatPendingBubble action={pendingAi} />}
      <div ref={bottom} />
    </section>

    <footer className="community-chat__composer">
      <div className="community-chat__quick-actions">
        {chatActions.map(({ id, label }) => (
          <button type="button" key={id} disabled={sending || pending || !ready || !me}
            onClick={() => submit(`@도틀로 ${label}`, id)}><b>@도틀로</b> {label}</button>
        ))}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); submit(message.trim(), undefined, true); }}>
        <label><span className="course-community__sr-only">채팅 메시지</span>
          <input ref={composer} value={message} maxLength={500} disabled={!ready}
            placeholder="메시지를 입력하거나 @도틀로를 불러보세요"
            onChange={(event) => setMessage(event.target.value)} /></label>
        <button type="submit" disabled={!ready || sending || !message.trim() || (pending && !!requestedChatAction(message.trim()))} aria-label="메시지 보내기"><img src={sendIcon} alt="" /></button>
      </form>
    </footer>

    {selectedPoll && <TripSheet title={winner ? `${winner.name}, 언제 넣을까요?` : "투표 결과 확인"}
      closeDisabled={pending} onClose={() => setSelectedPollId(undefined)}>
      {winner ? <PlaceDayPicker key={`${selectedPoll.pollId}:${winner.placeId}`} tripId={tripId}
        placeId={winner.placeId} pending={pending} onConfirm={async (day) => {
          await run(async () => {
            try {
              await addPlaceToItinerary(tripId, winner.placeId, day);
              if (lifetime.current?.signal.aborted) return;
              setSelectedPollId(undefined);
              onViewCourse(day);
            } catch (reason) { throw new Error(placeDayError(reason)); }
          });
        }} /> : <p>투표가 마감되고 단독 1위가 정해진 후 다시 선택해 주세요.</p>}
      {error && <p role="alert">{error}</p>}
    </TripSheet>}
  </main>;
}
