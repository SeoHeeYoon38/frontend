import routeLine1 from "../../assets/course-completion/route-line-1.svg";
import routeLine2 from "../../assets/course-completion/route-line-2.svg";
import routeLine3 from "../../assets/course-completion/route-line-3.svg";
import routeLine4 from "../../assets/course-completion/route-line-4.svg";
import routeLine5 from "../../assets/course-completion/route-line-5.svg";
import routeMap from "../../assets/course-completion/route-map.png";
import { courseMapPins } from "../../data/mocks/courseCompletionData";

const routeLines = [
  routeLine1,
  routeLine2,
  routeLine3,
  routeLine4,
  routeLine5,
];

function CourseRouteMap() {
  return (
    <div className="course-map" aria-label="1일차 이동 경로 지도">
      <img
        className="course-map__base"
        src={routeMap}
        alt="오사카 여행 경로 지도"
      />
      {routeLines.map((line, index) => (
        <img
          className={`course-map__line course-map__line--${index + 1}`}
          src={line}
          alt=""
          key={line}
        />
      ))}
      {courseMapPins.map((pin) => (
        <span
          className="course-map__pin"
          style={{ left: pin.left, top: pin.top }}
          key={pin.number}
        >
          {pin.number}
        </span>
      ))}
    </div>
  );
}

export default CourseRouteMap;
