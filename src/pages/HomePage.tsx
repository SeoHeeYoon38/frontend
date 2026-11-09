import { useState } from "react";
import { mockHomeData } from "../data/mocks/homeData";
import CreateTripSheet from "../components/common/CreateTripSheet";
import HomeIntro from "../components/home/HomeIntro";
import MyTripsSection from "../components/home/MyTripsSection";
import RecommendedCourses from "../components/home/RecommendedCourses";
import SharedTripsSection from "../components/home/SharedTripsSection";

function HomePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const data = mockHomeData;

  return (
    <>
      <HomeIntro name={data.userName} trip={data.nextTrip} />
      <MyTripsSection trips={data.trips} onCreateTrip={() => setIsCreateOpen(true)} />
      <RecommendedCourses courses={data.courses} />
      <SharedTripsSection trips={data.sharedTrips} />
      {isCreateOpen && <CreateTripSheet onClose={() => setIsCreateOpen(false)} />}
    </>
  );
}

export default HomePage;
