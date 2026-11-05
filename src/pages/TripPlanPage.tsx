import { useNavigate } from "react-router";
import CourseHero from "../components/course-completion/CourseHero";
import CourseOverview from "../components/course-completion/CourseOverview";
import DayCourse from "../components/course-completion/DayCourse";
import "../components/course-completion/CourseCompletion.css";
import { routes } from "../config/routes";
import useCoursePlan from "../hooks/useCoursePlan";

function TripPlanPage() {
  const navigate = useNavigate();
  const {
    activeDay,
    places,
    notice,
    setActiveDay,
    addPlace,
    removePlace,
    requestAiEdit,
  } = useCoursePlan();

  return (
    <div className="course-page-shell">
      <main className="course-page">
        <CourseHero onOpenSettings={() => navigate(routes.tripSettings)} />

        <div className="course-content">
          <CourseOverview
            activeDay={activeDay}
            onDayChange={setActiveDay}
          />
          <DayCourse
            places={places}
            onAddPlace={addPlace}
            onRemovePlace={removePlace}
          />
        </div>

        <div className="course-cta">
          <button type="button" onClick={requestAiEdit}>
            AI 수정 요청
          </button>
        </div>
        <p className="course-live-region" aria-live="polite">
          {notice}
        </p>
      </main>
    </div>
  );
}

export default TripPlanPage;
