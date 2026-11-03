import { useState } from "react";
import type { Companion, TripDraft } from "../../types/trip";
import { changeDates, companions, validDate } from "../../utils/trip";
import yellow from "../../assets/images/character-yellow.webp";
import blue from "../../assets/images/character-blue.webp";
import purple from "../../assets/images/character-purple.webp";
import minus from "../../assets/icons/counter-minus.svg";
import plus from "../../assets/icons/counter-plus.svg";
import TripSheet from "../common/TripSheet";
import DateRangePicker from "./DateRangePicker";
import * as S from "./Trip.styled";
interface BasicInfoSheetProps {
  mode: "dates" | "people";
  draft: TripDraft;
  onClose: () => void;
  onSave: (draft: TripDraft) => void;
}
function BasicInfoSheet({ mode, draft, onClose, onSave }: BasicInfoSheetProps) {
  const [start, setStart] = useState(draft.startDate);
  const [end, setEnd] = useState(draft.endDate);
  const [companion, setCompanion] = useState<Companion>(
    draft.companion ?? "친구",
  );
  const [people, setPeople] = useState(draft.companion ? draft.people : 2);
  function chooseCompanion(value: Companion) {
    setCompanion(value);
    setPeople(
      value === "혼자" ? 1 : value === "연인" ? 2 : Math.max(2, people),
    );
  }
  const datesValid = validDate(start) && validDate(end) && end >= start;
  const fixedPeople = companion === "혼자" || companion === "연인";
  const min = companion === "혼자" ? 1 : 2;
  function save() {
    if (mode === "dates" && datesValid) onSave(changeDates(draft, start, end));
    else if (mode === "people") onSave({ ...draft, companion, people });
  }
  return (
    <TripSheet
      title={mode === "dates" ? "언제 떠나세요?" : "누구와 떠나세요?"}
      variant={mode}
      contentGap={mode === "people" ? 16 : undefined}
      compactHeader={mode === "dates"}
      minHeight={mode === "people" ? (fixedPeople ? 444 : 490) : 0}
      onClose={onClose}
      footer={
        <S.Primary
          type="button"
          disabled={mode === "dates" && !datesValid}
          onClick={save}
        >
          선택 완료
        </S.Primary>
      }
    >
      {mode === "dates" ? (
        <>
          <S.CalendarHelp>
            여행 기간에 맞춰 날짜별 일정을 짜드려요
          </S.CalendarHelp>
          <DateRangePicker
            start={start}
            end={end}
            onChange={(a, b) => {
              setStart(a);
              setEnd(b);
            }}
          />
        </>
      ) : (
        <>
          <S.CompanionChoices>
            {companions.map((item) => (
              <S.Chip
                key={item}
                type="button"
                $active={companion === item}
                onClick={() => chooseCompanion(item)}
              >
                {item}
              </S.Chip>
            ))}
          </S.CompanionChoices>
          <S.PeopleBox $fixed={fixedPeople}>
            <p>
              {companion === "혼자"
                ? "혼자 떠나요"
                : companion === "연인"
                  ? "둘이 떠나요"
                  : "나를 포함해서"}
            </p>
            <S.Avatars>
              {(companion === "혼자"
                ? [yellow]
                : companion === "연인"
                  ? [yellow, blue]
                  : [yellow, blue, purple].slice(0, people)
              ).map((image, i) => (
                <span key={i}>
                  <img src={image} alt="" />
                </span>
              ))}
              {people > 3 && (
                <S.ExtraPeople aria-label={`추가 ${people - 3}명`}>
                  +{people - 3}
                </S.ExtraPeople>
              )}
            </S.Avatars>
            <S.Counter $fixed={fixedPeople}>
              {!fixedPeople && (
                <button
                  type="button"
                  aria-label="인원 줄이기"
                  disabled={people <= min}
                  onClick={() => setPeople((n) => Math.max(min, n - 1))}
                >
                  <img src={minus} alt="" />
                </button>
              )}
              <strong>
                {people}
                <small>명</small>
              </strong>
              {!fixedPeople && (
                <button
                  type="button"
                  aria-label="인원 늘리기"
                  disabled={people >= 10}
                  onClick={() => setPeople((n) => Math.min(10, n + 1))}
                >
                  <img src={plus} alt="" />
                </button>
              )}
            </S.Counter>
            {companion !== "혼자" && companion !== "연인" && people < 10 && (
              <S.Help>2명부터 10명까지 선택할 수 있어요</S.Help>
            )}
            {people === 10 && (
              <S.PeopleLimit>최대 10명까지 함께할 수 있어요</S.PeopleLimit>
            )}
          </S.PeopleBox>
        </>
      )}
    </TripSheet>
  );
}
export default BasicInfoSheet;
