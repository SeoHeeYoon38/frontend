import backIcon from "../../assets/course-completion/back.svg";
import heroPhoto from "../../assets/course-completion/hero-photo.png";
import settingsIcon from "../../assets/course-completion/settings.svg";
import aiHeroPhoto from "../../assets/images/cover-osaka-castle.webp";

interface CourseHeroProps {
  onOpenSettings: () => void;
  onBack?: () => void;
  variant?: "default" | "ai";
}

function CourseHero({ onOpenSettings, onBack, variant = "default" }: CourseHeroProps) {
  return (
    <header className={`course-hero ${variant === "ai" ? "course-hero--ai" : ""}`}>
      <img
        className="course-hero__photo"
        src={variant === "ai" ? aiHeroPhoto : heroPhoto}
        alt={variant === "ai" ? "벚꽃이 핀 오사카성" : "오사카 거리 풍경"}
      />
      <div className="course-hero__scrim" />
      <nav className="course-navigation" aria-label="코스 화면 탐색">
        <button type="button" aria-label="뒤로 가기" onClick={onBack}>
          <img src={backIcon} alt="" />
        </button>
        <strong>AI 여행 코스</strong>
        <button type="button" aria-label="설정 열기" onClick={onOpenSettings}>
          <img src={settingsIcon} alt="" />
        </button>
      </nav>
      <div className="course-hero__title">
        <span>오사카</span>
        <h1>오사카 3박 4일</h1>
        <p>2026.05.18 (월) - 05.21 (목)</p>
      </div>
    </header>
  );
}

export default CourseHero;
