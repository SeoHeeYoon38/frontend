import { useState } from "react";
import { useLocation } from "react-router";
import { mockHomeData } from "../data/mocks/homeData";
import CreateTripSheet from "../components/common/CreateTripSheet";
import HomeIntro from "../components/home/HomeIntro";
import MyTripsSection from "../components/home/MyTripsSection";
import RecommendedCourses from "../components/home/RecommendedCourses";
import SharedTripsSection from "../components/home/SharedTripsSection";
import { readMockScenario } from "../utils/mockScenario";

function HomePage() {
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const data = mockHomeData;
  const showEmptyTrips = readMockScenario(location.search) === "home-empty";
  const trips = showEmptyTrips ? [] : data.trips;

  return (
    <>
      <HomeIntro name={data.userName} trip={showEmptyTrips ? null : data.nextTrip} />
      <MyTripsSection trips={trips} onCreateTrip={() => setIsCreateOpen(true)} />
      <RecommendedCourses courses={data.courses} />
      <SharedTripsSection trips={data.sharedTrips} />
      {isCreateOpen && <CreateTripSheet onClose={() => setIsCreateOpen(false)} />}
    </>
  );
}

export default HomePage;
