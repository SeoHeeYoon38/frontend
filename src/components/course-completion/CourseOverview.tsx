import aiAvatar from "../../assets/course-community/ai-avatar.png";
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
  const summaryTitle = variant === "result" ? "이렇게 바꿔봤어요" : "도틀로 AI의 일정 구성";
  const summaryCopy = isAdjusted
    ? "수정 요청을 반영해 동선을 다시 구성했어요"
    : trip.id === "osaka"
      ? "부모님과 함께하는 여행을 고려해 덜 걷고 여유롭게 구성했어요"
      : `${trip.city}에서 선택한 장소를 여행 날짜에 맞춰 구성했어요`;
  const figmaSample = trip.id === "osaka" && trip.source === "sample";

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
            <strong>{figmaSample ? "도보와 버스" : `${trip.companion} ${trip.people}명`}</strong>
            <span>{figmaSample ? "이동 방법" : "동행"}</span>
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
