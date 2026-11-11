import { useState } from "react";
import { useNavigate } from "react-router";
import airplaneIcon from "../assets/icons/transport-airplane.svg";
import courseIcon from "../assets/icons/my-route.svg";
import backIcon from "../assets/icons/nav-back.svg";
import profileIcon from "../assets/icons/nav-profile.svg";
import locationIcon from "../assets/course-settings/pin.svg";
import character from "../assets/images/character-blue.webp";
import { routes } from "../config/routes";
import {
  GOOGLE_MAPS_STORAGE_KEY,
  NOTIFICATION_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
} from "../utils/mySettings";
import * as S from "./WithdrawalPage.styled";

type Step = "notice" | "reason" | "done";

const lostItems = [
  { icon: locationIcon, title: "저장한 장소 56곳", detail: "Google Maps에서 불러온 장소 포함" },
  { icon: courseIcon, title: "저장한 코스 6개", detail: "직접 만든 코스와 담은 코스" },
  { icon: airplaneIcon, title: "여행 일정 4개", detail: "함께하는 여행에서는 자동으로 나가요" },
  { icon: profileIcon, title: "프로필과 활동 기록", detail: "닉네임, 남긴 의견과 댓글" },
];

const reasons = [
  "여행 계획을 다 세웠어요",
  "원하는 장소나 코스가 부족해요",
  "사용하기 어려워요",
  "다른 앱을 쓰고 있어요",
  "기타",
];

function WithdrawalPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("notice");
  const [agreed, setAgreed] = useState(false);
  const [reason, setReason] = useState("기타");
  const [detail, setDetail] = useState("여행 끝나고 나니 쓸 일이 없어졌어요");
  const [showFinalDialog, setShowFinalDialog] = useState(false);

  const back = () => {
    if (step === "reason") setStep("notice");
    else navigate(routes.accountSettings);
  };

  const completeWithdrawal = () => {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    window.localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    window.localStorage.removeItem(GOOGLE_MAPS_STORAGE_KEY);
    setShowFinalDialog(false);
    setStep("done");
  };

  if (step === "done") {
    return (
      <S.Page>
        <S.Done>
          <S.DoneAvatar><img src={character} alt="" /></S.DoneAvatar>
          <h1>탈퇴가 완료됐어요</h1>
          <p>그동안 도틀로와 함께해 주셔서 고마워요<br />다음 여행에서 다시 만나요</p>
        </S.Done>
        <S.Cta><button type="button" onClick={() => navigate(routes.home)}>처음으로</button><S.HomeIndicator /></S.Cta>
      </S.Page>
    );
  }

  return (
    <S.Page>
      <S.Header>
        <button type="button" aria-label="이전 화면" onClick={back}><img src={backIcon} alt="" /></button>
        <h1>회원 탈퇴</h1>
      </S.Header>

      {step === "notice" ? (
        <S.NoticeBody>
          <h2>탈퇴하기 전에<br />꼭 확인해 주세요</h2>
          <p>탈퇴하면 아래 정보가 모두 지워지고 되돌릴 수 없어요</p>
          <S.LostList>
            {lostItems.map((item) => (
              <li key={item.title}>
                <span><img src={item.icon} alt="" /></span>
                <div><strong>{item.title}</strong><small>{item.detail}</small></div>
              </li>
            ))}
          </S.LostList>
          <S.Footnote>삭제한 데모 프로필 정보는 복구할 수 없어요</S.Footnote>
          <S.Agree>
            <button type="button" role="checkbox" aria-checked={agreed} onClick={() => setAgreed((value) => !value)}>{agreed && "✓"}</button>
            <span>안내 내용을 모두 확인했고, 탈퇴에 동의해요</span>
          </S.Agree>
        </S.NoticeBody>
      ) : (
        <S.ReasonBody>
          <h2>떠나시는 이유를<br />알려주실 수 있나요?</h2>
          <p>더 나은 도틀로를 만드는 데 참고할게요 (선택)</p>
          <S.Reasons>
            {reasons.map((item) => (
              <label key={item}>
                <input type="radio" name="reason" checked={reason === item} onChange={() => setReason(item)} />
                <span />{item}
              </label>
            ))}
          </S.Reasons>
          {reason === "기타" && (
            <S.Textarea>
              <textarea value={detail} maxLength={200} onChange={(event) => setDetail(event.target.value)} />
              <span>{detail.length}/200</span>
            </S.Textarea>
          )}
        </S.ReasonBody>
      )}

      <S.Cta>
        <button
          type="button"
          disabled={step === "notice" && !agreed}
          onClick={() => step === "notice" ? setStep("reason") : setShowFinalDialog(true)}
        >다음</button>
        <S.HomeIndicator />
      </S.Cta>

      {showFinalDialog && (
        <S.Overlay>
          <S.Dialog role="alertdialog" aria-modal="true">
            <strong>정말 탈퇴할까요?</strong>
            <p>저장한 장소와 코스, 여행 일정이<br />모두 지워지고 되돌릴 수 없어요</p>
            <div>
              <button type="button" onClick={() => setShowFinalDialog(false)}>취소</button>
              <button type="button" data-danger onClick={completeWithdrawal}>탈퇴하기</button>
            </div>
          </S.Dialog>
        </S.Overlay>
      )}
    </S.Page>
  );
}

export default WithdrawalPage;
