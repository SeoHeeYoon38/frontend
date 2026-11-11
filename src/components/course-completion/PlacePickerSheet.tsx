import addIcon from "../../assets/course-completion/add.svg";
import addSelectedIcon from "../../assets/course-completion/add-selected.svg";
import radioSelected from "../../assets/course-completion/radio-selected.svg";
import searchIcon from "../../assets/course-completion/search.svg";
import placeCoffee from "../../assets/course-completion/place-coffee.png";
import type { CourseCandidate } from "../../types/courseCompletion";

interface PlacePickerSheetProps {
  candidates: CourseCandidate[];
  day: number;
  mode: "add" | "replace";
  replacementId: number;
  selectedIds: number[];
  onClose: () => void;
  onConfirm: () => void;
  onSelectReplacement: (id: number) => void;
  onToggle: (id: number) => void;
}

function PlacePickerSheet({ candidates, day, mode, replacementId, selectedIds, onClose, onConfirm, onSelectReplacement, onToggle }: PlacePickerSheetProps) {
  const selectedReplacement = candidates.find((place) => place.id === replacementId);

  return (
    <div className="course-overlay" role="presentation">
      <section className="course-sheet place-picker-sheet" aria-label={mode === "add" ? "장소 추가" : "장소 교체"}>
        <div className="course-sheet__handle" />
        <header><h2>{mode === "add" ? `${day}일차에 장소 추가` : "장소 교체"}</h2><button type="button" onClick={onClose} aria-label="닫기">×</button></header>
        {mode === "add" ? (
          <>
            <label className="place-picker-sheet__search"><img src={searchIcon} alt="" /><input placeholder="장소, 맛집, 숙소 검색" /></label>
            <div className="place-picker-sheet__tabs">{["추천", "저장한 곳", "관광", "맛집", "카페", "쇼핑"].map((tab, index) => <button className={index === 0 ? "is-active" : ""} type="button" key={tab}>{tab}</button>)}</div>
            <p className="place-picker-sheet__caption">지금 동선에서 가까운 순</p>
          </>
        ) : (
          <>
            <p className="place-picker-sheet__label">바꿀 장소</p>
            <div className="place-picker-sheet__current"><img src={placeCoffee} alt="" /><div><strong>리로 커피 로스터스</strong><span>카페, 1일차 오후</span></div></div>
            <div className="place-picker-sheet__filters"><button className="is-active" type="button">비슷한 곳</button><button type="button">더 가까운 곳</button><button type="button">내가 저장</button></div>
            <p className="place-picker-sheet__caption">분위기가 비슷한 카페예요</p>
          </>
        )}
        <div className="place-picker-sheet__list">
          {candidates.map((candidate) => {
            const isSelected = mode === "add" ? selectedIds.includes(candidate.id) : replacementId === candidate.id;
            return (
              <button className={isSelected ? "is-selected" : ""} type="button" onClick={() => mode === "add" ? onToggle(candidate.id) : onSelectReplacement(candidate.id)} key={candidate.id}>
                <img className="place-picker-sheet__thumb" src={candidate.image} alt="" />
                <span><strong>{candidate.name}</strong><small>{candidate.category}<i />{candidate.distance}</small></span>
                {mode === "add" ? <img className="place-picker-sheet__choice" src={isSelected ? addSelectedIcon : addIcon} alt="" /> : isSelected ? <img className="place-picker-sheet__choice" src={radioSelected} alt="" /> : <i className="place-picker-sheet__radio" />}
              </button>
            );
          })}
        </div>
        <button className="course-sheet__primary" type="button" onClick={onConfirm} disabled={mode === "add" ? !selectedIds.length : !selectedReplacement}>{mode === "add" ? `${selectedIds.length}곳을 ${day}일차에 추가` : `${selectedReplacement?.name ?? "장소 선택"}로 교체`}</button>
      </section>
    </div>
  );
}

export default PlacePickerSheet;
