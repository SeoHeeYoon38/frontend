import calendarIcon from "../../assets/course-completion/icon-calendar.svg";
import pinIcon from "../../assets/course-completion/icon-pin.svg";
import trainIcon from "../../assets/course-completion/icon-train.svg";

export default function TripSummary({ duration, placeCount, companion, companionLabel = "동행" }: {
  duration: string;
  placeCount: number;
  companion: string;
  companionLabel?: string;
}) {
  return (
    <div className="course-facts" aria-label="여행 요약">
      <div className="course-fact"><img src={calendarIcon} alt="" /><strong>{duration}</strong><span>여행 기간</span></div>
      <div className="course-fact"><img src={pinIcon} alt="" /><strong>{placeCount}곳</strong><span>장소</span></div>
      <div className="course-fact"><img src={trainIcon} alt="" /><strong>{companion}</strong><span>{companionLabel}</span></div>
    </div>
  );
}
