import unplacedArrow from "../../assets/course-completion/unplaced-arrow.svg";
import unplacedInfo from "../../assets/course-completion/unplaced-info.svg";
import type { CoursePlace } from "../../types/courseCompletion";
import PlaceTimeline from "./PlaceTimeline";

interface DayCourseProps {
  dayLabel: string;
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
  dayLabel,
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
        <h2>{dayLabel}</h2>
        <p>
          <span>{places.length}곳</span>
          <i />
          <span>샘플 일정</span>
        </p>
      </div>
      {unplacedCount > 0 && (
        <button className="unplaced-notice" type="button" onClick={onRestorePlace}>
          <img src={unplacedInfo} alt="" />
          일정에 포함되지 않은 장소 {unplacedCount}
          <img src={unplacedArrow} alt="" />
        </button>
      )}
      {!places.length && <p>아직 담긴 장소가 없어요. 장소를 추가해 일정을 채워 보세요.</p>}
      <PlaceTimeline places={places} onOpen={onOpenPlace} onRemove={variant === "result" ? undefined : onRemovePlace} />
      <button className="add-place-button" type="button" onClick={onAddPlace}>
        <span aria-hidden="true">＋</span> 장소 추가
      </button>
      {onEditPlace && <button className="course-inline-edit" type="button" onClick={onEditPlace}>일정 직접 편집하기</button>}
    </section>
  );
}

export default DayCourse;
