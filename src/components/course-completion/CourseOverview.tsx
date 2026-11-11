import aiAvatar from "../../assets/course-completion/ai-avatar.png";
import calendarIcon from "../../assets/course-completion/icon-calendar.svg";
import pinIcon from "../../assets/course-completion/icon-pin.svg";
import trainIcon from "../../assets/course-completion/icon-train.svg";
import type { MockTrip } from "../../types/mockTrip";
import type { CoursePlace } from "../../types/courseCompletion";
import { dateLabel, durationLabel } from "../../utils/trip";
import CourseRouteMap from "./CourseRouteMap";

interface CourseOverviewProps {
  trip: MockTrip;
  places: CoursePlace[];
  activeDay: number;
  onDayChange: (day: number) => void;
  variant?: "default" | "result" | "applied";
}

function CourseOverview({ trip, places, activeDay, onDayChange, variant = "default" }: CourseOverviewProps) {
  const isAdjusted = variant !== "default";
  const summaryTitle = variant === "result" ? "이렇게 바꿔봤어요" : "AI 한줄평";
  const summaryCopy = isAdjusted
    ? "선택한 일차에서 카페를 제외한 샘플 수정안이에요"
    : `${trip.city}에서 선택한 장소를 날짜별로 나눈 샘플 일정이에요`;

  return (
    <>
      <section className={`ai-summary ${variant === "result" ? "ai-summary--result" : ""}`} aria-label="도틀로 AI 일정 구성 설명">
        <img src={aiAvatar} alt="도틀로 AI" />
        <div className="ai-summary__bubble">
          <b>{summaryTitle}</b>
          <p>{summaryCopy}</p>
        </div>
      </section>

      <section className="course-section">
        <h2>일정</h2>
        <div className="course-facts">
          <div className="course-fact">
            <img src={calendarIcon} alt="" />
            <strong>{trip.startDate ? durationLabel(trip.startDate, trip.endDate) : `${trip.days.length - 1}박 ${trip.days.length}일`}</strong>
            <span>여행 기간</span>
          </div>
          <div className="course-fact">
            <img src={pinIcon} alt="" />
            <strong>{trip.days.reduce((total, day, index) => total + (index === activeDay ? places.length : day.places.length), 0)}곳</strong>
            <span>장소</span>
          </div>
          <div className="course-fact">
            <img src={trainIcon} alt="" />
            <strong>{trip.companion} {trip.people}명</strong>
            <span>동행</span>
          </div>
        </div>

        <div className="course-tabs" role="tablist" aria-label="여행 일차">
          {trip.days.map((day, index) => (
            <button
              className={activeDay === index ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeDay === index}
              onClick={() => onDayChange(index)}
              key={index}
            >
              <strong>{index + 1}일차</strong>
              <span>{dateLabel(day.date)}</span>
            </button>
          ))}
        </div>
        <CourseRouteMap places={places} city={trip.city} day={activeDay + 1} />
      </section>
    </>
  );
}

export default CourseOverview;
