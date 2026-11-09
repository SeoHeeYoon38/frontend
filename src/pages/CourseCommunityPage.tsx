import { useLocation, useNavigate } from "react-router";
import CourseCommunityChat from "../components/course-community/CourseCommunityChat";
import "../components/course-community/CourseCommunity.css";
import { readPlanOrigin, tripPlanPath } from "../utils/navigation";

function CourseCommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const origin = readPlanOrigin(location.search);

  return (
    <div className="course-community-shell">
      <CourseCommunityChat
        onBack={() => navigate(tripPlanPath(origin))}
        onViewCourse={() => navigate(tripPlanPath(origin))}
      />
    </div>
  );
}

export default CourseCommunityPage;
