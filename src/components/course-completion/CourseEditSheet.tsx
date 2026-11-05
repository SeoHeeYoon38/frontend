import dragHandle from "../../assets/course-completion/drag-handle.svg";
import type { CoursePlace } from "../../types/courseCompletion";

interface CourseEditSheetProps {
  places: CoursePlace[];
  onAdd: () => void;
  onClose: () => void;
  onRemove: (id: number) => void;
  onReplace: () => void;
  onSave: () => void;
}

function CourseEditSheet({ places, onAdd, onClose, onRemove, onReplace, onSave }: CourseEditSheetProps) {
  return (
    <div className="course-overlay" role="presentation">
      <section className="course-sheet schedule-edit-sheet" aria-label="일정 편집">
        <div className="course-sheet__handle" />
        <header><h2>일정 편집</h2><button type="button" onClick={onClose} aria-label="닫기">×</button></header>
        <div className="schedule-edit-sheet__days">
          {["1일차 5.18", "2일차 5.19", "3일차 5.20", "4일차 5.21"].map((day, index) => (
            <button className={index === 0 ? "is-active" : ""} type="button" key={day}>{day}</button>
          ))}
        </div>
        <div className="schedule-edit-sheet__caption"><strong>장소 {places.length}곳</strong><span>손잡이를 끌어 순서를 바꿔요</span></div>
        <div className="schedule-edit-sheet__list">
          {places.map((place, index) => (
            <article key={place.id}>
              <img className="schedule-edit-sheet__handle" src={dragHandle} alt="순서 변경" />
              <span className="schedule-edit-sheet__order">{index + 1}</span>
              <div><strong>{place.name}</strong><p>{place.description ?? place.detail}</p></div>
              {place.fixed ? <small>고정</small> : <button type="button" onClick={onReplace}>교체</button>}
              {!place.fixed && <button className="schedule-edit-sheet__remove" type="button" onClick={() => onRemove(place.id)} aria-label={`${place.name} 삭제`}>×</button>}
            </article>
          ))}
        </div>
        <button className="schedule-edit-sheet__add" type="button" onClick={onAdd}>＋ 1일차에 장소 추가</button>
        <button className="course-sheet__primary" type="button" onClick={onSave}>1일차 수정 저장</button>
      </section>
    </div>
  );
}

export default CourseEditSheet;
