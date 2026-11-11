import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import heroPhoto from "../../assets/course-completion/hero-photo.png";
import emptyCharacter from "../../assets/images/character-empty-places.webp";
import googleMapsLogo from "../../assets/images/brand-google-maps.webp";
import CourseRouteMap from "../course-completion/CourseRouteMap";
import TripInfoStep from "../trip/TripInfoStep";
import PlaceImportForm from "../trip/PlaceImportForm";
import { createGeneratedTrip, mockTripStatus, placeIcon, saveMockTrip, tripStorageNotice } from "../../data/mocks/mockTripService";
import { dateLabel, durationLabel, emptyDraft, rangeDates } from "../../utils/trip";
import type { TripDraft } from "../../types/trip";
import { mockTripPlaces } from "../../data/mocks/tripData";
import searchIcon from "../../assets/course-completion/search.svg";
import settingsIcon from "../../assets/course-completion/settings.svg";
import backIcon from "../../assets/icons/nav-back.svg";
import closeIcon from "../../assets/icons/action-close.svg";
import { routes } from "../../config/routes";
import {
  directTripPlaces as osakaPlaces,
  directTripRecentSearches,
} from "../../data/mocks/directTripData";
import type {
  DirectTripPlace,
  DirectTripSearchTab,
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

function BackIcon() {
  return <img src={backIcon} alt="" />;
}

function DirectTripBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const mockScenario = readMockScenario(location.search);
  const [stage, setStage] = useState<DirectTripStage>(() => {
    if (
      mockScenario === "direct-search-empty" ||
      mockScenario === "direct-google-unlinked"
    ) {
      return "search";
    }
    if (mockScenario === "direct-exit-confirm") return "itinerary";
    return "info";
  });
  const [draft, setDraft] = useState<TripDraft>(() => ({
    ...emptyDraft(), tripId: crypto.randomUUID(), city: "오사카", country: "일본",
    startDate: "2026-05-18", endDate: "2026-05-21", companion: "친구", people: 3,
  }));
  const [notice, setNotice] = useState("");
  const directTripDays = rangeDates(draft.startDate, draft.endDate).map((date, index) => ({
    day: index + 1, date: dateLabel(date).split(" ")[0], weekday: dateLabel(date).split(" ")[1],
  }));
  const directTripPlaces: DirectTripPlace[] = useMemo(() => draft.city === "오사카" ? osakaPlaces :
    mockTripPlaces.filter((place) => place.city === draft.city).map((place) => ({
      id: place.id, name: place.title, category: place.category, detail: place.description,
      image: place.image, source: "recommend" as const,
    })), [draft.city]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchTab, setSearchTab] = useState<DirectTripSearchTab>(() =>
    mockScenario === "direct-google-unlinked" ? "google" : "recommend",
  );
  const [query, setQuery] = useState(() =>
    mockScenario === "direct-search-empty" ? "쿠로몬 야타이" : "",
  );
  const [samplePlacesReady, setSamplePlacesReady] = useState(false);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [dayPlaces, setDayPlaces] = useState<Record<number, string[]>>(() =>
    mockScenario === "direct-exit-confirm"
      ? { ...emptyDayPlaces, 1: ["kuromon"] }
      : emptyDayPlaces,
  );
  const [showExitConfirm, setShowExitConfirm] = useState(
    mockScenario === "direct-exit-confirm",
  );

  const placesForDay = useMemo(
    () =>
      (dayPlaces[selectedDay] ?? [])
        .map((id) => directTripPlaces.find((place) => place.id === id))
        .filter((place): place is DirectTripPlace => Boolean(place)),
    [dayPlaces, selectedDay, directTripPlaces],
  );

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return directTripPlaces.filter((place) => {
      const sourceMatches =
        searchTab === "recommend" || place.source === "google" || draft.city !== "오사카";
      const queryMatches =
        !normalizedQuery ||
        `${place.name} ${place.category} ${place.detail}`
          .toLowerCase()
          .includes(normalizedQuery);
      return sourceMatches && queryMatches;
    });
  }, [query, searchTab, directTripPlaces, draft.city]);

  const placeCount = Object.values(dayPlaces).reduce(
    (total, places) => total + places.length,
    0,
  );
  const hasAnyPlace = placeCount > 0;

  const goBack = () => {
    if (stage === "search") {
      setSelectedPlaceIds([]);
      setStage("itinerary");
      return;
    }
    if (stage === "itinerary") {
      if (hasAnyPlace) setShowExitConfirm(true);
      else setStage("info");
      return;
    }
    navigate(routes.home);
  };

  const togglePlace = (id: string) => {
    setSelectedPlaceIds((current) =>
      current.includes(id)
        ? current.filter((placeId) => placeId !== id)
        : [...current, id],
    );
  };

  const addSelectedPlaces = () => {
    setDayPlaces((current) => ({
      ...current,
      [selectedDay]: Array.from(
        new Set([...(current[selectedDay] ?? []), ...selectedPlaceIds]),
      ),
    }));
    setSelectedPlaceIds([]);
    setQuery("");
    setStage("itinerary");
  };

  const movePlace = (placeId: string, nextDay: number) => {
    setDayPlaces((current) => {
      const next: Record<number, string[]> = {};
      Object.entries(current).forEach(([day, ids]) => {
        next[Number(day)] = ids.filter((id) => id !== placeId);
      });
      next[nextDay] = [...next[nextDay], placeId];
      return next;
    });
  };

  const removePlace = (placeId: string) => {
    setDayPlaces((current) => ({
      ...current,
      [selectedDay]: current[selectedDay].filter((id) => id !== placeId),
    }));
  };

  const reorderPlace = (index: number, direction: number) => {
    setDayPlaces((current) => {
      const places = [...(current[selectedDay] ?? [])];
      const [place] = places.splice(index, 1);
      places.splice(index + direction, 0, place);
      return { ...current, [selectedDay]: places };
    });
  };

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
              setSamplePlacesReady(false);
            }
            setDraft(next);
          }}
          onNext={() => setStage("itinerary")}
        />
      </S.InfoScroll>
    </S.PlainScreen>
  );

  const saveTrip = () => {
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
        <img src={createGeneratedTrip(draft).coverImage || heroPhoto} alt={`${draft.city} 여행`} />
        <S.HeroScrim />
        <S.HeroHeader>
          <S.BackButton type="button" onClick={goBack} aria-label="뒤로 가기">
            <BackIcon />
          </S.BackButton>
          <div>
            <small>내 일정</small>
            <h1>{draft.city} {durationLabel(draft.startDate, draft.endDate)}</h1>
            <p>{dateLabel(draft.startDate)} – {dateLabel(draft.endDate)}</p>
          </div>
          <button type="button" aria-label="일정 설정">
            <img src={settingsIcon} alt="" />
          </button>
        </S.HeroHeader>
      </S.Hero>

      <S.PlanScroll>
        <S.TripSummary>
          <div>
            <span>여행지</span>
            <strong>{draft.city}</strong>
          </div>
          <i />
          <div>
            <span>기간</span>
            <strong>{durationLabel(draft.startDate, draft.endDate)}</strong>
          </div>
          <i />
          <div>
            <span>동행</span>
            <strong>{draft.companion} {draft.people}명</strong>
          </div>
        </S.TripSummary>

        <S.DayTabs aria-label="일정 일자">
          {directTripDays.map((day) => (
            <button
              type="button"
              key={day.day}
              aria-pressed={selectedDay === day.day}
              onClick={() => setSelectedDay(day.day)}
            >
              <strong>{day.day}일차</strong>
              <span>
                {day.date} {day.weekday}
              </span>
              {(dayPlaces[day.day] ?? []).length > 0 && <i />}
            </button>
          ))}
        </S.DayTabs>

        {placesForDay.length === 0 ? (
          <S.EmptyPlan>
            <img src={emptyCharacter} alt="" />
            <h2>아직 담긴 장소가 없어요</h2>
            <p>
              가고 싶은 장소를 검색하고
              <br />
              {selectedDay}일차 일정을 채워 보세요.
            </p>
            <button type="button" onClick={() => setStage("search")}>
              <img src={searchIcon} alt="" />
              장소 검색해서 담기
            </button>
          </S.EmptyPlan>
        ) : (
          <S.FilledPlan>
            <CourseRouteMap
              city={draft.city}
              day={selectedDay}
              places={placesForDay.map((place, index) => ({
                id: index + 1, name: place.name, category: place.category,
                detail: place.detail, image: place.image, icon: placeIcon(place.category),
              }))}
            />
            <S.ScheduleHeader>
              <div>
                <strong>{selectedDay}일차 일정</strong>
                <span>{placesForDay.length}곳</span>
              </div>
              <button type="button" onClick={() => setStage("search")}>
                + 장소 추가
              </button>
            </S.ScheduleHeader>
            <S.Timeline>
              {placesForDay.map((place, index) => (
                <li key={place.id}>
                  <S.TimelineNumber>{index + 1}</S.TimelineNumber>
                  <S.TimelineCard>
                    <img src={place.image} alt="" />
                    <div>
                      <small>{place.category}</small>
                      <strong>{place.name}</strong>
                      <span>{place.detail}</span>
                      <label>
                        <span className="sr-only">{place.name} 이동 일자</span>
                        <select
                          value={selectedDay}
                          onChange={(event) =>
                            movePlace(place.id, Number(event.target.value))
                          }
                        >
                          {directTripDays.map((day) => (
                            <option key={day.day} value={day.day}>
                              {day.day}일차로 이동
                            </option>
                          ))}
                        </select>
                      </label>
                      <div>
                        <button type="button" disabled={index === 0} aria-label={`${place.name} 위로 이동`} onClick={() => reorderPlace(index, -1)}>↑</button>
                        <button type="button" disabled={index === placesForDay.length - 1} aria-label={`${place.name} 아래로 이동`} onClick={() => reorderPlace(index, 1)}>↓</button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlace(place.id)}
                      aria-label={`${place.name} 삭제`}
                    >
                      <img src={closeIcon} alt="" />
                    </button>
                  </S.TimelineCard>
                  {index < placesForDay.length - 1 && (
                    <S.TravelRow>↳ {place.travelTime ?? "도보 8분"}</S.TravelRow>
                  )}
                </li>
              ))}
            </S.Timeline>
          </S.FilledPlan>
        )}
      </S.PlanScroll>

      {notice && <p role="alert">{notice}</p>}
      <S.BottomAction $floating>
        <button
          type="button"
          disabled={!hasAnyPlace}
          onClick={saveTrip}
        >
          저장하기
        </button>
      </S.BottomAction>
    </S.PlanScreen>
  );

  const renderSearch = () => {
    const showImportForm = searchTab === "google" && !samplePlacesReady;
    return (
      <S.SearchScreen>
        <S.SearchHeader>
          <S.BackButton type="button" onClick={goBack} aria-label="뒤로 가기">
            <BackIcon />
          </S.BackButton>
          <label data-active={Boolean(query)}>
            <img src={searchIcon} alt="" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="장소 이름을 검색해 보세요"
              aria-label="장소 검색어"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기">
                <img src={closeIcon} alt="" />
              </button>
            )}
          </label>
        </S.SearchHeader>

        <S.SearchContext>
          <span>{selectedDay}일차 {directTripDays[selectedDay - 1].date}</span>
          <strong>에 담아요</strong>
        </S.SearchContext>

        <S.SearchTabs>
          <button
            type="button"
            aria-pressed={searchTab === "recommend"}
            onClick={() => { setSearchTab("recommend"); setSelectedPlaceIds([]); }}
          >
            추천
          </button>
          <button
            type="button"
            aria-pressed={searchTab === "google"}
            onClick={() => { setSearchTab("google"); setSelectedPlaceIds([]); }}
          >
            <img src={googleMapsLogo} alt="" />
            Google Maps 가져오기
          </button>
        </S.SearchTabs>

        <S.SearchScroll>
          {showImportForm ? (
            <PlaceImportForm onImport={() => {
              setSamplePlacesReady(true);
              setSelectedPlaceIds([]);
              setQuery("");
            }} />
          ) : filteredPlaces.length === 0 ? (
            <S.NoResults>
              <S.StateIcon>
                <img src={searchIcon} alt="" />
              </S.StateIcon>
              <h2>검색 결과가 없어요</h2>
              <p>철자를 확인하거나 다른 이름으로 검색해 보세요</p>
            </S.NoResults>
          ) : (
            <>
              {!query && searchTab === "recommend" && (
                <S.RecentSearches>
                  <h2>최근 검색</h2>
                  <div>
                    {directTripRecentSearches.map((keyword) => (
                      <button type="button" key={keyword} onClick={() => setQuery(keyword)}>
                        {keyword}
                      </button>
                    ))}
                  </div>
                </S.RecentSearches>
              )}
              <S.ResultHeading>
                {query ? `‘${query}’ 검색 결과` : searchTab === "google" ? "가져온 샘플 장소" : `${draft.city} 추천 장소`}
              </S.ResultHeading>
              <S.PlaceList>
                {filteredPlaces.map((place) => {
                  const selected = selectedPlaceIds.includes(place.id);
                  const alreadyAdded = dayPlaces[selectedDay].includes(place.id);
                  return (
                    <li key={place.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        disabled={alreadyAdded}
                        onClick={() => togglePlace(place.id)}
                      >
                        <img src={place.image} alt="" />
                        <span>
                          <small>{place.category}</small>
                          <strong>{place.name}</strong>
                          <em>{place.detail}</em>
                        </span>
                        <i aria-hidden="true">{alreadyAdded ? "완료" : selected ? "✓" : ""}</i>
                      </button>
                    </li>
                  );
                })}
              </S.PlaceList>
            </>
          )}
        </S.SearchScroll>

        <S.BottomAction $floating>
          <button
            type="button"
            disabled={
              showImportForm ||
              filteredPlaces.length === 0 ||
              selectedPlaceIds.length === 0
            }
            onClick={addSelectedPlaces}
          >
            {selectedPlaceIds.length > 0
              ? `${selectedPlaceIds.length}곳을 ${selectedDay}일차에 담기`
              : "담을 장소를 골라주세요"}
          </button>
        </S.BottomAction>
      </S.SearchScreen>
    );
  };

  return (
    <S.Shell>
      {stage === "info" && renderInfo()}
      {stage === "itinerary" && renderItinerary()}
      {stage === "search" && renderSearch()}
      {showExitConfirm && (
        <S.ConfirmOverlay role="presentation" onMouseDown={() => setShowExitConfirm(false)}>
          <S.ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="direct-trip-exit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="direct-trip-exit-title">저장하지 않고 나갈까요?</h2>
            <p>담은 장소 {placeCount}곳이 사라져요</p>
            <div>
              <button type="button" onClick={() => navigate(routes.home)}>
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

