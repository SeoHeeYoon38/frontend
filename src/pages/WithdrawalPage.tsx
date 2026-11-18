import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { getMyStats, getWithdrawalPreview, withdrawAccount, type WithdrawalPreview } from "../api/auth";
import type { MyStatsResponse } from "../api/types";
import { clearAuthTokens } from "../api/tokenStorage";
import airplaneIcon from "../assets/icons/transport-airplane.svg";
import courseIcon from "../assets/icons/my-route.svg";
import backIcon from "../assets/icons/nav-back.svg";
import profileIcon from "../assets/icons/nav-profile.svg";
import locationIcon from "../assets/course-settings/pin.svg";
import checkIcon from "../assets/figma/my-maps-imported.svg";
import { profileCharacter } from "../config/profileCharacters";
import SettingsConfirmDialog from "../components/common/SettingsConfirmDialog";
import { routes } from "../config/routes";
import {
  GOOGLE_MAPS_STORAGE_KEY,
  NOTIFICATION_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
} from "../utils/mySettings";
import * as S from "./WithdrawalPage.styled";

type Step = "notice" | "reason";

const tripGroups = [
  { key: "deletedTrips", icon: courseIcon, title: "삭제되는 여행" },
  { key: "transferredTrips", icon: profileIcon, title: "방장이 바뀌는 여행" },
  { key: "leftTrips", icon: airplaneIcon, title: "참여가 종료되는 여행" },
] as const;

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
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [preview, setPreview] = useState<WithdrawalPreview>();
  const [stats, setStats] = useState<MyStatsResponse>();
  const [previewError, setPreviewError] = useState(false);
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const requestPending = useRef(false);
  const tripCount = preview ? tripGroups.reduce((count, group) => count + preview[group.key].length, 0) : 0;

  useEffect(() => {
    const controller = new AbortController();
    void getWithdrawalPreview(controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) setPreview(result);
      },
      () => {
        if (!controller.signal.aborted) setPreviewError(true);
      },
    );
    void getMyStats(controller.signal).then(
      (result) => { if (!controller.signal.aborted) setStats(result); },
      () => undefined,
    );
    return () => controller.abort();
  }, [previewAttempt]);

  const back = () => {
    if (step === "reason") setStep("notice");
    else navigate(routes.accountSettings);
  };

  const completeWithdrawal = async () => {
    if (!preview || !agreed || requestPending.current) return;
    requestPending.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      await withdrawAccount();
    } catch {
      setSubmitError("탈퇴 요청을 처리하지 못했어요. 다시 시도해 주세요.");
      setSubmitting(false);
      requestPending.current = false;
      return;
    }

    clearAuthTokens();
    try {
      for (const key of [PROFILE_STORAGE_KEY, NOTIFICATION_STORAGE_KEY, GOOGLE_MAPS_STORAGE_KEY]) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // 브라우저 저장소를 사용할 수 없어도 서버 탈퇴는 완료됐어요.
    }
    navigate(routes.withdrawalComplete, { replace: true, state: { withdrawalCompleted: true } });
  };

  return (
    <S.Page>
      <S.Header>
        <button type="button" aria-label="이전 화면" disabled={submitting} onClick={back}><img src={backIcon} alt="" /></button>
        <h1>회원 탈퇴</h1>
      </S.Header>

      {step === "notice" ? (
        <S.NoticeBody>
          <h2>탈퇴하기 전에<br />꼭 확인해 주세요</h2>
          <p>탈퇴하면 저장한 정보가 지워지고 되돌릴 수 없어요</p>
          {previewError ? (
            <>
              <p role="alert">탈퇴 안내를 불러오지 못했어요.</p>
              <S.Retry type="button" onClick={() => {
                setPreviewError(false);
                setPreviewAttempt((attempt) => attempt + 1);
              }}>다시 시도</S.Retry>
            </>
          ) : preview ? (
            <>
              <S.LostList>
                <li><span><img src={locationIcon} alt="" /></span><div>
                  <strong>저장한 장소{stats && " " + stats.savedPlaceCount + "곳"}</strong>
                  <small>Google Maps에서 불러온 장소 포함</small>
                </div></li>
                <li><span><img src={courseIcon} alt="" /></span><div>
                  <strong>저장한 코스{stats && " " + stats.savedCourseCount + "개"}</strong>
                  <small>직접 만든 코스와 담은 코스</small>
                </div></li>
                <li><span><img src={airplaneIcon} alt="" /></span><div>
                  <strong>여행 일정 {tripCount}개</strong>
                  <small>함께하는 여행에서는 자동으로 나가요</small>
                </div></li>
                <li><span><img src={profileIcon} alt="" /></span><div>
                  <strong>프로필과 활동 기록</strong>
                  <small>닉네임, 남긴 의견과 댓글</small>
                </div></li>
              </S.LostList>
              {tripCount > 0 && <S.TripDetails><summary>정리되는 여행 보기</summary>
            <S.LostList>
              {tripGroups.map(({ key, icon, title }) => (
                <li key={key}>
                  <span><img src={icon} alt="" /></span>
                  <div>
                    <strong>{title} {preview[key].length}개</strong>
                    {preview[key].map((trip) => (
                      <small key={trip.tripId}>
                        {trip.city} · {trip.startDate} ~ {trip.endDate}
                        {trip.newOwnerName && ` · 새 방장: ${trip.newOwnerName}`}
                      </small>
                    ))}
                  </div>
                </li>
              ))}
            </S.LostList>
              </S.TripDetails>}
            </>
          ) : <p role="status">탈퇴 안내를 불러오고 있어요.</p>}
          <S.Footnote>같은 계정으로 다시 가입해도 삭제된 정보는 복구되지 않아요.</S.Footnote>
        </S.NoticeBody>
      ) : (
        <S.ReasonBody>
          <h2>떠나시는 이유를<br />알려주실 수 있나요?</h2>
          <p>선택 항목이에요. 입력한 내용은 전송되지 않아요.</p>
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
              <textarea aria-label="기타 탈퇴 이유" value={detail} maxLength={200} onChange={(event) => setDetail(event.target.value)} />
              <span>{detail.length}/200</span>
            </S.Textarea>
          )}
        </S.ReasonBody>
      )}

      <S.Cta>
        {step === "notice" && (
          <S.Agree>
            <input type="checkbox" checked={agreed} disabled={!preview} onChange={(event) => setAgreed(event.currentTarget.checked)} />
            <span>{agreed && <img src={checkIcon} alt="" />}</span>
            안내 내용을 모두 확인했고, 탈퇴에 동의해요
          </S.Agree>
        )}
        <button
          type="button"
          disabled={submitting || (step === "notice" && (!preview || !agreed))}
          onClick={() => {
            if (step === "notice") setStep("reason");
            else {
              setSubmitError("");
              setShowFinalDialog(true);
            }
          }}
        >다음</button>
      </S.Cta>

      {showFinalDialog && (
        <SettingsConfirmDialog title="정말 탈퇴할까요?"
          description={<>계정과 저장한 장소·코스가 지워지고<br />탈퇴는 되돌릴 수 없어요</>}
          confirmLabel={submitting ? "처리 중…" : "탈퇴하기"} tone="danger" pending={submitting} error={submitError}
          onCancel={() => setShowFinalDialog(false)} onConfirm={() => void completeWithdrawal()} />
      )}
    </S.Page>
  );
}

export function WithdrawalCompletePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (state?.withdrawalCompleted !== true) return <Navigate to={routes.login} replace />;

  return (
    <S.Page>
      <S.Done>
        <S.DoneAvatar><img src={profileCharacter(1).image} alt="" /></S.DoneAvatar>
        <h1>탈퇴가 완료됐어요</h1>
        <p>그동안 도틀로와 함께해 주셔서 고마워요<br />다음 여행에서 다시 만나요</p>
      </S.Done>
      <S.Cta><button type="button" onClick={() => navigate(routes.login, { replace: true })}>처음으로</button></S.Cta>
    </S.Page>
  );
}

export default WithdrawalPage;
