import aiAvatar from "../../assets/course-completion/ai-avatar.png";
import calendarIcon from "../../assets/course-completion/icon-calendar.svg";
import pinIcon from "../../assets/course-completion/icon-pin.svg";
import trainIcon from "../../assets/course-completion/icon-train.svg";
import { courseDays } from "../../data/mocks/courseCompletionData";
import CourseRouteMap from "./CourseRouteMap";

interface CourseOverviewProps {
  activeDay: number;
  onDayChange: (day: number) => void;
}

function CourseOverview({ activeDay, onDayChange }: CourseOverviewProps) {
  return (
    <>
      <section className="ai-summary" aria-label="도틀로 AI 일정 구성 설명">
        <img src={aiAvatar} alt="도틀로 AI" />
        <div className="ai-summary__bubble">
          <b>도틀로 AI의 일정 구성</b>
          <p>
            부모님과 함께하는 여행을 고려해
            <br />덜 걷고 여유롭게 구성했어요
          </p>
        </div>
      </section>

      <section className="course-section">
        <h2>일정</h2>
        <div className="course-facts">
          <div className="course-fact">
            <img src={calendarIcon} alt="" />
            <strong>2박 3일</strong>
            <span>여행 기간</span>
          </div>
          <div className="course-fact">
            <img src={pinIcon} alt="" />
            <strong>12곳</strong>
            <span>장소</span>
          </div>
          <div className="course-fact">
            <img src={trainIcon} alt="" />
            <strong>도보와 버스</strong>
            <span>이동 방법</span>
          </div>
        </div>

        <div className="course-tabs" role="tablist" aria-label="여행 일차">
          {courseDays.map((day, index) => (
            <button
              className={activeDay === index ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeDay === index}
              onClick={() => onDayChange(index)}
              key={day.label}
            >
              <strong>{day.label}</strong>
              <span>{day.date}</span>
            </button>
          ))}
        </div>
        <CourseRouteMap />
      </section>
    </>
  );
}

export default CourseOverview;
