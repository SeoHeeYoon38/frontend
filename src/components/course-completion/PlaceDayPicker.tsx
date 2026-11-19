import { useEffect, useId, useState } from "react";
import { suggestPlaceDay } from "../../api/itineraries";
import type { PlaceDaySuggestion } from "../../api/types";
import { initialSuggestedDay, placeDayError } from "../../utils/placeDaySuggestion";
import { ErrorText, Primary } from "../trip/Trip.styled";
import "./PlaceDayPicker.css";

export default function PlaceDayPicker({ tripId, placeId, pending, onConfirm, inChat = false }: {
  tripId: number;
  placeId: string;
  pending: boolean;
  onConfirm: (day: number, date: string) => Promise<void>;
  inChat?: boolean;
}) {
  const [suggestion, setSuggestion] = useState<PlaceDaySuggestion>();
  const [selectedDay, setSelectedDay] = useState<number>();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const radioName = useId();

  useEffect(() => {
    const controller = new AbortController();
    void suggestPlaceDay(tripId, placeId, controller.signal).then((response) => {
      if (controller.signal.aborted) return;
      setSuggestion(response);
      setSelectedDay(initialSuggestedDay(response));
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(placeDayError(reason));
    });
    return () => controller.abort();
  }, [tripId, placeId, attempt]);

  const selected = suggestion?.days.find((item) => item.day === selectedDay);
  return <section className={`place-day-picker${inChat ? " place-day-picker--chat" : ""}`} aria-busy={(!suggestion && !error) || pending}>
    {!suggestion && !error && <p role="status">장소를 넣기 좋은 날짜를 찾고 있어요.</p>}
    {error && <div><ErrorText role="alert">{error}</ErrorText>
      <button type="button" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 시도</button>
    </div>}
    {suggestion && <>
      <p>{suggestion.recommendedDay === null
        ? "추천할 날짜가 없어요. 원하는 날짜를 직접 선택해 주세요."
        : inChat ? "동선이 가장 자연스러운 날을 추천했어요" : "동선을 참고한 추천 날짜예요. 다른 날짜도 선택할 수 있어요."}</p>
      <fieldset disabled={pending}>
        <legend>장소를 추가할 날짜</legend>
        {suggestion.days.map((item) => <label key={item.day}>
          <input type="radio" name={radioName} value={item.day} checked={selectedDay === item.day}
            onChange={() => setSelectedDay(item.day)} />
          {inChat ? <span><b>{item.day}일차</b><small>{item.date.split("-").slice(1).map(Number).join(".")}</small></span> :
            <span><b>{item.day}일차 · {item.date}</b><small>방문 장소 {item.visitCount}곳</small></span>}
          {item.recommended && <em>추천</em>}
        </label>)}
      </fieldset>
      {suggestion.days.length === 0 && <p>추가할 날짜가 없어요. 여행 일정을 다시 확인해 주세요.</p>}
      <Primary type="button" disabled={pending || !selected} data-pending={pending || undefined}
        onClick={() => { if (selected) void onConfirm(selected.day, selected.date); }}>
        {pending && <span className="place-day-picker__spinner" aria-hidden="true" />}
        {pending ? "AI가 장소를 넣고 있어요" : selectedDay === undefined ? "날짜를 선택해 주세요" : `${selectedDay}일차에 넣기`}
      </Primary>
    </>}
  </section>;
}
