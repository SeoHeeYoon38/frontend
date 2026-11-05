import aiAvatar from "../../assets/course-completion/ai-avatar.png";
import calendarIcon from "../../assets/course-completion/icon-calendar.svg";
import pinIcon from "../../assets/course-completion/icon-pin.svg";
import trainIcon from "../../assets/course-completion/icon-train.svg";
import { courseDays } from "../../data/mocks/courseCompletionData";
import CourseRouteMap from "./CourseRouteMap";

interface CourseOverviewProps {
  activeDay: number;
  onDayChange: (day: number) => void;
  variant?: "default" | "result" | "applied";
}

function CourseOverview({ activeDay, onDayChange, variant = "default" }: CourseOverviewProps) {
  const isAdjusted = variant !== "default";
  const summaryTitle = variant === "result" ? "이렇게 바꿔봤어요" : "AI 한줄평";
  const summaryCopy = isAdjusted
    ? "부모님과 덜 걷고 천천히, 첫날은 쉬는 시간을 넉넉히 넣었어요"
    : "부모님과 함께하는 여행을 고려해 덜 걷고 여유롭게 구성했어요";

  return (
    <>
      <section className={`ai-summary ${variant === "result" ? "ai-summary--result" : ""}`} aria-label="도틀로 AI 일정 구성 설명">
        <img src={aiAvatar} alt="도틀로 AI" />
        <div className="ai-summary__bubble">
          <b>{summaryTitle}</b>
          <p>{summaryCopy}</p>
          {variant === "result" && <small>요청: 첫날은 좀 여유롭게, 카페는 빼도 괜찮아요</small>}
        </div>
      </section>

      <section className="course-section">
        <h2>일정</h2>
        <div className="course-facts">
          <div className="course-fact">
            <img src={calendarIcon} alt="" />
            <strong>{isAdjusted ? "11곳" : "2박 3일"}</strong>
            <span>{isAdjusted ? "장소" : "여행 기간"}</span>
          </div>
          <div className="course-fact">
            <img src={pinIcon} alt="" />
            <strong>{isAdjusted ? "하루 3곳" : "12곳"}</strong>
            <span>{isAdjusted ? "더 여유로운 일정" : "장소"}</span>
          </div>
          <div className="course-fact">
            <img src={trainIcon} alt="" />
            <strong>{isAdjusted ? "0.7km" : "도보와 버스"}</strong>
            <span>{isAdjusted ? "1일차 도보" : "이동 방법"}</span>
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
