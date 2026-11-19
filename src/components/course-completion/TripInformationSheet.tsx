import { useRef, useState } from "react";
import styled from "styled-components";
import { updateTrip, updateTripDates } from "../../api/trips";
import type { CompanionCode, TripResponse } from "../../api/types";
import { apiTripToDraft, companionLabels } from "../../utils/serverTrip";
import { formatTripDetailDateRange } from "../../utils/importedTrip";
import { courseImportEndDate } from "../../utils/courseImport";
import { dayCount, durationLabel, validDate } from "../../utils/trip";
import minusIcon from "../../assets/icons/counter-minus.svg";
import plusIcon from "../../assets/icons/counter-plus.svg";
import chevronIcon from "../../assets/my/sort-chevron.svg";
import lockIcon from "../../assets/place-import/link-lock.svg";
import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import TripSheet from "../common/TripSheet";
import SettingsConfirmDialog from "../common/SettingsConfirmDialog";
import DateRangePicker from "../trip/DateRangePicker";
import * as S from "../trip/Trip.styled";

const companions: CompanionCode[] = ["ALONE", "FRIEND", "COUPLE", "FAMILY"];
const avatars = [avatarYellow, avatarBlue, avatarPurple];
const movementChoices = ["도보와 버스", "대중교통", "택시", "렌터카"];
type EditField = "name" | "destination" | "dates" | "people" | "movement";

const Details = styled.dl`
  margin: 0;

  > div { border-bottom: 1px solid #e4e6ec; }
  dt { color: #8a8a8e; font-size: 14px; }
  dd { margin: 0; min-width: 0; font-size: 15px; overflow-wrap: anywhere; }
`;

const Row = styled.div`
  min-height: 55px;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;

  > button {
    min-height: 36px;
    color: #090738;
    font-size: 13px;
    font-weight: 700;
    text-align: right;
  }

  > button img { width: 16px; height: 16px; }
  > button[aria-expanded="true"] img[data-chevron] { transform: rotate(180deg); }
  dd[data-empty] { color: #8a8a8e; }
`;

const InlinePeople = styled.div`
  display: grid;
  gap: 10px;
  padding: 0 0 14px;

  > div:first-child button { padding-block: 9px; }
  > div:last-child {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 12px;
    padding: 10px 14px;
    background: #f2f3f8;
  }
  > div:last-child > span { color: #5c5c63; font-size: 14px; }
  ${S.Counter} { gap: 14px; }
  ${S.Counter} button { height: 32px; width: 32px; }
  ${S.Counter} button img { height: 14px; width: 14px; }
  ${S.Counter} strong, ${S.Counter} small { font-size: 16px; line-height: 22px; }
`;

const DestinationNotice = styled.aside`
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f4f5f9;
  font-size: 13px;
  line-height: 1.5;

  img { width: 16px; height: 16px; }
  strong { display: block; font-weight: 600; }
  p { margin: 2px 0 0; color: #8a8a8e; }
`;

const NameEditor = styled.div`
  display: flex;
  align-items: center;
  min-height: 50px;
  gap: 8px;
  border: 1.5px solid #090738;
  border-radius: 10px;
  padding: 0 12px;
  margin: 0 0 16px;
  input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #1a1a1a; font: inherit; }
  &:focus-within { outline: 2px solid #090738; outline-offset: -2px; }
  input:focus-visible { outline: 0; }
  span { color: #8a8a8e; font-size: 12px; }
  button { width: 20px; height: 20px; color: #8a8a8e; }
`;

