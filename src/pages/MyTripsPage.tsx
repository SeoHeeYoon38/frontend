import { useMemo } from "react";
import { useSearchParams } from "react-router";
import pinIcon from "../assets/course-settings/pin.svg";
import CreateTripSheet from "../components/common/CreateTripSheet";
import { pastTrips, upcomingTrips } from "../data/mocks/myTripsData";
import type { MyTripSummary } from "../types/myTrips";
import { importedTripPath, tripPlanPath } from "../utils/navigation";
import {
  formatTripDateRange,
  importedTripRegistrationKey,
  parseImportedTripRegistration,
} from "../utils/importedTrip";
import * as S from "./MyTripsPage.styled";

type TripTab = "upcoming" | "past";

function TripCard({ trip }: { trip: MyTripSummary }) {
  let dateLabel = trip.dateLabel;
  if (trip.id === "kyoto") {
    try {
      const saved = parseImportedTripRegistration(
        localStorage.getItem(importedTripRegistrationKey("kyoto-walk")),
      );
      if (saved) dateLabel = formatTripDateRange(saved.startDate, saved.endDate);
    } catch {
      // 브라우저 저장소를 사용할 수 없으면 목업의 기본 문구를 사용합니다.
    }
  }

  return (
    <S.TripCard
      to={trip.id === "kyoto" ? importedTripPath(trip.id) : tripPlanPath("my-trips", trip.id)}
      aria-label={`${trip.title} 코스 보기`}
    >
      <img src={trip.coverImage} alt="" />
      <strong>{trip.title}</strong>
      <span>
        <img src={pinIcon} alt="" />
        {trip.city}
      </span>
      <small>
        {dateLabel}
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
  const showImportedToast = searchParams.get("toast") === "course-imported";
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
      {(showSavedToast || showImportedToast) && (
        <S.Toast role="status" aria-live="polite">
          <span>✓</span>
          <strong>{showImportedToast ? "교토 2박 3일 일정을 가져왔어요" : "오사카 3박 4일 일정을 저장했어요"}</strong>
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

      {isCreateOpen && <CreateTripSheet onClose={closeOverlay} />}
    </S.Page>
  );
}

export default MyTripsPage;
