import { useRef, useState } from "react";
import { updateTrip } from "../../api/trips";
import type { CompanionCode, TripResponse } from "../../api/types";
import { companionLabels } from "../../utils/serverTrip";
import { formatTripDateRange } from "../../utils/importedTrip";
import { durationLabel } from "../../utils/trip";
import closeIcon from "../../assets/icons/action-close.svg";
import minusIcon from "../../assets/icons/counter-minus.svg";
import plusIcon from "../../assets/icons/counter-plus.svg";
import * as S from "../../pages/ImportedTripPage.styled";

const companions: CompanionCode[] = ["ALONE", "FRIEND", "COUPLE", "FAMILY"];

export default function ImportedTripRegistration({ trip, onClose, onSaved }: {
  trip: TripResponse;
  onClose: () => void;
  onSaved: (trip: TripResponse) => void;
}) {
  const [step, setStep] = useState<"info" | "people">("info");
  const [companion, setCompanion] = useState<CompanionCode>();
  const [count, setCount] = useState(2);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const saving = useRef(false);

  const save = async () => {
    if (!companion || saving.current) return;
    saving.current = true;
    setPending(true);
    setError("");
    try {
      const updated = await updateTrip(trip.id, {
        companion,
        companionCount: companion === "ALONE" ? 1 : count,
      });
      onSaved(updated);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "여행 정보를 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      saving.current = false;
      setPending(false);
    }
  };

  return <S.Overlay role="presentation" onMouseDown={onClose}>
    <S.Sheet role="dialog" aria-modal="true" aria-label="여행 정보 등록" onMouseDown={(event) => event.stopPropagation()}>
      <S.Handle />
      {step === "info" ? <>
        <S.SheetHeader>
          <h2>여행 정보 등록</h2>
          <button type="button" aria-label="닫기" onClick={onClose}><img src={closeIcon} alt="" /></button>
        </S.SheetHeader>
        <S.InfoList>
          <S.InfoRow><span>여행 이름</span><div><strong>{trip.city} {durationLabel(trip.startDate, trip.endDate)}</strong></div></S.InfoRow>
          <S.InfoRow><span>여행지</span><div><strong>{trip.city}</strong></div></S.InfoRow>
          <S.InfoRow><span>날짜</span><div><strong>{formatTripDateRange(trip.startDate, trip.endDate)}</strong></div></S.InfoRow>
          <S.InfoRow>
            <span>인원</span>
            <div>
              <strong>{companion ? `${companionLabels[companion]} ${companion === "ALONE" ? 1 : count}명` : "함께 가는 사람을 알려주세요"}</strong>
              <button type="button" onClick={() => setStep("people")}>{companion ? "변경" : "등록"}</button>
            </div>
          </S.InfoRow>
        </S.InfoList>
        {error && <p role="alert">{error}</p>}
        <S.PrimaryButton type="button" disabled={!companion || pending} onClick={() => void save()}>
          {pending ? "저장하고 있어요" : "저장"}
        </S.PrimaryButton>
      </> : <>
        <S.SheetHeader>
          <h2>누구와 떠나세요?</h2>
          <button type="button" aria-label="닫기" onClick={() => setStep("info")}><img src={closeIcon} alt="" /></button>
        </S.SheetHeader>
        <S.CompanionChoices>
          {companions.map((value) => <button key={value} type="button" aria-pressed={companion === value}
            onClick={() => { setCompanion(value); setCount(value === "ALONE" ? 1 : Math.max(2, count)); }}>
            {companionLabels[value]}
          </button>)}
        </S.CompanionChoices>
        <S.PeopleCounter>
          <button type="button" aria-label="인원 줄이기" disabled={!companion || count <= (companion === "ALONE" ? 1 : 2)}
            onClick={() => setCount((current) => Math.max(2, current - 1))}><img src={minusIcon} alt="" /></button>
          <strong>{companion === "ALONE" ? 1 : count}<small>명</small></strong>
          <button type="button" aria-label="인원 늘리기" disabled={!companion || companion === "ALONE" || count >= 10}
            onClick={() => setCount((current) => Math.min(10, current + 1))}><img src={plusIcon} alt="" /></button>
          <p>{companion === "ALONE" ? "혼자 떠나는 여행이에요" : "2명부터 10명까지 선택할 수 있어요"}</p>
        </S.PeopleCounter>
        <S.PrimaryButton type="button" disabled={!companion} onClick={() => setStep("info")}>선택 완료</S.PrimaryButton>
      </>}
    </S.Sheet>
  </S.Overlay>;
}
