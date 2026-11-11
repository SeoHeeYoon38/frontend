import backIcon from "../../assets/course-completion/back.svg";
import settingsIcon from "../../assets/course-completion/settings.svg";
import type { MockTrip } from "../../types/mockTrip";
import { formatTripDateRange } from "../../utils/importedTrip";

interface CourseHeroProps {
  trip: MockTrip;
  onOpenSettings: () => void;
  onBack?: () => void;
  variant?: "default" | "ai";
}

function CourseHero({ trip, onOpenSettings, onBack, variant = "default" }: CourseHeroProps) {
  return (
    <header className={`course-hero ${variant === "ai" ? "course-hero--ai" : ""}`}>
      <img
        className="course-hero__photo"
        src={trip.coverImage}
        alt={`${trip.city} 여행`}
      />
      <div className="course-hero__scrim" />
      <nav className="course-navigation" aria-label="코스 화면 탐색">
        <button type="button" aria-label="뒤로 가기" onClick={onBack}>
          <img src={backIcon} alt="" />
        </button>
        <strong>{trip.source === "direct" ? "직접 만든 여행" : "내 여행 코스"}</strong>
        <button type="button" aria-label="설정 열기" onClick={onOpenSettings}>
          <img src={settingsIcon} alt="" />
        </button>
      </nav>
      <div className="course-hero__title">
        <span>{trip.city}</span>
        <h1>{trip.title}</h1>
        <p>{formatTripDateRange(trip.startDate, trip.endDate)}</p>
      </div>
    </header>
  );
}

export default CourseHero;
