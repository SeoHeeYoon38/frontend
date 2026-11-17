import { useEffect, useRef, useState } from "react";
import { addPlaceToItinerary } from "../../api/itineraries";
import { coordinateChat, createChatPoll, getChatMessages, sendChatMessage, voteChatPoll,
  type ChatMessage, type ChatPoll } from "../../api/chat";
import { getTripMembers } from "../../api/members";
import { getTrip } from "../../api/trips";
import type { MemberResponse, TripResponse } from "../../api/types";
import { apiTripToSummary } from "../../utils/serverTrip";
import backIcon from "../../assets/course-settings/back.svg";
import aiAvatar from "../../assets/course-community/ai-avatar.png";
import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import sendIcon from "../../assets/course-community/send.svg";
import selectedCheckIcon from "../../assets/icons/status-selected-check.svg";
import closeIcon from "../../assets/icons/action-close.svg";

function avatarFor(characterId: number | null) {
  return characterId === 2 ? avatarPurple : characterId === 3 ? avatarYellow : avatarBlue;
}

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

export default function ServerCourseCommunityChat({ tripId, initialDay, onBack, onViewCourse }: Props) {
  const [trip, setTrip] = useState<TripResponse>();
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [polls, setPolls] = useState<ChatPoll[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedPoll, setSelectedPoll] = useState<ChatPoll>();
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const cursor = useRef(0);
  const fetching = useRef(false);
  const actionInFlight = useRef(false);
  const composer = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([getTrip(tripId, controller.signal), getTripMembers(tripId, controller.signal)])
      .then(([tripResponse, memberResponse]) => {
        if (!controller.signal.aborted) {
          setTrip(tripResponse);
          setMembers(memberResponse);
        }
      }).catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "채팅방을 열지 못했어요.");
      });
    const poll = async () => {
      if (fetching.current || controller.signal.aborted) return;
      fetching.current = true;
      try {
        const response = await getChatMessages(tripId, cursor.current || undefined, controller.signal);
        if (controller.signal.aborted) return;
        if (response.messages.length) cursor.current = response.messages.at(-1)!.id;
        setMessages((current) => mergeMessages(current, response.messages));
        setPolls(response.polls);
        setReady(true);
        setError("");
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "채팅 내용을 불러오지 못했어요.");
      } finally {
        fetching.current = false;
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 3_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [tripId]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages.length, polls.length]);

  const refresh = async () => {
    const response = await getChatMessages(tripId, cursor.current || undefined);
    if (response.messages.length) cursor.current = response.messages.at(-1)!.id;
    setMessages((current) => mergeMessages(current, response.messages));
    setPolls(response.polls);
  };

  const run = async (action: () => Promise<unknown>) => {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setPending(true);
    setError("");
    try {
      await action();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "요청을 처리하지 못했어요.");
    } finally {
      actionInFlight.current = false;
      setPending(false);
    }
  };

  const send = async (value: string) => {
    await sendChatMessage(tripId, value);
    setMessage("");
  };

  const chooseDirection = (label: string, isTalkMore: boolean) => void run(async () => {
    await sendChatMessage(tripId, label);
    if (!isTalkMore) await createChatPoll(tripId, label, messages);
  });

  const makePoll = () => {
    const direction = [...messages].reverse().find((item) => item.type === "USER")?.text.trim().slice(0, 100);
    if (!direction) return;
    void run(() => createChatPoll(tripId, direction, messages));
  };

  const me = members.find((member) => member.me);
  const title = trip ? apiTripToSummary(trip).title : "함께하는 여행";
  const days = trip?.startDate && trip.endDate
    ? Math.max(1, Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / 86_400_000) + 1)
    : 1;

  return <main className="community-chat">
    <header className="community-chat__header">
      <button type="button" aria-label="코스로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button>
      <div><h1>{title}</h1><p>함께하는 {members.length}명</p></div>
      <ul aria-label="함께하는 멤버">{members.slice(0, 3).map((member) =>
        <li key={member.userId} title={member.name}>
          <img src={member.profileImageUrl || avatarFor(member.characterId)} alt={member.name} />
        </li>)}</ul>
    </header>

    <section className="community-chat__messages" aria-live="polite">
      {!ready && !error && <p role="status">채팅을 불러오고 있어요.</p>}
      {error && <p role="alert">{error}</p>}
      {ready && messages.length === 0 && <article className="community-chat__ai-message">
        <img className="community-chat__ai-avatar" src={aiAvatar} alt="도틀로 AI" />
        <div><strong>도틀로 AI</strong><div className="community-chat__ai-bubble">
          <p>안녕하세요! 도틀로 AI예요.</p>
          <p>함께 여행을 준비하며 의견을 나누고 일정을 조율하는 공간이에요. 필요할 때 @도틀로로 불러주세요.</p>
        </div><p className="community-chat__prompt">어떤 이야기부터 나눠볼까요?</p>
          <div className="community-chat__options">
            {["가고 싶은 장소 정하기", "일정 함께 조율하기", "서로 다른 의견 조율하기"].map((label) =>
              <button type="button" key={label} onClick={() => { setMessage(label); composer.current?.focus(); }}>{label}</button>)}
          </div>
        </div>
      </article>}
      {messages.map((item) => {
        if (item.type === "SYSTEM") return <p className="community-chat__system" key={item.id}>{item.text}</p>;
        if (item.type === "USER") return item.sender?.id === me?.userId
          ? <p className="community-chat__my-message" key={item.id}>{item.text}</p>
          : <div className="community-chat__member-message" key={item.id}>
            <img src={avatarFor(item.sender?.characterId ?? null)} alt="" />
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
                    <img src={member?.profileImageUrl || avatarFor(member?.characterId ?? null)} alt="" />
                    <span><b>{member?.name ?? "일행"}</b>{summary.point}</span>
                  </li>;
                })}
              </ul>}
            </div>
            {item.payload?.options && <><p className="community-chat__prompt">{item.payload.options.title}</p>
              <div className="community-chat__options">{item.payload.options.items.map((option) =>
                <button type="button" key={option.id} disabled={pending}
                  onClick={() => chooseDirection(option.label, option.id === "talk-more")}>{option.label}</button>)}</div></>}
            {poll && <section className="community-poll" aria-label={poll.question}>
              <header><h2>{poll.question}</h2><span>{poll.totalMembers}명 중 {poll.votedCount}명 투표</span></header>
              <div>{poll.candidates.map((candidate) => <button key={candidate.id} type="button"
                disabled={pending || poll.status === "CLOSED"}
                className={candidate.voterUserIds.includes(me?.userId ?? -1) ? "is-selected" : ""}
                aria-pressed={candidate.voterUserIds.includes(me?.userId ?? -1)}
                onClick={() => void run(() => voteChatPoll(tripId, poll.pollId, candidate.id))}>
                <span className="community-poll__check" aria-hidden="true">
                  {candidate.voterUserIds.includes(me?.userId ?? -1) && <img src={selectedCheckIcon} alt="" />}
                </span><span><strong>{candidate.name}</strong><small>{candidate.tagline}</small></span>
                <span className="community-poll__voters">
                  {candidate.voterUserIds.slice(0, 3).map((userId) => {
                    const voter = members.find((member) => member.userId === userId);
                    return voter ? <img key={userId} src={voter.profileImageUrl || avatarFor(voter.characterId)} alt={voter.name} /> : null;
                  })}
                  <b>{candidate.votes}</b>
                </span>
              </button>)}</div>
              <button className="community-poll__apply" type="button" disabled={pending || poll.votedCount === 0}
                onClick={() => setSelectedPoll(poll)}>1위 장소 일정에 넣기</button>
            </section>}
          </div>
        </article>;
      })}
      <div ref={bottom} />
    </section>

    <footer className="community-chat__composer">
      <div className="community-chat__quick-actions">
        <button type="button" disabled title="일정 점검 API가 준비되지 않았어요"><b>@도틀로</b> 일정 점검</button>
        <button type="button" disabled={pending || !messages.some((item) => item.type === "USER")}
          onClick={() => void run(() => coordinateChat(tripId))}><b>@도틀로</b> 의견 조율</button>
        <button type="button" disabled={pending || !messages.some((item) => item.type === "USER")}
          onClick={makePoll}><b>@도틀로</b> 투표 만들기</button>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); const value = message.trim(); if (value) void run(() => send(value)); }}>
        <label><span className="course-community__sr-only">채팅 메시지</span>
          <input ref={composer} value={message} maxLength={500} disabled={pending || !ready}
            placeholder="메시지를 입력하거나 @도틀로를 불러보세요"
            onChange={(event) => setMessage(event.target.value)} /></label>
        <button type="submit" disabled={!message.trim() || pending || !ready} aria-label="메시지 보내기"><img src={sendIcon} alt="" /></button>
      </form>
      <span className="community-chat__home-indicator" aria-hidden="true" />
    </footer>

    {selectedPoll && <div className="community-day-picker" role="dialog" aria-modal="true" aria-labelledby="server-day-picker-title">
      <section><header><h2 id="server-day-picker-title">{[...selectedPoll.candidates].sort((a, b) => b.votes - a.votes)[0]?.name}, 언제 넣을까요?</h2>
        <button type="button" onClick={() => setSelectedPoll(undefined)} aria-label="닫기"><img src={closeIcon} alt="" /></button></header>
        <div>{Array.from({ length: days }, (_, index) => <button type="button" key={index}
          className={selectedDay === index + 1 ? "is-selected" : ""} onClick={() => setSelectedDay(index + 1)}>
          <strong>{index + 1}일차</strong>
        </button>)}</div>
        <button className="community-day-picker__apply" type="button" disabled={pending}
          onClick={() => void run(async () => {
            const winner = [...selectedPoll.candidates].sort((a, b) => b.votes - a.votes)[0];
            if (!winner) return;
            await addPlaceToItinerary(tripId, winner.placeId, selectedDay);
            setSelectedPoll(undefined);
            onViewCourse(selectedDay);
          })}>{selectedDay}일차에 넣기</button>
      </section>
    </div>}
  </main>;
}
