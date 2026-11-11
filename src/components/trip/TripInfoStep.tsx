import { useEffect, useState } from "react";
import type { TripDraft } from "../../types/trip";
import { basicError, dateLabel, durationLabel } from "../../utils/trip";
import { mockTripCities } from "../../data/mocks/tripData";
import RegionSelect from "../common/RegionSelect";
import BasicInfoSheet from "./BasicInfoSheet";
import OptionalInfoSheet from "./OptionalInfoSheet";
import pin from "../../assets/icons/field-location.svg";
import calendar from "../../assets/icons/field-calendar.svg";
import people from "../../assets/icons/field-companion.svg";
import chevron from "../../assets/icons/field-chevron-down.svg";
import airplane from "../../assets/icons/transport-airplane.svg";
import bed from "../../assets/icons/transport-bed.svg";
import car from "../../assets/icons/transport-car.svg";
import plus from "../../assets/icons/action-add.svg";
import * as S from "./Trip.styled";
import * as P from "./TripInfoStep.styled";
import { getCities } from "../../api/trips";
import { isApiEnabled } from "../../api/config";
interface TripInfoStepProps {
  draft: TripDraft;
  onChange: (draft: TripDraft) => void;
  onNext: () => void | Promise<void>;
  submitting?: boolean;
  submitError?: string;
}
function TripInfoStep({
  draft,
  onChange,
  onNext,
  submitting = false,
  submitError = "",
}: TripInfoStepProps) {
  const [sheet, setSheet] = useState<
    "city" | "dates" | "people" | "flight" | "stay" | "car" | null
  >(null);
  const [error, setError] = useState("");
  const [destinations, setDestinations] = useState(mockTripCities);
  useEffect(() => {
    if (!isApiEnabled()) return;
    const controller = new AbortController();
    void getCities(controller.signal)
      .then((cities) => {
        const supported = cities.flatMap((city) => {
          const visual = mockTripCities.find((item) => item.name === city.name);
          return visual
            ? [{
                ...visual,
                country: city.country,
                latitude: city.lat,
                longitude: city.lng,
              }]
            : [];
        });
        if (!controller.signal.aborted && supported.length) {
          setDestinations(supported);
        }
      })
      .catch(() => {
        // 공개 도시 API가 닫혀 있으면 디자인용 도시 목록을 그대로 사용합니다.
      });
    return () => controller.abort();
  }, []);
  const valid = !basicError(draft);
  const datesReady =
    !!draft.startDate && !!draft.endDate && draft.endDate >= draft.startDate;
  function save(updated: TripDraft) {
    onChange(updated);
    setSheet(null);
    setError("");
  }
  function openOptional(mode: "flight" | "stay" | "car") {
    if (!draft.city || !datesReady) {
      setError("도시와 여행 날짜를 먼저 선택해 주세요.");
      return;
    }
    setError("");
    setSheet(mode);
  }
  const options = [
    {
      mode: "flight" as const,
      label: "항공권",
      icon: airplane,
      description: draft.outbound
        ? `${draft.outbound.code} · ${draft.outbound.arrival} 도착${draft.inbound ? ` / ${draft.inbound.code}` : ""}`
        : draft.inbound
          ? `${draft.inbound.code} · ${draft.inbound.departure} 출발`
          : "도착 시간에 맞춰 첫날을 시작해요",
    },
    {
      mode: "stay" as const,
      label: "숙소",
      icon: bed,
      description: draft.stays.length
        ? draft.stays.map((stay) => stay.name).join(" · ")
        : "숙소 기준으로 동선을 짜요",
    },
    {
      mode: "car" as const,
      label: "렌터카",
      icon: car,
      description: draft.rental
        ? `${draft.rental.days.length}일 · ${draft.rental.location}`
        : "이동 범위가 넓어져요",
    },
  ];
  const startMonth = Number(draft.startDate.slice(5, 7));
  const startDay = Number(draft.startDate.slice(8, 10));
  return (
    <>
      <P.InfoStep $complete={valid}>
        <P.IntroTitle $complete={valid}>이번 여행은</P.IntroTitle>
        {valid ? (
          <P.CompletedSentence>
            <div>
              <P.Highlight
                type="button"
                $tone="city"
                onClick={() => setSheet("city")}
              >
                {draft.city}
              </P.Highlight>
              로
            </div>
            <div>
              <P.Highlight
                type="button"
                $tone="dates"
                onClick={() => setSheet("dates")}
              >
                {startMonth}월 {startDay}일부터{" "}
                {durationLabel(draft.startDate, draft.endDate)}
              </P.Highlight>
            </div>
            <div>
              <P.Highlight
                type="button"
                $tone="people"
                onClick={() => setSheet("people")}
              >
                {draft.companion} {draft.people}명
              </P.Highlight>
              {draft.companion === "혼자" ? " 떠날 거예요" : "과 떠날 거예요"}
            </div>
          </P.CompletedSentence>
        ) : (
          <P.Sentence>
            <P.SentenceRow>
              <P.FieldButton
                type="button"
                $filled={!!draft.city}
                onClick={() => setSheet("city")}
                aria-haspopup="dialog"
              >
                <img src={pin} alt="" />
                {draft.city || "어디로"}
                <img src={chevron} alt="" />
              </P.FieldButton>
              로
            </P.SentenceRow>
            <P.SentenceRow>
              <P.FieldButton
                type="button"
                $filled={datesReady}
                onClick={() => setSheet("dates")}
                aria-haspopup="dialog"
              >
                <img src={calendar} alt="" />
                {datesReady
                  ? `${dateLabel(draft.startDate).split(" ")[0]}부터 ${durationLabel(draft.startDate, draft.endDate)}`
                  : "언제부터"}
                <img src={chevron} alt="" />
              </P.FieldButton>
              에
            </P.SentenceRow>
            <P.SentenceRow>
              <P.FieldButton
                type="button"
                $filled={!!draft.companion}
                onClick={() => setSheet("people")}
                aria-haspopup="dialog"
              >
                <img src={people} alt="" />
                {draft.companion
                  ? `${draft.companion} ${draft.people}명`
                  : "누구와"}
                <img src={chevron} alt="" />
              </P.FieldButton>
              {draft.companion === "혼자" ? "떠날 거예요" : "과 떠날 거예요"}
            </P.SentenceRow>
          </P.Sentence>
        )}
        {valid && <S.Help>색이 칠해진 부분을 누르면 바꿀 수 있어요</S.Help>}
        {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
        <P.Optional>
          <h2>
            예약한 정보가 있다면 추가해 주세요 <span>선택</span>
          </h2>
          {options.map((option) => (
            <P.OptionalRow
              key={option.mode}
              type="button"
              onClick={() => openOptional(option.mode)}
              aria-haspopup="dialog"
            >
              <span>
                <img src={option.icon} alt="" />
              </span>
              <div>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </div>
              <img src={plus} alt="" />
            </P.OptionalRow>
          ))}
        </P.Optional>
      </P.InfoStep>
      <S.Footer>
        {submitError && <S.ErrorText role="alert">{submitError}</S.ErrorText>}
        <S.Primary
          type="button"
          disabled={!valid || submitting}
          onClick={() => void onNext()}
        >
          {submitting ? "여행 정보를 저장하고 있어요" : "다음"}
        </S.Primary>
      </S.Footer>
      {sheet === "city" && (
        <RegionSelect
          mode="trip"
          destinations={destinations}
          recentDestinations={[]}
          initialDestination={
            destinations.find((city) => city.name === draft.city) ??
            destinations[0]
          }
          onClose={() => setSheet(null)}
          onSelect={(city) => {
            if (city.name === draft.city) {
              setSheet(null);
              return;
            }
            save({
              ...draft,
              city: city.name,
              country: city.country,
              outbound: null,
              inbound: null,
              stays: [],
              rental: null,
              places: [],
              selectedPlaceIds: [],
              source: "none",
            });
          }}
        />
      )}
      {(sheet === "dates" || sheet === "people") && (
        <BasicInfoSheet
          key={sheet}
          mode={sheet}
          draft={draft}
          onClose={() => setSheet(null)}
          onSave={save}
        />
      )}
      {(sheet === "flight" || sheet === "stay" || sheet === "car") && (
        <OptionalInfoSheet
          key={sheet}
          mode={sheet}
          draft={draft}
          onClose={() => setSheet(null)}
          onSave={save}
        />
      )}
    </>
  );
}
export default TripInfoStep;
