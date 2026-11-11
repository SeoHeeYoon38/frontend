import { useState } from "react";
import { useLocation } from "react-router";
import { readHomeTrips, readTripStorageNotice } from "../data/mocks/mockTripService";
import CreateTripSheet from "../components/common/CreateTripSheet";
import HomeIntro from "../components/home/HomeIntro";
import MyTripsSection from "../components/home/MyTripsSection";
import RecommendedCourses from "../components/home/RecommendedCourses";
import SharedTripsSection from "../components/home/SharedTripsSection";
import { readMockScenario } from "../utils/mockScenario";
import { parseProfileSettings, PROFILE_STORAGE_KEY } from "../utils/mySettings";

function HomePage() {
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const data = readHomeTrips();
  const [nickname] = useState(() => {
    try {
      return parseProfileSettings(localStorage.getItem(PROFILE_STORAGE_KEY))?.nickname;
    } catch {
      return undefined;
    }
  });
  const storageNotice = readTripStorageNotice();
  const showEmptyTrips = readMockScenario(location.search) === "home-empty";
  const trips = showEmptyTrips ? [] : data.trips;

  return (
    <>
      {storageNotice && <p role="alert">{storageNotice}</p>}
      <HomeIntro name={nickname ?? data.userName} trip={showEmptyTrips ? null : data.nextTrip} />
      <MyTripsSection trips={trips} onCreateTrip={() => setIsCreateOpen(true)} />
      <RecommendedCourses courses={data.courses} />
      <SharedTripsSection trips={data.sharedTrips} />
      {isCreateOpen && <CreateTripSheet onClose={() => setIsCreateOpen(false)} />}
    </>
  );
}

export default HomePage;
