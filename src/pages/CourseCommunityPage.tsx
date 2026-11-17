import { useLocation, useNavigate } from "react-router";
import CourseCommunityChat from "../components/course-community/CourseCommunityChat";
import ServerCourseCommunityChat from "../components/course-community/ServerCourseCommunityChat";
import "../components/course-community/CourseCommunity.css";
import { readPlanDay, readPlanOrigin, serverTripPlanPath, settingsBackPath, tripPlanPath } from "../utils/navigation";
import { readMockTrip, saveMockTrip, placeIcon } from "../data/mocks/mockTripService";
import type { CommunityPollOption } from "../types/courseCommunity";
import osakaCastlePhoto from "../assets/images/place-osaka-castle.webp";

function CourseCommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = settingsBackPath(location.search);
  const params = new URLSearchParams(location.search);
  const courseId = params.get("course");
  const returnTripId = params.get("returnTripId");
  const viewCoursePath = (day: number) => returnTripId && /^\d+$/.test(returnTripId)
    ? serverTripPlanPath(readPlanOrigin(location.search), returnTripId, day)
    : tripPlanPath(readPlanOrigin(location.search), courseId ?? undefined, day);

  const applyMockPlace = (day: number, option: CommunityPollOption) => {
    if (!courseId) return;
    const trip = readMockTrip(courseId);
    if (!trip || !trip.days[day - 1]) return;
    const existing = trip.days[day - 1].places;
    if (existing.some((place) => place.name === option.title)) return;
    const nextId = Math.max(0, ...trip.days.flatMap((item) => item.places.map((place) => place.id))) + 1;
    const category = option.detail.split(",")[0];
    saveMockTrip({
      ...trip,
      days: trip.days.map((item, index) => index === day - 1 ? {
        ...item,
        places: [...item.places, {
          id: nextId,
          name: option.title,
          category,
          detail: option.detail,
          image: osakaCastlePhoto,
          icon: placeIcon(category),
        }],
      } : item),
    });
  };

  if (returnTripId && /^\d+$/.test(returnTripId)) return (
    <div className="course-community-shell">
      <ServerCourseCommunityChat tripId={Number(returnTripId)} initialDay={readPlanDay(location.search)}
        onBack={() => navigate(backPath)} onViewCourse={(day) => navigate(viewCoursePath(day))} />
    </div>
  );

  return (
    <div className="course-community-shell">
      <CourseCommunityChat
        onBack={() => navigate(backPath)}
        onViewCourse={(day) => navigate(viewCoursePath(day))}
        onApplyToCourse={courseId ? applyMockPlace : undefined}
      />
    </div>
  );
}

export default CourseCommunityPage;
