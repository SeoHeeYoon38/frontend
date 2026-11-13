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
import { getCourses } from "../api/courses";
import { courseSummaryToHomeCourse } from "../api/adapters";
import { hasAuthSession } from "../api/tokenStorage";
import { apiTripToSummary } from "../utils/serverTrip";
import { useMyTrips } from "../hooks/useMyTrips";
import { resumeTripPath, serverTripPlanPath } from "../utils/navigation";

function HomePage() {
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const data = readHomeTrips();
  const [recommendedCourses, setRecommendedCourses] = useState(() =>
    isApiEnabled() ? [] : data.courses,
  );
  const [coursePending, setCoursePending] = useState(isApiEnabled());
  const [courseError, setCourseError] = useState("");
  const myTrips = useMyTrips(true);
  const [nickname] = useState(() => {
    if (isApiEnabled()) return undefined;
    try {
      return parseProfileSettings(localStorage.getItem(PROFILE_STORAGE_KEY))?.nickname;
    } catch {
      return undefined;
    }
  });
  const [accountName, setAccountName] = useState<string>();
  const [accountError, setAccountError] = useState("");
  useEffect(() => {
    if (!isApiEnabled() || !hasAuthSession()) return;
    const controller = new AbortController();
    void getMe(controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) {
          setAccountName(user.nickname?.trim() || user.name);
          setAccountError("");
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setAccountError(
            reason instanceof Error
              ? reason.message
              : "사용자 정보를 불러오지 못했어요.",
          );
        }
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!isApiEnabled()) return;
    const controller = new AbortController();
    void getCourses(undefined, controller.signal).then(
      (courses) => {
        if (controller.signal.aborted) return;
        setRecommendedCourses(courses.map(courseSummaryToHomeCourse).slice(0, 5));
        setCoursePending(false);
        setCourseError("");
      },
      () => {
        if (controller.signal.aborted) return;
        setCoursePending(false);
        setCourseError("추천 코스를 불러오지 못했어요.");
      },
    );
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
      {accountError && <p role="alert">{accountError}</p>}
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
      {coursePending && <p role="status">추천 코스를 불러오고 있어요.</p>}
      {courseError && <p role="alert">{courseError}</p>}
      {!coursePending && !courseError && <RecommendedCourses courses={recommendedCourses} />}
      <SharedTripsSection trips={data.sharedTrips} />
      {isCreateOpen && <CreateTripSheet onClose={() => setIsCreateOpen(false)} />}
    </>
  );
}

export default HomePage;
