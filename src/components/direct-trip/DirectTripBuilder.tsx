import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import directHeroPhoto from "../../assets/direct-trip/hero.png";
import CourseRouteMap from "../course-completion/CourseRouteMap";
import { PlaceThumbnail } from "../common/PlacePhoto";
import TripInfoStep from "../trip/TripInfoStep";
import DirectPlaceSearch from "./DirectPlaceSearch";
import { isServerTripId, savedPlaceToTripPlace, tripDraftToApiInput } from "../../api/adapters";
import { isApiEnabled } from "../../api/config";
import { hasAuthSession } from "../../api/tokenStorage";
import { confirmTrip, createTrip, updateTrip } from "../../api/trips";
import { saveItinerary } from "../../api/itineraries";
import { ApiError } from "../../api/client";
import { editedItineraryDays, moveVisit, reorderVisit } from "../../utils/itineraryEditing";
import type { ItineraryDayInput, ItineraryVersionView, ItineraryVisitInput, SavedPlaceResponse } from "../../api/types";
import { useItineraryCheck } from "../../hooks/useItineraryCheck";
import { createGeneratedTrip, mockTripStatus, placeIcon, saveMockTrip, tripStorageNotice } from "../../data/mocks/mockTripService";
import { dateLabel, durationLabel, emptyDraft, rangeDates, tripDateStatus } from "../../utils/trip";
import type { TripDraft } from "../../types/trip";
import { mockTripPlaces } from "../../data/mocks/tripData";
import { mockTripCities } from "../../data/mocks/tripData";
import searchIcon from "../../assets/direct-trip/search.svg";
import settingsIcon from "../../assets/course-completion/settings.svg";
import backIcon from "../../assets/icons/nav-back.svg";
import heroBackIcon from "../../assets/course-completion/back.svg";
import addIcon from "../../assets/direct-trip/add.svg";
import cityPinIcon from "../../assets/direct-trip/city-pin.svg";
import emptyPinIcon from "../../assets/direct-trip/empty-pin.svg";
import calendarIcon from "../../assets/course-completion/icon-calendar.svg";
import pinIcon from "../../assets/course-completion/icon-pin.svg";
import trainIcon from "../../assets/course-completion/icon-train.svg";
import dragHandleIcon from "../../assets/course-completion/drag-handle.svg";
import removeIcon from "../../assets/course-completion/remove.svg";
import foodIcon from "../../assets/course-completion/category-food.svg";
import cafeIcon from "../../assets/course-completion/category-cafe.svg";
import sightIcon from "../../assets/icons/category-sightseeing.svg";
import shoppingIcon from "../../assets/icons/category-shopping.svg";
import savedCheckIcon from "../../assets/direct-trip/added-check.svg";
import { routes } from "../../config/routes";
import { serverTripPlanPath, tripSettingsPath } from "../../utils/navigation";
import {
  directTripPlaces as osakaPlaces,
} from "../../data/mocks/directTripData";
import type {
  DirectTripPlace,
  DirectTripStage,
} from "../../types/directTrip";
import { readMockScenario } from "../../utils/mockScenario";
import * as S from "./DirectTripBuilder.styled";

const emptyDayPlaces: Record<number, string[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
};

function categoryIcon(category: string) {
  if (category.includes("맛집") || category.includes("음식")) return foodIcon;
  if (category.includes("카페")) return cafeIcon;
  if (category.includes("쇼핑")) return shoppingIcon;
  return sightIcon;
}

function heroDateLabel(start: string, end: string) {
  const weekday = ["일", "월", "화", "수", "목", "금", "토"];
  const format = (date: string, showYear: boolean) => {
    const [year, month, day] = date.split("-");
    const dayOfWeek = weekday[new Date(`${date}T00:00:00`).getDay()];
    return `${showYear ? `${year}.` : ""}${month}.${day} (${dayOfWeek})`;
  };
  return `${format(start, true)} – ${format(end, false)}`;
}

