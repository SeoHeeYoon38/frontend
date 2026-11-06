import dragHandleIcon from "../../assets/course-completion/drag-handle.svg";
import removeIcon from "../../assets/course-completion/remove.svg";
import triangleIcon from "../../assets/course-completion/triangle-down.svg";
import type { CoursePlace } from "../../types/courseCompletion";

interface PlaceTimelineProps {
  places: CoursePlace[];
  onOpen: (id: number) => void;
  onRemove?: (id: number) => void;
}

function PlaceTimeline({ places, onOpen, onRemove }: PlaceTimelineProps) {
  return (
    <div className="place-timeline">
      {places.map((place, index) => (
        <div className="place-stop" key={place.id}>
          <div className="place-stop__rail" aria-hidden="true">
            <span className="place-stop__rail-before" />
            <span className="place-stop__order">{index + 1}</span>
            <span
              className={`place-stop__rail-after ${
                index === places.length - 1 ? "is-last" : ""
              }`}
            />
          </div>
          <div className="place-stop__content">
            <article
              className="place-card"
              role="button"
              tabIndex={0}
              onClick={() => onOpen(place.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onOpen(place.id);
              }}
            >
              <img
                className="place-card__handle"
                src={dragHandleIcon}
                alt="순서 변경"
              />
              <img className="place-card__thumbnail" src={place.image} alt="" />
              <div className="place-card__copy">
                {place.changeLabel && <span className="place-card__change">{place.changeLabel}</span>}
                <strong>{place.name}</strong>
                <div className="place-card__meta">
                  <img src={place.icon} alt="" />
                  <b>{place.category}</b>
                  <span className="place-card__divider" />
                  <span>{place.detail}</span>
                </div>
              </div>
              {onRemove && (
                <button
                  className="place-card__remove"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(place.id);
                  }}
                  aria-label={`${place.name} 삭제`}
                >
                  <img src={removeIcon} alt="" />
                </button>
              )}
            </article>
            {place.travel && (
              <div className="place-move">
                <span
                  className={`place-move__pill place-move__pill--${place.travelTone}`}
                >
                  {place.travel}
                  <img src={triangleIcon} alt="" />
                </span>
                <span>{place.distance}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlaceTimeline;
