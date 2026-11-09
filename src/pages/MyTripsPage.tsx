import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import aiCharacter from "../assets/images/character-purple.webp";
import courseCharacter from "../assets/images/character-blue.webp";
import pinIcon from "../assets/course-settings/pin.svg";
import penIcon from "../assets/icons/action-pen.svg";
import { routes } from "../config/routes";
import { pastTrips, upcomingTrips } from "../data/mocks/myTripsData";
import type { MyTripSummary } from "../types/myTrips";
import { tripPlanPath } from "../utils/navigation";
import * as S from "./MyTripsPage.styled";

type TripTab = "upcoming" | "past";

function TripCard({ trip }: { trip: MyTripSummary }) {
  return (
    <S.TripCard
      to={tripPlanPath("my-trips", trip.id)}
      aria-label={`${trip.title} 코스 보기`}
    >
      <img src={trip.coverImage} alt="" />
      <strong>{trip.title}</strong>
      <span>
        <img src={pinIcon} alt="" />
        {trip.city}
      </span>
      <small>
        {trip.dateLabel}
        {trip.countdownLabel && <b>{trip.countdownLabel}</b>}
      </small>
    </S.TripCard>
  );
}

function MyTripsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") === "past" ? "past" : "upcoming") as TripTab;
  const query = searchParams.get("q") ?? "";
  const isSearching = searchParams.has("search");
  const isCreateOpen = searchParams.has("create");
  const showSavedToast = searchParams.get("toast") === "saved";
  const trips = tab === "past" ? pastTrips : upcomingTrips;
  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) =>
        `${trip.title} ${trip.city}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, trips],
  );

  const selectTab = (nextTab: TripTab) => {
    const next = new URLSearchParams();
    if (nextTab === "past") next.set("tab", "past");
    setSearchParams(next);
  };

  const closeOverlay = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("create");
    setSearchParams(next);
  };

  return (
    <S.Page>
      {showSavedToast && (
        <S.Toast role="status" aria-live="polite">
          <span>✓</span>
          <strong>오사카 3박 4일 일정을 저장했어요</strong>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("toast");
              setSearchParams(next, { replace: true });
            }}
            aria-label="알림 닫기"
          >
            ×
          </button>
        </S.Toast>
      )}
      {isSearching && (
        <S.SearchBar>
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              next.set("search", "1");
              if (event.target.value) next.set("q", event.target.value);
              else next.delete("q");
              setSearchParams(next, { replace: true });
            }}
            placeholder="여행 이름이나 도시 검색"
            aria-label="여행 검색어"
          />
          <button
            type="button"
            onClick={() =>
              setSearchParams(tab === "past" ? { tab: "past" } : {})
            }
          >
            취소
          </button>
        </S.SearchBar>
      )}

      <S.Tabs aria-label="마이트립 분류">
        <button
          type="button"
          aria-pressed={tab === "upcoming"}
          onClick={() => selectTab("upcoming")}
        >
          다가오는 여행 <b>{upcomingTrips.length}</b>
        </button>
        <button
          type="button"
          aria-pressed={tab === "past"}
          onClick={() => selectTab("past")}
        >
          지난 여행 <b>{pastTrips.length}</b>
        </button>
      </S.Tabs>

      <S.Grid>
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </S.Grid>

      {filteredTrips.length === 0 && (
        <S.Empty>
          검색 결과가 없어요.
          <br />
          다른 여행 이름을 입력해 보세요.
        </S.Empty>
      )}

      {isCreateOpen && (
        <S.Overlay role="presentation" onMouseDown={closeOverlay}>
          <S.CreateSheet
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-trip-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <S.Handle />
            <h2 id="create-trip-title">어떻게 여행을 만들까요?</h2>
            <Link to={routes.createTrip}>
              <img src={aiCharacter} alt="" />
              <span>
                <strong>AI 맞춤 여행 만들기</strong>
                <small>취향과 저장 장소로 전체 일정을 짜줘요</small>
              </span>
              <b>›</b>
            </Link>
            <Link to={routes.courses}>
              <img src={courseCharacter} alt="" />
              <span>
                <strong>인기 코스 둘러보기</strong>
                <small>많이 선택한 코스를 내 일정에 가져와요</small>
              </span>
              <b>›</b>
            </Link>
            <Link to={`${routes.createTrip}?mode=direct`}>
              <S.PenIcon aria-hidden="true">
                <img src={penIcon} alt="" />
              </S.PenIcon>
              <span>
                <strong>직접 일정 만들기</strong>
                <small>빈 일정에서 장소를 하나씩 담아요</small>
              </span>
              <b>›</b>
            </Link>
          </S.CreateSheet>
        </S.Overlay>
      )}
    </S.Page>
  );
}

export default MyTripsPage;