function addedPlaceMessage(name: string, day: number) {
  const last = name.charCodeAt(name.length - 1);
  const hasFinal = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${name}${hasFinal ? "을" : "를"} ${day}일차에 담았어요`;
}

function BackIcon() {
  return <img src={backIcon} alt="" />;
}

interface ExistingTrip {
  draft: TripDraft;
  days: ItineraryDayInput[];
  places: SavedPlaceResponse[];
  version: number;
  initialDay?: number;
  onSaved: (itinerary: ItineraryVersionView) => void;
  onClose: () => void;
}

function DirectTripBuilder({ existing }: { existing?: ExistingTrip } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [live] = useState(() => Boolean(existing) || (isApiEnabled() && hasAuthSession()));
  const mockScenario = live ? undefined : readMockScenario(location.search);
  const [stage, setStage] = useState<DirectTripStage>(() => {
    if (existing) return "itinerary";
    if (
      mockScenario === "direct-search-empty" ||
      mockScenario === "direct-google-unlinked"
    ) {
      return "search";
    }
    if (mockScenario === "direct-exit-confirm") return "itinerary";
    return "info";
  });
  const [draft, setDraft] = useState<TripDraft>(() => existing?.draft ?? (live ? {
    ...emptyDraft(), tripId: crypto.randomUUID(),
  } : {
    ...emptyDraft(), tripId: crypto.randomUUID(), city: "오사카", country: "일본",
    startDate: "2026-05-18", endDate: "2026-05-21", companion: "친구", people: 3,
  }));
  const [notice, setNotice] = useState("");
  const [addedNotice, setAddedNotice] = useState("");
  useEffect(() => {
    if (!addedNotice) return;
    const timer = window.setTimeout(() => setAddedNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [addedNotice]);
  const [changed, setChanged] = useState(false);
  const [preparingTrip, setPreparingTrip] = useState(false);
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [saveConflict, setSaveConflict] = useState(false);
  const savePending = useRef(false);
  const preparingRequest = useRef<AbortController | null>(null);
  useEffect(() => () => preparingRequest.current?.abort(), []);
  const { validation, checking, checkError, resetCheck, validate } = useItineraryCheck(Number(draft.tripId));
  const [livePlaces, setLivePlaces] = useState<Record<string, DirectTripPlace & { visit: ItineraryVisitInput }>>(() =>
    Object.fromEntries((existing?.days ?? []).flatMap((day) => day.visits.map((visit, index) => {
      const id = visit.itemId ?? `${day.date}-${index}`;
      const saved = existing?.places.find((place) => place.placeId === visit.placeId);
      const place = saved && savedPlaceToTripPlace(saved, draft.city);
      return [id, {
        id,
        name: place?.title ?? "장소 정보 없음",
        category: place?.category ?? "",
        detail: place?.description ?? "",
        image: place?.image ?? "",
        latitude: place?.latitude,
        longitude: place?.longitude,
        source: "google",
        visit: { ...visit, itemId: id },
      }];
    }))),
  );
  const directTripDays = rangeDates(draft.startDate, draft.endDate).map((date, index) => ({
    day: index + 1, date: dateLabel(date).split(" ")[0], weekday: dateLabel(date).split(" ")[1],
  }));
  const directTripPlaces: DirectTripPlace[] = useMemo(() => draft.city === "오사카" ? osakaPlaces :
    mockTripPlaces.filter((place) => place.city === draft.city).map((place) => ({
      id: place.id, name: place.title, category: place.category, detail: place.description,
      image: place.image, source: "recommend" as const,
      latitude: place.latitude, longitude: place.longitude,
    })), [draft.city]);
  const [selectedDay, setSelectedDay] = useState(existing?.initialDay ?? 1);
  const draggingPlace = useRef<string | null>(null);
  const [dayPlaces, setDayPlaces] = useState<Record<number, string[]>>(() => existing
    ? Object.fromEntries(rangeDates(draft.startDate, draft.endDate).map((date, index) => [
      index + 1,
      existing.days.find((day) => day.date === date)?.visits.map((visit, position) => visit.itemId ?? `${date}-${position}`) ?? [],
    ]))
    : mockScenario === "direct-exit-confirm"
      ? { ...emptyDayPlaces, 1: ["kuromon"] }
      : emptyDayPlaces,
  );
  const [showExitConfirm, setShowExitConfirm] = useState(
    mockScenario === "direct-exit-confirm",
  );

  const placesForDay = useMemo(
    () =>
      (dayPlaces[selectedDay] ?? [])
        .map((id) => live ? livePlaces[id] : directTripPlaces.find((place) => place.id === id))
        .filter((place): place is DirectTripPlace => Boolean(place)),
    [dayPlaces, selectedDay, directTripPlaces, live, livePlaces],
  );
  const nearbyAnchor = placesForDay[placesForDay.length - 1];
  const nearbyCenter = nearbyAnchor?.latitude !== undefined && nearbyAnchor.longitude !== undefined
    ? { lat: nearbyAnchor.latitude, lng: nearbyAnchor.longitude }
    : undefined;

  const placeCount = Object.values(dayPlaces).reduce(
    (total, places) => total + places.length,
    0,
  );
  const hasAnyPlace = placeCount > 0;
  const scheduled = validation?.days.find((day) => day.date === rangeDates(draft.startDate, draft.endDate)[selectedDay - 1]);

  const leave = () => {
    if (existing) existing.onClose();
    else navigate(routes.home);
  };

  const goBack = () => {
    if (stage === "search") {
      setStage("itinerary");
      return;
    }
    if (stage === "itinerary") {
      if (existing ? changed : hasAnyPlace) setShowExitConfirm(true);
      else if (existing) leave();
      else setStage("info");
      return;
    }
    leave();
  };

  const addDemoPlaces = (ids: string[]) => {
    resetCheck();
    setChanged(true);
    setDayPlaces((current) => ({
      ...current,
      [selectedDay]: Array.from(
        new Set([...(current[selectedDay] ?? []), ...ids]),
      ),
    }));
    setStage("itinerary");
    const first = directTripPlaces.find((place) => place.id === ids[0]);
    if (first) setAddedNotice(addedPlaceMessage(first.name, selectedDay));
  };

  const movePlace = (placeId: string, nextDay: number) => {
    resetCheck();
    setChanged(true);
    setDayPlaces((current) => moveVisit(current, placeId, nextDay));
  };

  const reorderPlace = (itemId: string, offset: -1 | 1) => {
    resetCheck();
    setChanged(true);
    setDayPlaces((current) => ({
      ...current,
      [selectedDay]: reorderVisit(current[selectedDay] ?? [], itemId, offset),
    }));
  };

  const dropPlace = (targetId: string) => {
    const sourceId = draggingPlace.current;
    draggingPlace.current = null;
    if (!sourceId || sourceId === targetId) return;
    resetCheck();
    setChanged(true);
    setDayPlaces((current) => {
      const order = [...(current[selectedDay] ?? [])];
      const from = order.indexOf(sourceId);
      const to = order.indexOf(targetId);
      if (from < 0 || to < 0) return current;
      order.splice(to, 0, order.splice(from, 1)[0]);
      return { ...current, [selectedDay]: order };
    });
  };

  const removePlace = (placeId: string) => {
    resetCheck();
    setChanged(true);
    setDayPlaces((current) => ({
      ...current,
      [selectedDay]: current[selectedDay].filter((id) => id !== placeId),
    }));
  };

  async function startItinerary() {
    if (!live) {
      setStage("itinerary");
      return;
    }
    const input = tripDraftToApiInput(draft);
    if (!input || preparingRequest.current) return;
    const controller = new AbortController();
    preparingRequest.current = controller;
    setNotice("");
    setPreparingTrip(true);
    try {
      const trip = isServerTripId(draft.tripId)
        ? await updateTrip(Number(draft.tripId), input, controller.signal)
        : await createTrip(input, controller.signal);
      if (controller.signal.aborted) return;
      setDraft({ ...draft, tripId: String(trip.id) });
      setStage("itinerary");
    } catch (reason) {
      if (!controller.signal.aborted) {
        setNotice(reason instanceof Error ? reason.message : "여행 정보를 저장하지 못했어요.");
      }
    } finally {
      if (preparingRequest.current === controller) preparingRequest.current = null;
      if (!controller.signal.aborted) setPreparingTrip(false);
    }
  }

  function addLivePlaces(savedPlaces: SavedPlaceResponse[]) {
    const existingIds = new Set((dayPlaces[selectedDay] ?? []).map((id) => livePlaces[id]?.visit.placeId));
    const additions: typeof livePlaces = {};
    for (const saved of savedPlaces) {
      const { placeId } = saved;
      if (!placeId || existingIds.has(placeId)) continue;
      existingIds.add(placeId);
      const place = savedPlaceToTripPlace(saved, draft.city);
      const id = `v-${crypto.randomUUID()}`;
      additions[id] = {
        id,
        name: place.title,
        category: place.category,
        detail: place.description,
        image: place.image,
        latitude: place.latitude,
        longitude: place.longitude,
        source: "google",
        visit: { itemId: id, placeId },
      };
    }
    const ids = Object.keys(additions);
    if (!ids.length) return;
    resetCheck();
    setChanged(true);
    setLivePlaces((current) => ({ ...current, ...additions }));
    setDayPlaces((current) => ({ ...current, [selectedDay]: [...(current[selectedDay] ?? []), ...ids] }));
    setStage("itinerary");
    if (savedPlaces[0]) setAddedNotice(addedPlaceMessage(savedPlaces[0].name, selectedDay));
  }

  const renderInfo = () => (
    <S.PlainScreen>
      <S.PlainHeader>
        <S.BackButton type="button" onClick={goBack} aria-label="뒤로 가기"><BackIcon /></S.BackButton>
        <h1>직접 일정 만들기</h1>
      </S.PlainHeader>
      <S.InfoScroll>
        <TripInfoStep
          draft={draft}
          onChange={(next) => {
            if (next.city !== draft.city || next.startDate !== draft.startDate || next.endDate !== draft.endDate) {
              setDayPlaces(Object.fromEntries(rangeDates(next.startDate, next.endDate).map((_, index) => [index + 1, []])));
              setSelectedDay(1);
            }
            setDraft(next);
          }}
          onNext={startItinerary}
          nextLabel="일정 만들기"
          submitting={preparingTrip}
          submitError={notice}
        />
      </S.InfoScroll>
    </S.PlainScreen>
  );

  const liveDays = useMemo(() => live ? editedItineraryDays(
    rangeDates(draft.startDate, draft.endDate), dayPlaces, livePlaces,
  ) : [], [live, draft.startDate, draft.endDate, dayPlaces, livePlaces]);

  useEffect(() => {
    if (!live || stage !== "itinerary" || !hasAnyPlace || (existing && !changed)) return;
    const timer = window.setTimeout(() => void validate(liveDays), 300);
    return () => window.clearTimeout(timer);
  }, [live, stage, hasAnyPlace, existing, changed, liveDays, validate]);

  const saveTrip = async () => {
    if (live) {
      if (savePending.current || saveConflict || checking || !validation?.summary.valid) return;
      savePending.current = true;
      setSavingItinerary(true);
      setNotice("");
      try {
        const itinerary = await saveItinerary(
          Number(draft.tripId),
          liveDays,
          existing?.version ?? null,
        );
        setChanged(false);
        if (existing) {
          existing.onSaved(itinerary);
          existing.onClose();
        } else {
          const confirmation = await confirmTrip(Number(draft.tripId)).catch(() => null);
          if (confirmation === null) {
            navigate(serverTripPlanPath("generated", draft.tripId), {
              replace: true,
              state: { confirmation },
            });
          } else {
            const params = new URLSearchParams({ toast: "saved", savedTripId: draft.tripId });
            if (tripDateStatus(draft.startDate, draft.endDate).status === "past") params.set("tab", "past");
            navigate(`${routes.myTrips}?${params.toString()}`, { replace: true });
          }
        }
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 409) {
          setSaveConflict(true);
          setNotice("다른 구성원이 일정을 변경했어요. 편집 내용은 유지됩니다. 변경 내용을 확인한 뒤 편집을 나가 최신 일정을 다시 열어 주세요.");
        } else {
          setNotice(reason instanceof Error ? reason.message : "일정을 저장하지 못했어요.");
        }
      } finally {
        savePending.current = false;
        setSavingItinerary(false);
      }
      return;
    }
    const trip = createGeneratedTrip(draft);
    trip.source = "direct";
    trip.saved = true;
    trip.days = trip.days.map((day, dayIndex) => ({
      ...day,
      places: (dayPlaces[dayIndex + 1] ?? []).flatMap((id, index) => {
        const place = directTripPlaces.find((item) => item.id === id);
        return place ? [{
          id: dayIndex * 1000 + index + 1, name: place.name, category: place.category,
          detail: place.detail, image: place.image, icon: placeIcon(place.category),
        }] : [];
      }),
    }));
    if (!saveMockTrip(trip)) {
      setNotice(tripStorageNotice);
      return;
    }
    const params = new URLSearchParams({ toast: "saved" });
    if (mockTripStatus(trip) === "past") params.set("tab", "past");
    navigate(`${routes.myTrips}?${params.toString()}`);
  };

  const renderItinerary = () => (
    <S.PlanScreen>
      <S.Hero>
        <img src={draft.city === "오사카" ? directHeroPhoto : mockTripCities.find((city) => city.name === draft.city)?.image ?? ""} alt={`${draft.city} 여행`} />
        <S.HeroScrim />
        <S.HeroHeader>
          <S.BackButton type="button" onClick={goBack} aria-label="뒤로 가기">
            <img src={heroBackIcon} alt="" />
          </S.BackButton>
          <small>내 일정</small>
          <button
            type="button"
            aria-label="일정 설정"
            onClick={() => {
              if (isServerTripId(draft.tripId)) {
                navigate(tripSettingsPath("generated", undefined, Number(draft.tripId)));
              }
            }}
          >
            <img src={settingsIcon} alt="" />
          </button>
        </S.HeroHeader>
        <S.HeroTitle>
          <span><img src={cityPinIcon} alt="" />{draft.city}</span>
          <div>
            <h1>{draft.city} {durationLabel(draft.startDate, draft.endDate)}</h1>
            <p>{heroDateLabel(draft.startDate, draft.endDate)}</p>
          </div>
        </S.HeroTitle>
        <S.HeroInvite type="button" onClick={() => {
          if (isServerTripId(draft.tripId)) {
            navigate(`${tripSettingsPath("generated", undefined, Number(draft.tripId))}&panel=invite`);
          } else setNotice("일정을 저장한 뒤 친구를 초대할 수 있어요.");
        }}><img src={addIcon} alt="" />친구 초대</S.HeroInvite>
      </S.Hero>

      <S.PlanScroll>
        {hasAnyPlace && <S.ItineraryOverview>
          <h2>일정</h2>
          <S.Facts aria-label="여행 요약">
            <div><img src={calendarIcon} alt="" /><strong>{durationLabel(draft.startDate, draft.endDate)}</strong><span>여행 기간</span></div>
            <div><img src={pinIcon} alt="" /><strong>{placeCount}곳</strong><span>장소</span></div>
            <div><img src={trainIcon} alt="" /><strong>미정</strong><span>이동 방법</span></div>
          </S.Facts>
        </S.ItineraryOverview>}
        <S.DayTabs aria-label="일정 일자">
          {directTripDays.map((day) => (
            <button
              type="button"
              key={day.day}
              aria-pressed={selectedDay === day.day}
              onClick={() => setSelectedDay(day.day)}
            >
              <strong>{day.day}일차</strong>
              <span>{day.date}</span>
            </button>
          ))}
        </S.DayTabs>

        {placesForDay.length > 0 && <CourseRouteMap
          city={draft.city}
          day={selectedDay}
          liveTiles={live}
          hideCaption
          places={placesForDay.map((place, index) => ({
            id: place.id, name: place.name, order: index + 1,
            latitude: place.latitude, longitude: place.longitude,
          }))}
        />}

        <S.ScheduleHeader>
          <div>
            <strong>{selectedDay}일차 일정</strong>
            {placesForDay.length > 0 && <span>{placesForDay.length}곳</span>}
          </div>
        </S.ScheduleHeader>

        {placesForDay.length === 0 ? (
          <S.EmptyPlan>
            <span><img src={emptyPinIcon} alt="" /></span>
            <h2>아직 담긴 장소가 없어요</h2>
            <p>가고 싶은 곳을 검색해서 하나씩 담아보세요</p>
            <button type="button" onClick={() => setStage("search")}>
              <img src={searchIcon} alt="" />
              장소 검색해서 담기
            </button>
          </S.EmptyPlan>
        ) : (
          <S.FilledPlan>
            <S.Timeline>
              {placesForDay.map((place, index) => {
                return (
                <li key={place.id} draggable={!savingItinerary} tabIndex={0}
                  aria-label={`${place.name} 일정 순서`}
                  onKeyDown={(event) => {
                    if (!event.shiftKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
                    event.preventDefault();
                    reorderPlace(place.id, event.key === "ArrowUp" ? -1 : 1);
                  }}
                  onDragStart={() => { draggingPlace.current = place.id; }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropPlace(place.id)}
                  onDragEnd={() => { draggingPlace.current = null; }}>
                  <S.TimelineNumber>{index + 1}</S.TimelineNumber>
                  <S.TimelineCard>
                    <label className="direct-place-handle">
                      <img src={dragHandleIcon} alt="" />
                      <select
                        aria-label={`${place.name} 이동 일자`}
                        disabled={savingItinerary}
                        value={selectedDay}
                        onChange={(event) => movePlace(place.id, Number(event.target.value))}>
                        {directTripDays.map((day) => <option key={day.day} value={day.day}>{day.day}일차로 이동</option>)}
                      </select>
                    </label>
                    <div className="direct-place-thumb">
                      {live && livePlaces[place.id]?.visit.placeId
                        ? <PlaceThumbnail placeId={livePlaces[place.id].visit.placeId} name={place.name} />
                        : place.image && <img src={place.image} alt="" />}
                    </div>
                    <div className="direct-place-copy">
                      <strong>{place.name}</strong>
                      <span><img src={categoryIcon(place.category)} alt="" />{place.category}</span>
                    </div>
                    <button className="direct-place-remove" type="button" disabled={savingItinerary}
                      onClick={() => removePlace(place.id)} aria-label={`${place.name} 삭제`}><img src={removeIcon} alt="" /></button>
                  </S.TimelineCard>
                  {index < placesForDay.length - 1 && <S.TravelRow>{scheduled?.visits[index + 1]?.travel.minutes !== undefined
                    ? `이동 ${scheduled.visits[index + 1].travel.minutes}분`
                    : place.travelTime ?? ""}</S.TravelRow>}
                </li>
                );
              })}
            </S.Timeline>
            <S.AddPlaceButton type="button" onClick={() => setStage("search")}><img src={addIcon} alt="" />장소 추가</S.AddPlaceButton>
          </S.FilledPlan>
        )}
        {checkError && (
          <div>
            <p role="alert">{checkError}</p>
            <button type="button" onClick={() => void validate(liveDays)}>다시 시도</button>
          </div>
        )}
      </S.PlanScroll>

      {notice && <p role="alert">{notice}</p>}
      {addedNotice && <S.AddedToast role="status"><img src={savedCheckIcon} alt="" />{addedNotice}</S.AddedToast>}
      <S.BottomAction $floating>
        <button
          type="button"
          disabled={!hasAnyPlace || checking || savingItinerary || saveConflict || (live && !validation?.summary.valid)}
          onClick={() => void saveTrip()}
        >
          {savingItinerary
              ? "일정 저장 중…"
              : "저장하기"}
        </button>
      </S.BottomAction>
    </S.PlanScreen>
  );

  return (
    <S.Shell>
      {stage === "info" && renderInfo()}
      {stage === "itinerary" && renderItinerary()}
      {stage === "search" && <DirectPlaceSearch
        tripId={live ? Number(draft.tripId) : undefined}
        city={draft.city}
        selectedDay={selectedDay}
        nearbyCenter={nearbyCenter}
        days={directTripDays.map((day) => ({ ...day, placeCount: dayPlaces[day.day]?.length ?? 0 }))}
        pickedPlaceIds={new Set(live
          ? (dayPlaces[selectedDay] ?? []).map((id) => livePlaces[id]?.visit.placeId).filter((id): id is string => Boolean(id))
          : dayPlaces[selectedDay] ?? [])}
        demoPlaces={live ? undefined : directTripPlaces}
        demoGoogleUnlinked={mockScenario === "direct-google-unlinked"}
        initialQuery={mockScenario === "direct-search-empty" ? "쿠로몬 야타이" : ""}
        onSelectDay={setSelectedDay}
        onAddLive={addLivePlaces}
        onAddDemo={addDemoPlaces}
        onClose={goBack}
      />}
      {showExitConfirm && (
        <S.ConfirmOverlay role="presentation" onMouseDown={() => setShowExitConfirm(false)}>
          <S.ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="direct-trip-exit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="direct-trip-exit-title">저장하지 않고 나갈까요?</h2>
            <p>{existing ? "이번에 편집한 내용이 사라져요." : `담은 장소 ${placeCount}곳이 사라져요`}</p>
            <div>
              <button type="button" onClick={leave}>
                나가기
              </button>
              <button type="button" onClick={() => setShowExitConfirm(false)}>
                계속 만들기
              </button>
            </div>
          </S.ConfirmDialog>
        </S.ConfirmOverlay>
      )}
    </S.Shell>
  );
}

export default DirectTripBuilder;

