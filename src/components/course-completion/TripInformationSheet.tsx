import { useRef, useState } from "react";
import styled from "styled-components";
import { updateTrip } from "../../api/trips";
import type { CompanionCode, TripResponse } from "../../api/types";
import { companionLabels } from "../../utils/serverTrip";
import { formatTripDetailDateRange } from "../../utils/importedTrip";
import minusIcon from "../../assets/icons/counter-minus.svg";
import plusIcon from "../../assets/icons/counter-plus.svg";
import chevronIcon from "../../assets/my/sort-chevron.svg";
import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import TripSheet from "../common/TripSheet";
import SettingsConfirmDialog from "../common/SettingsConfirmDialog";
import * as S from "../trip/Trip.styled";

const companions: CompanionCode[] = ["ALONE", "FRIEND", "COUPLE", "FAMILY"];
const avatars = [avatarYellow, avatarBlue, avatarPurple];

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
  > button[aria-expanded="true"] img { transform: rotate(180deg); }
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

export default function TripInformationSheet({ trip, title, movementLabel = "", mode, onClose, onSaved }: {
  trip: TripResponse;
  title: string;
  movementLabel?: string;
  mode: "register" | "edit";
  onClose: () => void;
  onSaved: (trip: TripResponse) => void;
}) {
  const register = mode === "register";
  const [choice, setChoice] = useState<{ companion?: CompanionCode; count: number }>(() => register
    ? { count: 2 } : { companion: trip.companion, count: trip.companionCount });
  const [peopleDraft, setPeopleDraft] = useState<typeof choice>();
  const [expanded, setExpanded] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const dirty = Boolean(choice.companion) && (register || choice.companion !== trip.companion || choice.count !== trip.companionCount);

  async function save() {
    if (!choice.companion || !dirty || saving.current) return;
    saving.current = true;
    setPending(true);
    setError("");
    try {
      onSaved(await updateTrip(trip.id, { companion: choice.companion, companionCount: choice.count }));
    } catch (reason) {
      setConfirmClose(false);
      setError(reason instanceof Error ? reason.message : "여행 정보를 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  if (peopleDraft) return (
    <TripSheet key="people" title="누구와 떠나세요?" variant="people" minHeight={490} contentGap={16}
      onClose={() => setPeopleDraft(undefined)} footer={
        <S.Primary type="button" disabled={!peopleDraft.companion} onClick={() => { setChoice(peopleDraft); setPeopleDraft(undefined); }}>선택 완료</S.Primary>
      }>
      <PeopleChoices {...peopleDraft} onChange={(companion, count) => setPeopleDraft({ companion, count })} />
    </TripSheet>
  );

  return <>
    <TripSheet key="info" title={register ? "여행 정보 등록" : "여행 정보 수정"} variant="trip-info" closeDisabled={pending}
      onClose={() => { if (dirty) setConfirmClose(true); else onClose(); }} footer={
        <S.Primary type="button" disabled={!dirty || pending} onClick={() => void save()}>
          {pending ? "저장하고 있어요" : "저장"}
        </S.Primary>
      }>
      <Details>
        <Row><dt>여행 이름</dt><dd>{title}</dd></Row>
        <Row><dt>여행지</dt><dd>{trip.city}</dd></Row>
        <Row><dt>날짜</dt><dd>{formatTripDetailDateRange(trip.startDate, trip.endDate)}</dd></Row>
        <div>
          <Row>
            <dt>인원</dt>
            <dd data-empty={!choice.companion || undefined}>{choice.companion
              ? choice.companion === "ALONE" ? "혼자" : `${companionLabels[choice.companion]} ${choice.count}명`
              : "함께 가는 사람을 알려주세요"}</dd>
            <button type="button" aria-label={register ? "동행 등록" : "동행 수정"} aria-expanded={!register ? expanded : undefined}
              disabled={pending} onClick={() => {
                if (register) setPeopleDraft(choice);
                else setExpanded(!expanded);
              }}>
              {register ? choice.companion ? "수정" : "등록" : <img src={chevronIcon} alt="" />}
            </button>
          </Row>
          {expanded && <InlinePeople>
            <PeopleChoices {...choice} inline onChange={(companion, count) => { if (!pending) setChoice({ companion, count }); }} />
          </InlinePeople>}
        </div>
        {movementLabel && <Row><dt>이동 수단</dt><dd>{movementLabel}</dd></Row>}
      </Details>
      {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
    </TripSheet>
    {confirmClose && <SettingsConfirmDialog title="저장하지 않고 닫을까요?" description="바꾼 여행 정보가 저장되지 않아요"
      cancelLabel="닫기" confirmLabel="저장하기" pending={pending} onCancel={onClose}
      onDismiss={() => setConfirmClose(false)} onConfirm={() => void save()} />}
  </>;
}
