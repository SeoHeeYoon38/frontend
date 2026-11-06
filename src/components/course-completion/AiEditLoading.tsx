import glow from "../../assets/course-completion/ai-loading-glow.svg";
import glowInner from "../../assets/course-completion/ai-loading-glow-inner.svg";
import dotDone from "../../assets/course-completion/ai-loading-done.svg";
import dotDoneSecondary from "../../assets/course-completion/ai-loading-done-secondary.svg";
import dotNow from "../../assets/course-completion/ai-loading-now.svg";
import pathDots from "../../assets/course-completion/ai-loading-path.svg";
import dotWait from "../../assets/course-completion/ai-loading-wait.svg";
import dotloLogo from "../../assets/course-completion/ai-loading-symbol.png";
import backIcon from "../../assets/course-completion/place-detail-back.svg";
import statusIcons from "../../assets/course-completion/status-icons.svg";

interface AiEditLoadingProps { onBack: () => void; }

function AiEditLoading({ onBack }: AiEditLoadingProps) {
  const steps = [
    [dotDone, "기존 일정 분석하기", "is-done"],
    [dotDoneSecondary, "빼도 되는 장소 고르기", "is-done"],
    [dotNow, "이동 동선 다시 맞추기", "is-current"],
    [dotWait, "새 일정 정리하기", "is-waiting"],
  ] as const;

  return (
    <main className="ai-loading">
      <div className="ai-loading__statusbar" aria-hidden="true"><span>9:41</span><img src={statusIcons} alt="" /></div>
      <button className="ai-loading__back" type="button" onClick={onBack} aria-label="수정 요청으로 돌아가기"><img src={backIcon} alt="" /></button>
      <div className="ai-loading__visual" aria-hidden="true">
        <img className="ai-loading__glow ai-loading__glow--one" src={glow} alt="" />
        <img className="ai-loading__glow ai-loading__glow--two" src={glowInner} alt="" />
        <div className="ai-loading__symbol"><img src={dotloLogo} alt="" /></div>
      </div>
      <h1>1일차 일정을<br />여유롭게 고치고 있어요</h1>
      <p>10초 정도 걸려요</p>
      <ol className="ai-loading__steps">
        {steps.map(([icon, label, status]) => (
          <li className={status} key={label}>
            <img src={icon} alt="" />
            <span>{label}</span>
            {status === "is-current" && <img className="ai-loading__path-dots" src={pathDots} alt="" />}
          </li>
        ))}
      </ol>
    </main>
  );
}

export default AiEditLoading;
