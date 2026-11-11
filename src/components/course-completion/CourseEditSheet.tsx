import { useRef } from "react";
import dragHandle from "../../assets/course-completion/drag-handle.svg";
import type { CoursePlace } from "../../types/courseCompletion";
import type { MockTripDay } from "../../types/mockTrip";
import { dateLabel } from "../../utils/trip";

interface CourseEditSheetProps {
  days: MockTripDay[];
  activeDay: number;
  places: CoursePlace[];
  onDayChange: (day: number) => void;
  onReorder: (fromId: number, toId: number) => void;
  onAdd: () => void;
  onClose: () => void;
  onRemove: (id: number) => void;
  onReplace: (id: number) => void;
  onSave: () => void;
}

function CourseEditSheet({ days, activeDay, places, onDayChange, onReorder, onAdd, onClose, onRemove, onReplace, onSave }: CourseEditSheetProps) {
  const draggedId = useRef<number | null>(null);

  return (
    <div className="course-overlay" role="presentation">
      <section className="course-sheet schedule-edit-sheet" aria-label="일정 편집">
        <div className="course-sheet__handle" />
        <header><h2>일정 편집</h2><button type="button" onClick={onClose} aria-label="닫기">×</button></header>
        <div className="schedule-edit-sheet__days">
          {days.map((day, index) => (
            <button className={index === activeDay ? "is-active" : ""} type="button" key={index} onClick={() => onDayChange(index)}>
              {index + 1}일차 {dateLabel(day.date)}
            </button>
          ))}
        </div>
        <div className="schedule-edit-sheet__caption"><strong>장소 {places.length}곳</strong><span>손잡이를 끌거나 화살표로 순서를 바꿔요</span></div>
        <div className="schedule-edit-sheet__list">
          {places.map((place, index) => (
            <article
              key={place.id}
              data-place-id={place.id}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", String(place.id))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onReorder(Number(event.dataTransfer.getData("text/plain")), place.id);
              }}
            >
              <button
                className="schedule-edit-sheet__drag"
                type="button"
                aria-label={`${place.name} 순서 변경 손잡이`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  draggedId.current = place.id;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (draggedId.current === null) return;
                  const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-place-id]");
                  if (row && Number(row.dataset.placeId) !== draggedId.current)
                    onReorder(draggedId.current, Number(row.dataset.placeId));
                }}
                onPointerUp={() => { draggedId.current = null; }}
                onPointerCancel={() => { draggedId.current = null; }}
                onLostPointerCapture={() => { draggedId.current = null; }}
              ><img className="schedule-edit-sheet__handle" src={dragHandle} alt="" /></button>
              <span className="schedule-edit-sheet__order">{index + 1}</span>
              <div><strong>{place.name}</strong><p>{place.description ?? place.detail}</p></div>
              <span className="schedule-edit-sheet__move">
                <button type="button" disabled={index === 0} aria-label={`${place.name} 위로 이동`} onClick={() => onReorder(place.id, places[index - 1].id)}>↑</button>
                <button type="button" disabled={index === places.length - 1} aria-label={`${place.name} 아래로 이동`} onClick={() => onReorder(place.id, places[index + 1].id)}>↓</button>
              </span>
              {place.fixed ? <small>고정</small> : <button type="button" onClick={() => onReplace(place.id)}>교체</button>}
              {!place.fixed && <button className="schedule-edit-sheet__remove" type="button" onClick={() => onRemove(place.id)} aria-label={`${place.name} 삭제`}>×</button>}
            </article>
          ))}
        </div>
        <button className="schedule-edit-sheet__add" type="button" onClick={onAdd}>＋ {activeDay + 1}일차에 장소 추가</button>
        <button className="course-sheet__primary" type="button" onClick={onSave}>{activeDay + 1}일차 수정 저장</button>
      </section>
    </div>
  );
}

export default CourseEditSheet;
