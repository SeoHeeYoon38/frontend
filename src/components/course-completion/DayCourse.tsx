import unplacedArrow from "../../assets/course-completion/unplaced-arrow.svg";
import unplacedInfo from "../../assets/course-completion/unplaced-info.svg";
import type { CoursePlace } from "../../types/courseCompletion";
import PlaceTimeline from "./PlaceTimeline";

interface DayCourseProps {
  places: CoursePlace[];
  onAddPlace: () => void;
  onEditPlace?: () => void;
  onOpenPlace: (id: number) => void;
  onRemovePlace: (id: number) => void;
  onRestorePlace: () => void;
  unplacedCount: number;
  variant?: "default" | "result" | "applied";
}

function DayCourse({
  places,
  onAddPlace,
  onEditPlace,
  onOpenPlace,
  onRemovePlace,
  onRestorePlace,
  unplacedCount,
  variant = "default",
}: DayCourseProps) {
  return (
    <section className="day-course">
      <div className="day-course__header">
        <h2>천천히 즐기는 미식과 야경</h2>
        <p>
          <span>{places.length}곳</span>
          <i />
          <span>{variant === "default" ? "도보 1.1km" : "도보 0.7km"}</span>
        </p>
      </div>
      {unplacedCount > 0 && (
        <button className="unplaced-notice" type="button" onClick={onRestorePlace}>
          <img src={unplacedInfo} alt="" />
          일정에 포함되지 않은 장소 {unplacedCount}
          <img src={unplacedArrow} alt="" />
        </button>
      )}
      <PlaceTimeline places={places} onOpen={onOpenPlace} onRemove={variant === "default" ? onRemovePlace : undefined} />
      <button className="add-place-button" type="button" onClick={onAddPlace}>
        <span aria-hidden="true">＋</span> 장소 추가
      </button>
      {onEditPlace && <button className="course-inline-edit" type="button" onClick={onEditPlace}>일정 직접 편집하기</button>}
    </section>
  );
}

export default DayCourse;
