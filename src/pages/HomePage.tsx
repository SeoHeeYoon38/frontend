import { mockHomeData } from "../data/mocks/homeData";
import HomeIntro from "../components/home/HomeIntro";
import MyTripsSection from "../components/home/MyTripsSection";
import RecommendedCourses from "../components/home/RecommendedCourses";
import SharedTripsSection from "../components/home/SharedTripsSection";

function HomePage() {
  const data = mockHomeData;

  return (
    <>
      <HomeIntro name={data.userName} trip={data.nextTrip} />
      <MyTripsSection trips={data.trips} />
      <RecommendedCourses courses={data.courses} />
      <SharedTripsSection trips={data.sharedTrips} />
    </>
  );
}

export default HomePage;