const MovementChoices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 16px;
  button { min-height: 36px; padding: 0 14px; border-radius: 20px; background: #f3f4f8; color: #5c5c63; font-size: 14px; }
  button[aria-pressed="true"] { background: #090738; color: white; }
`;

const InlineDates = styled.div`
  display: grid;
  gap: 12px;
  padding: 0 0 12px;
`;

function PeopleChoices({ companion, count, inline, onChange }: {
  companion?: CompanionCode;
  count: number;
  inline?: boolean;
  onChange: (companion: CompanionCode, count: number) => void;
}) {
  const minimum = companion === "ALONE" ? 1 : 2;
  const fixed = companion === "ALONE" || companion === "COUPLE";
  const counter = (
    <S.Counter $fixed={false}>
      <button type="button" aria-label="인원 줄이기" disabled={!companion || fixed || count <= minimum}
        onClick={() => { if (companion) onChange(companion, count - 1); }}><img src={minusIcon} alt="" /></button>
      <strong>{count}<small>명</small></strong>
      <button type="button" aria-label="인원 늘리기" disabled={!companion || fixed || count >= 10}
        onClick={() => { if (companion) onChange(companion, count + 1); }}><img src={plusIcon} alt="" /></button>
    </S.Counter>
  );
  return <>
    <S.CompanionChoices>
      {companions.map((value) => <S.Chip key={value} type="button" $active={companion === value} aria-pressed={companion === value}
        onClick={() => onChange(value, value === "ALONE" ? 1 : value === "COUPLE" ? 2 : Math.max(2, count))}>
        {companionLabels[value]}
      </S.Chip>)}
    </S.CompanionChoices>
    {inline ? <div><span>나를 포함해서</span>{counter}</div> :
      <S.PeopleBox>
        <p>나를 포함해서</p>
        <S.Avatars aria-hidden="true">
          {(count === 1 ? [avatarBlue] : avatars.slice(0, count)).map((avatar) => <span key={avatar}><img src={avatar} alt="" /></span>)}
          {count > avatars.length && <S.ExtraPeople>+{count - avatars.length}</S.ExtraPeople>}
        </S.Avatars>
        {counter}
        <p>{companion === "ALONE" ? "혼자 떠나는 여행이에요" : "2명부터 10명까지 선택할 수 있어요"}</p>
      </S.PeopleBox>}
  </>;
}

export default function TripInformationSheet({ trip, title, movementLabel = "", mode, imported = false, inlineEditors = false, canChangeDates = false, onClose, onSaved }: {
  trip: TripResponse;
  title: string;
  movementLabel?: string;
  mode: "register" | "edit";
  imported?: boolean;
  inlineEditors?: boolean;
  canChangeDates?: boolean;
  onClose: () => void;
  onSaved: (trip: TripResponse, registered: boolean) => void;
}) {
  const register = mode === "register";
  const [choice, setChoice] = useState<{ companion?: CompanionCode; count: number }>(() => register
    ? { count: 2 } : { companion: trip.companion, count: trip.companionCount });
  const [peopleDraft, setPeopleDraft] = useState<typeof choice>();
  const [expanded, setExpanded] = useState<EditField>();
  const [name, setName] = useState(title);
  const [movement, setMovement] = useState(movementLabel);
  const [start, setStart] = useState(trip.startDate);
  const [calendarStart, setCalendarStart] = useState<string>();
  const duration = dayCount(trip.startDate, trip.endDate);
  const end = courseImportEndDate(start, duration);
  const [confirmClose, setConfirmClose] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const peopleChanged = Boolean(choice.companion) && (register || choice.companion !== trip.companion || choice.count !== trip.companionCount);
  const datesChanged = start !== trip.startDate;
  const dirty = peopleChanged || datesChanged || name !== title || movement !== movementLabel;

  function toggle(field: EditField) {
    setError("");
    setExpanded(expanded === field ? undefined : field);
  }
  function editButton(field: EditField, label: string, open: () => void = () => toggle(field)) {
    return <button type="button" aria-label={label} aria-expanded={expanded === field} disabled={pending} onClick={open}>
      {inlineEditors ? <img data-chevron src={chevronIcon} alt="" /> : "수정"}
    </button>;
  }

  async function save() {
    if (!dirty || saving.current) return;
    const unsupported = [name !== title && "여행 이름", movement !== movementLabel && "기본 이동 수단", datesChanged && !canChangeDates && "저장된 일정의 날짜"].filter(Boolean);
    if (unsupported.length) {
      setConfirmClose(false);
      setError(`${unsupported.join(" · ")} 변경은 아직 저장할 수 없어요. 원래 값으로 되돌린 뒤 다른 변경을 저장해 주세요.`);
      return;
    }
    saving.current = true;
    setPending(true);
    setError("");
    try {
      const people = peopleChanged && choice.companion ? { companion: choice.companion, companionCount: choice.count } : {};
      const updated = datesChanged
        ? await updateTripDates(trip.id, { ...people, startDate: start, endDate: end })
        : await updateTrip(trip.id, people);
      onSaved(updated, !register || Boolean(choice.companion));
    } catch (reason) {
      setConfirmClose(false);
      setError(reason instanceof Error ? reason.message : "여행 정보를 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  if (calendarStart !== undefined) return (
    <TripSheet key="dates" title="언제 떠나세요?" variant="dates" onClose={() => setCalendarStart(undefined)} footer={
      <S.Primary type="button" disabled={!validDate(calendarStart)} onClick={() => { setStart(calendarStart); setCalendarStart(undefined); }}>선택 완료</S.Primary>
    }>
      <S.CalendarHelp>코스 기간({durationLabel(trip.startDate, trip.endDate)})에 맞춰 날짜를 골라주세요</S.CalendarHelp>
      <DateRangePicker start={calendarStart} end={courseImportEndDate(calendarStart, duration)} onChange={(value) => setCalendarStart(value)} />
    </TripSheet>
  );

  if (peopleDraft) return (
    <TripSheet key="people" title="누구와 떠나세요?" variant="people" minHeight={490} contentGap={16}
      onClose={() => setPeopleDraft(undefined)} footer={
        <S.Primary type="button" disabled={!peopleDraft.companion} onClick={() => { setChoice(peopleDraft); setPeopleDraft(undefined); }}>선택 완료</S.Primary>
      }>
      <PeopleChoices {...peopleDraft} onChange={(companion, count) => setPeopleDraft({ companion, count })} />
    </TripSheet>
  );

  return <>
    <TripSheet key="info" title="여행 정보 수정" variant="trip-info" closeDisabled={pending}
      onClose={() => { if (dirty) setConfirmClose(true); else onClose(); }} footer={
        <S.Primary type="button" disabled={!dirty || pending} onClick={() => void save()}>
          {pending ? "저장하고 있어요" : "저장"}
        </S.Primary>
      }>
      <Details>
        <div>
          <Row><dt>여행 이름</dt><dd>{expanded === "name" ? "" : name}</dd>{editButton("name", "여행 이름 수정")}</Row>
          {expanded === "name" && <NameEditor>
            <input aria-label="여행 이름" maxLength={20} value={name} onChange={(event) => { setName(event.target.value); setError(""); }} />
            <span>{name.length}/20</span><button type="button" aria-label="여행 이름 지우기" onClick={() => setName("")}>×</button>
          </NameEditor>}
        </div>
        <div>
          <Row><dt>여행지</dt><dd>{[trip.city, apiTripToDraft(trip).country].filter(Boolean).join(", ")}</dd>
            {imported && <button type="button" aria-label="여행지 안내" aria-expanded={expanded === "destination"}
              onClick={() => setExpanded(expanded === "destination" ? undefined : "destination")}>
              <img src={lockIcon} alt="" />
            </button>}
          </Row>
          {expanded === "destination" && <DestinationNotice>
            <img src={lockIcon} alt="" />
            <div><strong>가져온 코스는 여행지를 바꿀 수 없어요</strong>
              <p>코스의 장소가 {trip.city}에 맞춰져 있어요. 다른 곳으로 가려면 새 여행을 만들어 주세요.</p></div>
          </DestinationNotice>}
        </div>
        <div>
          <Row><dt>날짜</dt><dd>{formatTripDetailDateRange(start, end || trip.endDate)}</dd>
            {editButton("dates", "날짜 수정", () => { if (inlineEditors) toggle("dates"); else { setError(""); setCalendarStart(start); } })}
          </Row>
          {expanded === "dates" && <InlineDates><DateRangePicker start={start} end={end} onChange={(value) => { setStart(value); setError(""); }} /></InlineDates>}
        </div>
        <div>
          <Row>
            <dt>인원</dt>
            <dd data-empty={!choice.companion || undefined}>{choice.companion
              ? choice.companion === "ALONE" ? "혼자" : `${companionLabels[choice.companion]} ${choice.count}명`
              : "함께 가는 사람을 알려주세요"}</dd>
            <button type="button" aria-label={!choice.companion ? "동행 등록" : "동행 수정"} aria-expanded={inlineEditors ? expanded === "people" : undefined}
              disabled={pending} onClick={() => {
                if (inlineEditors) setExpanded(expanded === "people" ? undefined : "people");
                else setPeopleDraft(choice);
              }}>
              {inlineEditors ? <img data-chevron src={chevronIcon} alt="" /> : choice.companion ? "수정" : "등록"}
            </button>
          </Row>
          {expanded === "people" && <InlinePeople>
            <PeopleChoices {...choice} inline onChange={(companion, count) => { if (!pending) setChoice({ companion, count }); }} />
          </InlinePeople>}
        </div>
        {movementLabel && <div>
          <Row><dt>이동 수단</dt><dd>{movement}</dd>{editButton("movement", "이동 수단 수정")}</Row>
          {expanded === "movement" && <MovementChoices>{movementChoices.map((option) =>
            <button key={option} type="button" aria-pressed={movement === option} onClick={() => { setMovement(option); setError(""); }}>{option}</button>)}</MovementChoices>}
        </div>}
      </Details>
      {error && <S.ErrorText role="alert">{error}
        {(name !== title || movement !== movementLabel || (datesChanged && !canChangeDates)) && <button type="button" onClick={() => {
          setName(title); setMovement(movementLabel); if (!canChangeDates) setStart(trip.startDate); setError("");
        }}>원래 값으로 되돌리기</button>}
      </S.ErrorText>}
    </TripSheet>
    {confirmClose && <SettingsConfirmDialog title="저장하지 않고 닫을까요?" description="바꾼 여행 정보가 저장되지 않아요"
      cancelLabel="닫기" confirmLabel="저장하기" pending={pending} onCancel={onClose}
      onDismiss={() => setConfirmClose(false)} onConfirm={() => void save()} />}
  </>;
}
