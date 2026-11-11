import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { readHomeTrips, readTripStorageNotice } from "../data/mocks/mockTripService";
import CreateTripSheet from "../components/common/CreateTripSheet";
import HomeIntro from "../components/home/HomeIntro";
import MyTripsSection from "../components/home/MyTripsSection";
import RecommendedCourses from "../components/home/RecommendedCourses";
import SharedTripsSection from "../components/home/SharedTripsSection";
import { readMockScenario } from "../utils/mockScenario";
import { parseProfileSettings, PROFILE_STORAGE_KEY } from "../utils/mySettings";
import { getMe } from "../api/auth";
import { isApiEnabled } from "../api/config";
import { hasAuthSession } from "../api/tokenStorage";
import { apiTripToSummary } from "../utils/serverTrip";
import { useMyTrips } from "../hooks/useMyTrips";
import { resumeTripPath, serverTripPlanPath } from "../utils/navigation";

function HomePage() {
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const data = readHomeTrips();
  const myTrips = useMyTrips(true);
  const [nickname] = useState(() => {
    try {
      return parseProfileSettings(localStorage.getItem(PROFILE_STORAGE_KEY))?.nickname;
    } catch {
      return undefined;
    }
  });
  const [accountName, setAccountName] = useState<string>();
  useEffect(() => {
    if (!isApiEnabled() || !hasAuthSession()) return;
    const controller = new AbortController();
    void getMe(controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) setAccountName(user.name);
      })
      .catch(() => {
        // 인증 서버를 사용할 수 없으면 로컬 프로필 이름을 유지합니다.
      });
    return () => controller.abort();
  }, []);
  const storageNotice = readTripStorageNotice();
  const showEmptyTrips = readMockScenario(location.search) === "home-empty";
  const trips = myTrips.enabled ? myTrips.trips.map(apiTripToSummary) : showEmptyTrips ? [] : data.trips;
  const nextTrip = myTrips.enabled
    ? trips.find((trip, index) => trip.status === "upcoming" && myTrips.trips[index].status === "CONFIRMED") ?? null
    : showEmptyTrips ? null : data.nextTrip;
  const tripPath = myTrips.enabled ? (id: string) => serverTripPlanPath("home", id) : undefined;

  return (
    <>
      {!myTrips.enabled && storageNotice && <p role="alert">{storageNotice}</p>}
      <HomeIntro
        name={accountName ?? nickname ?? (myTrips.enabled ? "" : data.userName)}
        trip={nextTrip}
        tripPath={tripPath}
        resumePath={myTrips.inProgress && resumeTripPath(myTrips.inProgress.id)}
      />
      {myTrips.inProgressError && <p role="alert">진행 중인 여행을 확인하지 못했어요.</p>}
      {myTrips.pending && <p role="status">내 여행을 불러오고 있어요.</p>}
      {myTrips.error && <p role="alert">{myTrips.error}</p>}
      {!myTrips.pending && !myTrips.error && (
        <MyTripsSection trips={trips} tripPath={tripPath} onCreateTrip={() => setIsCreateOpen(true)} />
      )}
      <RecommendedCourses courses={data.courses} />
      <SharedTripsSection trips={data.sharedTrips} />
      {isCreateOpen && <CreateTripSheet onClose={() => setIsCreateOpen(false)} />}
    </>
  );
}

export default HomePage;
