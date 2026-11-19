import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PlacePhoto } from "../../api/placePhotos";
import closeIcon from "../../assets/icons/action-close.svg";
import "./CoursePhotoViewer.css";

interface CoursePhotoViewerProps {
  src: string;
  title: string;
  authors?: PlacePhoto["attributions"];
  mapsUri?: string;
}

export default function CoursePhotoViewer({ src, title, authors = [], mapsUri }: CoursePhotoViewerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  return <>
    <button className="course-photo-open" type="button" aria-label="코스 사진 크게 보기" aria-haspopup="dialog"
      onClick={() => { setOpen(true); dialog.current?.showModal(); }} />
    {createPortal(<dialog className="course-photo-viewer" ref={dialog} aria-label="코스 사진 크게 보기"
      onClose={() => { setOpen(false); setZoomed(false); }}>
      {open && <>
        <div className="course-photo-viewer__scroll">
          <button type="button" className="course-photo-viewer__image" aria-label={zoomed ? "사진 축소" : "사진 확대"}
            aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>
            <img src={src} alt={title} />
          </button>
        </div>
        {(authors.length > 0 || mapsUri) && <div className="course-photo-viewer__credits">
          {authors.map(({ name, uri, photoUri }, index) => {
            const byline = <>{photoUri && <img src={photoUri} alt="" />}{name}</>;
            return uri ? <a key={index} href={uri} target="_blank" rel="noreferrer">{byline}</a>
              : <span key={index}>{byline}</span>;
          })}
          {mapsUri && <a href={mapsUri} target="_blank" rel="noreferrer">Google 지도에서 사진 보기</a>}
        </div>}
      </>}
      <button type="button" className="course-photo-viewer__close" aria-label="닫기" onClick={() => dialog.current?.close()}>
        <img src={closeIcon} alt="" />
      </button>
    </dialog>, document.body)}
  </>;
}
