import { useEffect, useRef, useState } from "react";
import { isApiEnabled } from "../../api/config";
import { firstCoursePlaceId } from "../../api/adapters";
import { getCourse } from "../../api/courses";
import emptyPin from "../../assets/direct-trip/empty-pin.svg";
import { PlaceThumbnail } from "./PlacePhoto";
import "./CourseCardPhoto.css";

interface CourseCardPhotoProps {
  id: string;
  coverUrl: string;
  title: string;
  firstPlaceId?: string | null;
  backdrop?: boolean;
}

function CardPhoto({ id, coverUrl, title, backdrop, firstPlaceId }: CourseCardPhotoProps) {
  const preview = useRef<HTMLSpanElement>(null);
  const [brokenCover, setBrokenCover] = useState(false);
  const [fetchedPlaceId, setFetchedPlaceId] = useState<string | null>(null);
  const placeId = firstPlaceId === undefined ? fetchedPlaceId : firstPlaceId;
  const courseId = Number(id);
  const hasCover = Boolean(coverUrl && !brokenCover);

  useEffect(() => {
    const element = preview.current;
    if (firstPlaceId !== undefined || hasCover || !element || !isApiEnabled() || !Number.isSafeInteger(courseId) || courseId <= 0
      || typeof IntersectionObserver === "undefined") return;
    const controller = new AbortController();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void getCourse(courseId, controller.signal).then((course) => {
        if (!controller.signal.aborted) setFetchedPlaceId(firstCoursePlaceId(course));
      }, () => { /* Keep the placeholder when the course detail is unavailable. */ });
    });
    observer.observe(element);
    return () => { observer.disconnect(); controller.abort(); };
  }, [courseId, firstPlaceId, hasCover]);

  const placeholder = <img className="course-card-photo__pin" src={emptyPin} alt="" />;
  return <span ref={preview} className={backdrop ? "course-card-photo course-card-photo--backdrop" : "course-card-photo"}>
    {hasCover ? <img className="course-card-photo__cover" src={coverUrl} alt="" loading="lazy" decoding="async" onError={() => setBrokenCover(true)} />
      : placeId ? <PlaceThumbnail courseId={courseId} placeId={placeId} name={title} placeholder={placeholder} />
      : placeholder}
  </span>;
}

export default function CourseCardPhoto(props: CourseCardPhotoProps) {
  return <CardPhoto key={JSON.stringify([props.id, props.coverUrl])} {...props} />;
}
