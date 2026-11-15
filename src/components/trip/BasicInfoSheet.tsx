import { useState } from "react";
import type { Companion, TripDraft } from "../../types/trip";
import { changeDates, companions, validDate } from "../../utils/trip";
import solo from "../../assets/images/companion-solo.png";
import friends from "../../assets/images/companion-friends.png";
import couple from "../../assets/images/companion-couple.png";
import family from "../../assets/images/companion-family.png";
import TripSheet from "../common/TripSheet";
import DateRangePicker from "./DateRangePicker";
import * as S from "./Trip.styled";

const companionGuides = {
  혼자: { image: solo, title: "혼자 떠나요" },
  친구: { image: friends, title: "친구와 함께 떠나요" },
  연인: { image: couple, title: "연인과 함께 떠나요" },
  가족: { image: family, title: "가족과 함께 떠나요" },
} satisfies Record<Companion, { image: string; title: string }>;
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
  const datesValid = validDate(start) && validDate(end) && end >= start;
  const guide = companionGuides[companion];
  function save() {
    if (mode === "dates" && datesValid) onSave(changeDates(draft, start, end));
    else if (mode === "people") {
      const people = companion === "혼자" ? 1
        : companion === "연인" ? 2
          : companion === draft.companion ? draft.people : 2;
      onSave({ ...draft, companion, people });
    }
  }
  return (
    <TripSheet
      title={mode === "dates" ? "언제 떠나세요?" : "누구와 떠나세요?"}
      variant={mode}
      contentGap={mode === "people" ? 16 : undefined}
      compactHeader={mode === "dates"}
      minHeight={mode === "people" ? (companion === "혼자" ? 474 : 490) : 0}
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
                aria-pressed={companion === item}
                onClick={() => setCompanion(item)}
              >
                {item}
              </S.Chip>
            ))}
          </S.CompanionChoices>
          <S.PeopleBox>
            <S.CompanionIllustration src={guide.image} alt="" />
            <strong>{guide.title}</strong>
            {companion !== "혼자" && (
              <S.Help>코스를 만든 뒤 함께 갈 사람을 초대할 수 있어요</S.Help>
            )}
          </S.PeopleBox>
        </>
      )}
    </TripSheet>
  );
}
export default BasicInfoSheet;
