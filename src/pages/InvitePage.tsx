import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import calendarIcon from "../assets/invite/calendar.svg";
import dashImage from "../assets/invite/dash.svg";
import dotloMark from "../assets/invite/dotlo-mark.png";
import heroImage from "../assets/invite/hero.png";
import inviterAvatar from "../assets/invite/inviter.png";
import memberIcon from "../assets/invite/member.svg";
import pinIcon from "../assets/invite/pin.svg";
import thumbOne from "../assets/invite/thumb-1.png";
import thumbTwo from "../assets/invite/thumb-2.png";
import thumbThree from "../assets/invite/thumb-3.png";
import thumbFour from "../assets/invite/thumb-4.png";
import ticketShape from "../assets/invite/ticket-shape.svg";
import { routes } from "../config/routes";
import { demoInviteId, serverTripPlanPath, tripCommunityPath } from "../utils/navigation";
import { acceptInvite, getInvitePreview } from "../api/members";
import { ApiError } from "../api/client";
import { hasAuthSession } from "../api/tokenStorage";
import type { InvitePreviewResponse } from "../api/types";
import * as S from "./InvitePage.styled";

const companionLabels = {
  ALONE: "혼자",
  COUPLE: "연인",
  FRIEND: "친구",
  FAMILY: "가족",
} as const;

function shortDate(value: string) {
  const [, month, day] = value.split("-");
  return `${Number(month)}.${Number(day)}`;
}

function InvitePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const inviteState = new URLSearchParams(location.search).get("state");
  const { inviteId } = useParams();
  const demo = inviteId === demoInviteId;
  const [preview, setPreview] = useState<InvitePreviewResponse>();
  const [loading, setLoading] = useState(!demo);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(inviteState === "expired" ? "초대가 만료됐어요." : "");

  useEffect(() => {
    if (!inviteId || demo) return;
    const controller = new AbortController();
    void getInvitePreview(inviteId, controller.signal).then(
      (response) => {
        if (controller.signal.aborted) return;
        setPreview(response);
        setError("");
        setLoading(false);
      },
      (reason) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof ApiError && reason.code === "INVITE_EXPIRED"
            ? "초대가 만료됐어요. 초대한 친구에게 새 링크를 받아 주세요."
            : "초대 링크를 찾을 수 없어요.",
        );
        setLoading(false);
      },
    );
    return () => controller.abort();
  }, [demo, inviteId]);

  const joinTrip = async () => {
    if (!inviteId || demo) {
      navigate(tripCommunityPath("home"));
      return;
    }
    if (!hasAuthSession()) {
      setError("로그인한 뒤 초대를 수락해 주세요.");
      return;
    }
    setAccepting(true);
    setError("");
    try {
      const result = await acceptInvite(inviteId);
      navigate(serverTripPlanPath("home", String(result.tripId)), { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "초대를 수락하지 못했어요.");
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <S.Page>
        <S.Actions>
          <p role="status">초대 정보를 불러오고 있어요.</p>
        </S.Actions>
      </S.Page>
    );
  }

  const city = preview?.city ?? "오사카";
  const date = preview
    ? `${shortDate(preview.startDate)} - ${shortDate(preview.endDate)}`
    : "5.18 - 5.21";
  const inviter = preview?.inviterName ?? (demo ? "샘플" : "친구");
  const savedPlaceCount = preview?.savedPlaceCount ?? 12;

  return (
    <S.Page>
      <S.Hero>
        <img src={heroImage} alt="벚꽃이 핀 오사카성" />
        <S.Scrim />
        <S.Fade />
      </S.Hero>

      <S.InviterPill>
        <S.InviterAvatar><img src={inviterAvatar} alt="" /></S.InviterAvatar>
        <span>{inviter}님의 초대</span>
      </S.InviterPill>

      <S.Ticket>
        <img className="ticket-shape" src={ticketShape} alt="" />
        <S.TicketTop>
          <img className="dotlo-mark" src={dotloMark} alt="Dotlo" />
          <h1>{city} 여행</h1>
          <p>{demo ? "공동 계획을 체험하는 샘플 여행이에요." : "함께 여행 계획을 세워 보세요."}</p>
          <S.TripInfo>
            <div><span data-tone="sky"><img src={pinIcon} alt="" /></span><small>어디로</small><strong>{city}</strong></div>
            <div><span data-tone="purple"><img src={calendarIcon} alt="" /></span><small>언제</small><strong>{date}</strong></div>
            <div><span data-tone="yellow"><img src={memberIcon} alt="" /></span><small>누구와</small><strong>{preview ? companionLabels[preview.companion] : "친구"}</strong></div>
          </S.TripInfo>
        </S.TicketTop>
        <S.Perforation><img src={dashImage} alt="" /></S.Perforation>
        <S.TicketBottom>
          <h2>담긴 장소 <b>{savedPlaceCount}곳</b></h2>
          {savedPlaceCount > 0 ? (
            <S.Thumbs>
              <img src={thumbOne} alt="여행 장소" />
              {savedPlaceCount > 1 && <img src={thumbTwo} alt="여행 장소" />}
              {savedPlaceCount > 2 && <img src={thumbThree} alt="여행 장소" />}
              {savedPlaceCount > 3 && <span><img src={thumbFour} alt="더 많은 장소" /><b>+{savedPlaceCount - 3}</b></span>}
            </S.Thumbs>
          ) : <p>아직 담긴 장소가 없어요.</p>}
        </S.TicketBottom>
      </S.Ticket>

      <S.Actions>
        {error ? (
          <>
            <S.DisabledNotice role="alert">{error}</S.DisabledNotice>
            {!hasAuthSession() && !demo ? (
              <button type="button" onClick={() => navigate(routes.login)}>로그인하기</button>
            ) : (
              <button type="button" onClick={() => navigate(routes.home)}>홈으로 가기</button>
            )}
          </>
        ) : (
          <>
            {demo && <S.DemoNotice>공유 링크에는 샘플 여행만 표시돼요.</S.DemoNotice>}
            <button type="button" disabled={accepting} onClick={() => void joinTrip()}>
              {accepting ? "참여하고 있어요" : demo ? "공동 계획 데모 보기" : "초대 수락하기"}
            </button>
            <S.LaterButton type="button" onClick={() => navigate(routes.home)}>나중에 볼게요</S.LaterButton>
          </>
        )}
        <S.HomeIndicator />
      </S.Actions>
    </S.Page>
  );
}

export default InvitePage;
