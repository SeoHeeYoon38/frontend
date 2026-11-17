import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { readHomeTrips, readTripStorageNotice } from "../data/mocks/mockTripService";
import CreateTripSheet from "../components/common/CreateTripSheet";
import HomeIntro from "../components/home/HomeIntro";
import MyTripsSection from "../components/home/MyTripsSection";
import RecommendedCourses from "../components/home/RecommendedCourses";
import { readMockScenario } from "../utils/mockScenario";
import { readProfileSettings } from "../utils/mySettings";
import { getMe } from "../api/auth";
import { isApiEnabled } from "../api/config";
import { getCourses } from "../api/courses";
import { getTripMembers } from "../api/members";
import blueAvatar from "../assets/images/character-blue.webp";
import purpleAvatar from "../assets/images/character-purple.webp";
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
  const nickname = readProfileSettings(window.localStorage).nickname;
  const [accountName, setAccountName] = useState<string>();
  const [accountError, setAccountError] = useState("");
  const [tripAvatars, setTripAvatars] = useState<{ tripId: string; images: string[] }>();
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
  const featuredTripId = myTrips.enabled ? nextTrip?.id : undefined;
  useEffect(() => {
    if (!featuredTripId) return;
    const controller = new AbortController();
    const { signal } = controller;
    void getTripMembers(Number(featuredTripId), signal).then(
      (members) => {
        if (signal.aborted) return;
        setTripAvatars({
          tripId: featuredTripId,
          images: members.map((member) =>
            member.profileImageUrl?.trim() || (member.characterId === 2 ? purpleAvatar : blueAvatar),
          ),
        });
      },
      () => {
        if (!signal.aborted) setTripAvatars({ tripId: featuredTripId, images: [] });
      },
    );
    return () => controller.abort();
  }, [featuredTripId]);
  const featuredTrip = nextTrip && tripAvatars?.tripId === nextTrip.id
    ? { ...nextTrip, memberAvatars: tripAvatars.images }
    : nextTrip;
  const tripPath = myTrips.enabled ? (id: string) => serverTripPlanPath("home", id) : undefined;

  return (
    <>
      {!myTrips.enabled && storageNotice && <p role="alert">{storageNotice}</p>}
      {accountError && <p role="alert">{accountError}</p>}
      <HomeIntro
        name={myTrips.enabled ? accountName ?? "" : nickname}
        trip={featuredTrip}
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
      {isCreateOpen && <CreateTripSheet onClose={() => setIsCreateOpen(false)} />}
    </>
  );
}

export default HomePage;
