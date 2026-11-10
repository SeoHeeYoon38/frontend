import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import backIcon from "../assets/course-completion/back.svg";
import calendarIcon from "../assets/course-completion/icon-calendar.svg";
import pinIcon from "../assets/course-completion/icon-pin.svg";
import settingsIcon from "../assets/course-completion/settings.svg";
import trainIcon from "../assets/course-completion/icon-train.svg";
import minusIcon from "../assets/icons/counter-minus.svg";
import plusIcon from "../assets/icons/counter-plus.svg";
import AppStatusBar from "../components/common/AppStatusBar";
import DateRangePicker from "../components/trip/DateRangePicker";
import { routes } from "../config/routes";
import { travelerCourse } from "../data/mocks/travelerCourseData";
import {
  addDays,
  courseDateLabels,
  importedTripRegistrationKey,
  parseImportedTripRegistration,
  type CompanionType,
  type ImportedTripRegistration,
} from "../utils/importedTrip";
import * as S from "./ImportedTripPage.styled";

type Sheet = "info" | "date" | "people" | null;

const companionTypes: CompanionType[] = ["혼자", "친구", "연인", "가족"];

function readRegistration(): ImportedTripRegistration | null {
  try {
    return parseImportedTripRegistration(
      localStorage.getItem(importedTripRegistrationKey(travelerCourse.id)),
    );
  } catch {
    return null;
  }
}

function ImportedTripPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId } = useParams();
  const [activeDay, setActiveDay] = useState(0);
  const [registration, setRegistration] = useState(readRegistration);
  const [draft, setDraft] = useState<Partial<ImportedTripRegistration>>(
    registration ?? { peopleCount: 2 },
  );
  const [sheet, setSheet] = useState<Sheet>(null);
  const [notice, setNotice] = useState(() =>
    new URLSearchParams(location.search).get("toast") === "course-imported"
      ? "교토 2박 3일 일정을 가져왔어요"
      : "",
  );

  const dates = useMemo(
    () => courseDateLabels(registration?.startDate ?? "", travelerCourse.days.length),
    [registration],
  );
  const activeCourse = travelerCourse.days[activeDay];

  const openInfo = () => {
    setDraft(registration ?? { peopleCount: 2 });
    setSheet("info");
  };

  const saveRegistration = () => {
    if (
      !draft.startDate ||
      !draft.endDate ||
      !draft.companionType ||
      !draft.peopleCount
    ) {
      setNotice("날짜와 동행 정보를 모두 등록해 주세요");
      return;
    }

    const next = draft as ImportedTripRegistration;
    setRegistration(next);
    setSheet(null);
    setNotice("여행 정보를 저장했어요");
    try {
      localStorage.setItem(
        importedTripRegistrationKey(travelerCourse.id),
        JSON.stringify(next),
      );
    } catch {
      // 저장소를 사용할 수 없어도 현재 화면의 목업 상태는 유지합니다.
    }
  };

  return (
    <S.PageShell>
      <S.Page>
        <S.Hero>
          <img src={travelerCourse.hero} alt="교토의 전통 골목" />
          <S.HeroScrim />
          <AppStatusBar overlay tone="light" />
          <S.Navigation>
            <button type="button" aria-label="마이트립으로 돌아가기" onClick={() => navigate(routes.myTrips)}>
              <img src={backIcon} alt="" />
            </button>
            <strong>내 여행</strong>
            <button type="button" aria-label="여행 설정" onClick={openInfo}>
              <img src={settingsIcon} alt="" />
            </button>
          </S.Navigation>
          <S.HeroTitle>
            <span>{travelerCourse.city}</span>
            <h1>교토 2박 3일</h1>
            {registration && (
              <p>
                {dates[0]} - {dates[dates.length - 1]} · {registration.companionType} {registration.peopleCount}명
              </p>
            )}
          </S.HeroTitle>
        </S.Hero>

        <S.Content>
          {!registration && (
            <S.RegisterBanner>
              <span><img src={calendarIcon} alt="" /></span>
              <strong>여행 날짜와 동행을 알려주세요</strong>
              <button type="button" onClick={openInfo}>등록하기</button>
            </S.RegisterBanner>
          )}

          <S.Section>
            <h2>일정</h2>
            <S.Facts>
              <div><img src={calendarIcon} alt="" /><strong>{travelerCourse.duration}</strong><span>여행 기간</span></div>
              <div><img src={pinIcon} alt="" /><strong>{travelerCourse.placeCount}곳</strong><span>장소</span></div>
              <div><img src={trainIcon} alt="" /><strong>{travelerCourse.transport}</strong><span>이동 방법</span></div>
            </S.Facts>

            <S.DayTabs role="tablist" aria-label="교토 여행 일차">
              {travelerCourse.days.map((day, index) => (
                <button
                  key={day.label}
                  type="button"
                  role="tab"
                  aria-selected={activeDay === index}
                  onClick={() => setActiveDay(index)}
                >
                  <strong>{day.label}</strong>
                  {dates[index] && <span>{dates[index]}</span>}
                </button>
              ))}
            </S.DayTabs>

            <S.RouteMap>
              <img src={travelerCourse.mapFull} alt={`${activeCourse.label} 교토 이동 경로 지도`} />
              {activeCourse.places.map((place, index) => (
                <i key={place.id} style={{ left: `${25 + index * 27}%`, top: `${20 + index * 27}%` }}>{index + 1}</i>
              ))}
            </S.RouteMap>
          </S.Section>

          <S.Section>
            <S.DayHeading>
              <h2>{activeCourse.label} 교토 산책 코스</h2>
              <span>{activeCourse.places.length}곳</span>
            </S.DayHeading>
            <S.PlaceList>
              {activeCourse.places.map((place, index) => (
                <S.PlaceRow key={place.id}>
                  <S.Rail><b>{index + 1}</b>{index < activeCourse.places.length - 1 && <i />}</S.Rail>
                  <div>
                    <S.PlaceCard>
                      <img src={place.image} alt="" />
                      <span><strong>{place.name}</strong><small>{place.category}</small></span>
                    </S.PlaceCard>
                    {place.travelTime && <S.TravelTime>{place.travelTime}<span>{place.distance}</span></S.TravelTime>}
                  </div>
                </S.PlaceRow>
              ))}
            </S.PlaceList>
          </S.Section>
        </S.Content>

        <S.BottomAction>
          <button type="button" onClick={() => navigate(`/trips/community?from=my-trips&course=${tripId ?? "kyoto"}`)}>
            AI 수정 요청
          </button>
        </S.BottomAction>

        {notice && <S.Toast role="status"><b>✓</b>{notice}</S.Toast>}

        {sheet && (
          <S.Overlay role="presentation" onMouseDown={() => setSheet(null)}>
            <S.Sheet role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
              <S.Handle />
              {sheet === "info" && (
                <>
                  <S.SheetHeader><h2>여행 정보 수정</h2><button type="button" aria-label="닫기" onClick={() => setSheet(null)}>×</button></S.SheetHeader>
                  <S.InfoList>
                    <S.InfoRow><span>여행 이름</span><div><strong>교토 2박 3일</strong><button type="button">수정</button></div></S.InfoRow>
                    <S.InfoRow><span>여행지</span><div><strong>교토, 일본</strong><button type="button">수정</button></div></S.InfoRow>
                    <S.InfoRow>
                      <span>날짜</span>
                      <div><strong>{draft.startDate ? `${datesForDraft(draft.startDate)[0]} - ${datesForDraft(draft.startDate)[2]}` : "날짜를 정해주세요"}</strong><button type="button" onClick={() => setSheet("date")}>등록</button></div>
                    </S.InfoRow>
                    <S.InfoRow>
                      <span>인원</span>
                      <div><strong>{draft.companionType ? `${draft.companionType} ${draft.peopleCount}명` : "함께 가는 사람을 알려주세요"}</strong><button type="button" onClick={() => setSheet("people")}>등록</button></div>
                    </S.InfoRow>
                    <S.InfoRow><span>이동 수단</span><div><strong>도보와 버스</strong><button type="button">수정</button></div></S.InfoRow>
                  </S.InfoList>
                  <S.PrimaryButton type="button" onClick={saveRegistration}>저장</S.PrimaryButton>
                </>
              )}

              {sheet === "date" && (
                <>
                  <S.SheetHeader><div><h2>언제 떠나세요?</h2><p>코스 기간(2박 3일)에 맞춰 날짜를 골라주세요</p></div><button type="button" aria-label="닫기" onClick={() => setSheet("info")}>×</button></S.SheetHeader>
                  <DateRangePicker
                    start={draft.startDate ?? ""}
                    end={draft.endDate ?? ""}
                    initialMonth="2026-05-01"
                    onChange={(startDate) => setDraft((current) => ({ ...current, startDate, endDate: addDays(startDate, 2) }))}
                  />
                  <S.PrimaryButton type="button" disabled={!draft.startDate} onClick={() => setSheet("info")}>선택 완료</S.PrimaryButton>
                </>
              )}

              {sheet === "people" && (
                <>
                  <S.SheetHeader><h2>누구와 떠나세요?</h2><button type="button" aria-label="닫기" onClick={() => setSheet("info")}>×</button></S.SheetHeader>
                  <S.CompanionChoices>
                    {companionTypes.map((type) => <button key={type} type="button" aria-pressed={draft.companionType === type} onClick={() => setDraft((current) => ({ ...current, companionType: type, peopleCount: type === "혼자" ? 1 : Math.max(2, current.peopleCount ?? 2) }))}>{type}</button>)}
                  </S.CompanionChoices>
                  <S.PeopleCounter>
                    <button type="button" aria-label="인원 줄이기" disabled={(draft.peopleCount ?? 2) <= (draft.companionType === "혼자" ? 1 : 2)} onClick={() => setDraft((current) => ({ ...current, peopleCount: Math.max(current.companionType === "혼자" ? 1 : 2, (current.peopleCount ?? 2) - 1) }))}><img src={minusIcon} alt="" /></button>
                    <strong>{draft.peopleCount ?? 2}<small>명</small></strong>
                    <button type="button" aria-label="인원 늘리기" disabled={(draft.peopleCount ?? 2) >= 10 || draft.companionType === "혼자"} onClick={() => setDraft((current) => ({ ...current, peopleCount: Math.min(10, (current.peopleCount ?? 2) + 1) }))}><img src={plusIcon} alt="" /></button>
                    <p>{draft.companionType === "혼자" ? "혼자 떠나는 여행이에요" : "2명부터 10명까지 선택할 수 있어요"}</p>
                  </S.PeopleCounter>
                  <S.PrimaryButton type="button" disabled={!draft.companionType} onClick={() => setSheet("info")}>선택 완료</S.PrimaryButton>
                </>
              )}
            </S.Sheet>
          </S.Overlay>
        )}
      </S.Page>
    </S.PageShell>
  );
}

function datesForDraft(startDate: string) {
  return courseDateLabels(startDate, travelerCourse.days.length);
}

export default ImportedTripPage;
