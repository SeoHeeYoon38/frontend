import { useEffect, useRef, useState } from "react";
import { isApiEnabled } from "../../api/config";
import { getCourse } from "../../api/courses";
import emptyPin from "../../assets/direct-trip/empty-pin.svg";
import { PlaceThumbnail } from "./PlacePhoto";
import "./CourseCardPhoto.css";

interface CourseCardPhotoProps {
  id: string;
  coverUrl: string;
  title: string;
  backdrop?: boolean;
}

function CardPhoto({ id, coverUrl, title, backdrop }: CourseCardPhotoProps) {
  const preview = useRef<HTMLSpanElement>(null);
  const [brokenCover, setBrokenCover] = useState(false);
  const [firstPlaceId, setFirstPlaceId] = useState<string>();
  const courseId = Number(id);
  const hasCover = Boolean(coverUrl && !brokenCover);

  useEffect(() => {
    const element = preview.current;
    if (hasCover || !element || !isApiEnabled() || !Number.isSafeInteger(courseId) || courseId <= 0
      || typeof IntersectionObserver === "undefined") return;
    const controller = new AbortController();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void getCourse(courseId, controller.signal).then(({ days }) => {
        if (!controller.signal.aborted) setFirstPlaceId(days.find((day) => day.stops.length)?.stops[0].placeId);
      }, () => { /* Keep the placeholder when the course detail is unavailable. */ });
    });
    observer.observe(element);
    return () => { observer.disconnect(); controller.abort(); };
  }, [courseId, hasCover]);

  const placeholder = <img className="course-card-photo__pin" src={emptyPin} alt="" />;
  return <span ref={preview} className={backdrop ? "course-card-photo course-card-photo--backdrop" : "course-card-photo"}>
    {hasCover ? <img className="course-card-photo__cover" src={coverUrl} alt="" loading="lazy" decoding="async" onError={() => setBrokenCover(true)} />
      : firstPlaceId ? <PlaceThumbnail courseId={courseId} placeId={firstPlaceId} name={title} placeholder={placeholder} />
      : placeholder}
  </span>;
}

export default function CourseCardPhoto(props: CourseCardPhotoProps) {
  return <CardPhoto key={JSON.stringify([props.id, props.coverUrl])} {...props} />;
}
