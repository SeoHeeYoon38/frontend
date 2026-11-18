import { useEffect, useRef, useState, type ReactNode } from "react";
import { getPlacePhoto, type PlacePhoto } from "../../api/placePhotos";
import chevronIcon from "../../assets/icons/nav-chevron-right.svg";
import "./PlacePhoto.css";

interface PhotoSource {
  placeId: string;
  courseId?: number;
  name: string;
}

function Photo({ placeId, courseId, name, index = 0, thumbnail = false, onCount, placeholder }: PhotoSource & {
  index?: number;
  thumbnail?: boolean;
  onCount?: (count: number) => void;
  placeholder?: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [result, setResult] = useState<PlacePhoto | null>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () => {
      void getPlacePhoto(placeId, index, courseId).then((photo) => {
        if (!active) return;
        setResult(photo);
        if (index === 0 && photo) onCount?.(Math.min(10, photo.totalCount));
      }, () => {
        if (active) setFailed(true);
      });
    };
    let observer: IntersectionObserver | undefined;
    if (thumbnail && ref.current && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer?.disconnect();
        load();
      });
      observer.observe(ref.current);
    } else {
      load();
    }
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [placeId, index, courseId, thumbnail, onCount]);

  return (
    <span ref={ref} className={`place-photo${thumbnail ? " place-photo--thumbnail" : ""}`}>
      {result && !failed ? (
        <>
          <img src={result.photoUrl} alt={thumbnail ? "" : name} onError={() => setFailed(true)} />
          {result.attributions.length > 0 && (
            <span className="place-photo__credit">{result.attributions.map(({ name }) => name).join(", ")}</span>
          )}
        </>
      ) : (
        <span className="place-photo__placeholder">
          {placeholder ?? (failed ? "사진 조회 실패" : result === null ? "사진 없음" : thumbnail ? "" : "사진을 불러오고 있어요")}
        </span>
      )}
    </span>
  );
}

export function PlaceThumbnail(props: PhotoSource & { placeholder?: ReactNode }) {
  return <Photo key={JSON.stringify([props.courseId, props.placeId])} {...props} thumbnail />;
}

export function PlaceGallery(props: PhotoSource) {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  return (
    <div className="place-gallery">
      <Photo key={index} {...props} index={index} onCount={setCount} />
      {count > 1 && (
        <div className="place-gallery__navigation">
          <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="이전 사진"><img className="place-gallery__previous" src={chevronIcon} alt="" /></button>
          <span>{index + 1} / {count}</span>
          <button type="button" disabled={index >= count - 1} onClick={() => setIndex(index + 1)} aria-label="다음 사진"><img src={chevronIcon} alt="" /></button>
        </div>
      )}
    </div>
  );
}
