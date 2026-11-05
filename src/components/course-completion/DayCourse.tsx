import type { CoursePlace } from "../../types/courseCompletion";
import PlaceTimeline from "./PlaceTimeline";

interface DayCourseProps {
  places: CoursePlace[];
  onAddPlace: () => void;
  onRemovePlace: (id: number) => void;
}

function DayCourse({
  places,
  onAddPlace,
  onRemovePlace,
}: DayCourseProps) {
  return (
    <section className="day-course">
      <div className="day-course__header">
        <h2>천천히 즐기는 미식과 야경</h2>
        <p>
          <span>{places.length}곳</span>
          <i />
          <span>도보 1.1km</span>
        </p>
      </div>
      <PlaceTimeline places={places} onRemove={onRemovePlace} />
      <button className="add-place-button" type="button" onClick={onAddPlace}>
        <span aria-hidden="true">＋</span> 장소 추가
      </button>
    </section>
  );
}

export default DayCourse;
