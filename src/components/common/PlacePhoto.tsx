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

export function PlaceGallery({ images, ...props }: PhotoSource & { images?: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [photoCount, setCount] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = images?.length ?? photoCount;
  const visibleDots = Math.min(5, count);
  const firstDot = Math.min(Math.max(index - 2, 0), count - visibleDots);
  return (
    <div className="place-gallery"
      onTouchStart={({ touches }) => {
        touchStart.current = touches.length === 1 ? { x: touches[0].clientX, y: touches[0].clientY } : null;
      }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={({ changedTouches }) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || count < 2 || !changedTouches.length) return;
        const dx = changedTouches[0].clientX - start.x;
        const dy = changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          setIndex(current => Math.max(0, Math.min(count - 1, current + (dx < 0 ? 1 : -1))));
        }
      }}>
      {images ? <span className="place-photo"><img src={images[index]} alt={props.name} /></span> :
        <Photo key={index} {...props} index={index} onCount={setCount} />}
      {count > 1 && (
        <>
          <span className="place-gallery__count" aria-live="polite">{index + 1} / {count}</span>
          <div className="place-gallery__navigation">
            <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="이전 사진"><img className="place-gallery__previous" src={chevronIcon} alt="" /></button>
            <button type="button" disabled={index >= count - 1} onClick={() => setIndex(index + 1)} aria-label="다음 사진"><img src={chevronIcon} alt="" /></button>
          </div>
          <div className="place-gallery__dots" aria-label="장소 사진">
            {Array.from({ length: visibleDots }, (_, offset) => firstDot + offset).map((page) => (
              <button key={page} type="button" aria-label={`${page + 1}번째 사진 보기`} aria-current={page === index ? "true" : undefined}
                onClick={() => setIndex(page)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
