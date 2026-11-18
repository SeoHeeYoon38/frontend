import aiSparkle from "../../assets/course-completion/ai-sparkle.svg";
import closeIcon from "../../assets/icons/action-close.svg";
import SheetHandle from "../common/SheetHandle";

interface AiEditSheetProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  error?: string;
  pending?: boolean;
}

const commonRequests = [
  "더 여유롭게",
  "덜 걷게",
  "맛집 더 넣기",
  "관광지 더 넣기",
  "야경 추가",
  "이동 동선 줄이기",
];

function AiEditSheet({ value, onChange, onClose, onSubmit, error = "", pending = false }: AiEditSheetProps) {
  return (
    <div className="course-overlay" role="presentation">
      <section className="course-sheet ai-edit-sheet" aria-label="AI 일정 수정 요청">
        <SheetHandle className="course-sheet__handle" onClose={onClose} closeDisabled={pending} />
        <button className="course-sheet__close" type="button" disabled={pending} onClick={onClose} aria-label="닫기"><img src={closeIcon} alt="" /></button>
        <div className="ai-edit-sheet__title">
          <img src={aiSparkle} alt="" />
          <div>
            <h2>어떤 걸 수정할까요?</h2>
            <p>원하는 내용을 말하면 AI가 여행 일정을 다시 조정해요</p>
          </div>
        </div>
        <textarea
          value={value}
          maxLength={500}
          disabled={pending}
          onChange={(event) => onChange(event.target.value)}
          aria-label="AI 수정 요청 내용"
          placeholder="첫날은 좀 여유롭게, 카페는 빼도 괜찮아요"
        />
        <h3>자주 하는 요청</h3>
        <div className="ai-edit-sheet__chips">
          {commonRequests.map((request) => {
            const separator = value && !/\s$/.test(value) ? " " : "";
            const nextValue = `${value}${separator}${request}`;

            return (
              <button type="button" disabled={pending || nextValue.length > 500} onClick={() => onChange(nextValue)} key={request}>{request}</button>
            );
          })}
        </div>
        {error && <p className="ai-edit-sheet__error" role="alert">{error}</p>}
        <button className="course-sheet__primary" type="button" onClick={onSubmit} disabled={!value.trim() || pending}>
          {pending ? "수정안을 만들고 있어요" : "수정 요청하기"}
        </button>
      </section>
    </div>
  );
}

export default AiEditSheet;
