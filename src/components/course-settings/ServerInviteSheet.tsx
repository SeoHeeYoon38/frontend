import { useEffect, useState } from "react";
import linkIcon from "../../assets/course-settings/link.svg";
import airDropIcon from "../../assets/course-settings/share-airdrop.png";
import messagesIcon from "../../assets/course-settings/share-messages.png";
import kakaoIcon from "../../assets/course-settings/share-kakao.png";
import mailIcon from "../../assets/course-settings/share-mail.png";
import memberAvatar from "../../assets/course-settings-details/member-avatar.png";
import { createInvite, getTripMembers } from "../../api/members";
import { createTripShare } from "../../api/trips";
import type { MemberResponse } from "../../api/types";
import { routes } from "../../config/routes";
import { invitePath } from "../../utils/navigation";
import TripSheet from "../common/TripSheet";
import * as S from "./CourseSettings.styled";

export default function ServerInviteSheet({ tripId, onClose, publicShare = false }: {
  tripId: number;
  onClose: () => void;
  publicShare?: boolean;
}) {
  const title = publicShare ? "일정 공유" : "친구 초대";
  const linkLabel = publicShare ? "공유 링크" : "초대 링크";
  const [path, setPath] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [members, setMembers] = useState<MemberResponse[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const createLink = publicShare ? createTripShare : createInvite;
    void createLink(tripId, controller.signal).then(
      ({ token }) => {
        if (!controller.signal.aborted) {
          setPath(publicShare ? routes.sharedTrip.replace(":token", encodeURIComponent(token)) : invitePath(token));
        }
      },
      () => {
        if (!controller.signal.aborted) setLoadFailed(true);
      },
    );
    return () => controller.abort();
  }, [attempt, publicShare, tripId]);

  useEffect(() => {
    if (publicShare) return;
    const controller = new AbortController();
    void getTripMembers(tripId, controller.signal).then(
      (result) => { if (!controller.signal.aborted) setMembers(result); },
      () => undefined,
    );
    return () => controller.abort();
  }, [publicShare, tripId]);

  const link = path ? new URL(path, window.location.origin).href : "";

  async function shareLink(method: "copy" | "native" | "mail") {
    setMessage("");
    setActionError("");
    try {
      if (method === "mail") {
        window.location.href = `mailto:?subject=${encodeURIComponent(`도틀로 ${title}`)}&body=${encodeURIComponent(link)}`;
      } else if (method === "native" && typeof navigator.share === "function") {
        await navigator.share({ title: `도틀로 ${title}`, url: link });
      } else {
        await navigator.clipboard.writeText(link);
        setMessage(`${linkLabel}를 복사했어요. 원하는 앱에 붙여 넣어 주세요.`);
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setActionError("링크를 공유하지 못했어요. 링크를 직접 복사해 주세요.");
    }
  }

  return (
    <TripSheet title={title} onClose={onClose}>
      <S.InviteContent>
        <p>{publicShare ? "링크를 받은 사람은 로그인 없이 일정을 볼 수 있어요." : "링크를 받은 친구는 일정을 함께 볼 수 있어요."}</p>
        {loadFailed ? (
          <>
            <p role="alert">{linkLabel}를 만들지 못했어요.</p>
            <S.SheetPrimaryButton type="button" onClick={() => {
              setLoadFailed(false);
              setAttempt((value) => value + 1);
            }}>다시 시도</S.SheetPrimaryButton>
          </>
        ) : link ? (
          <>
            <S.LinkBox>
              <img src={linkIcon} alt="" />
              <span title={link}>{link}</span>
              <button type="button" onClick={() => void shareLink("copy")}>링크 복사</button>
            </S.LinkBox>
            <S.ShareSection>
              <h3>공유하기</h3>
              <S.ShareList>
                {[
                  { label: "AirDrop", icon: airDropIcon, method: "native" },
                  { label: "메시지", icon: messagesIcon, method: "native" },
                  { label: "카카오톡", icon: kakaoIcon, method: "native" },
                  { label: "메일", icon: mailIcon, method: "mail" },
                ].map(({ label, icon, method }) => <li key={label}>
                  <button type="button" aria-label={`${label}로 공유`} onClick={() => void shareLink(method as "native" | "mail")}>
                    <img src={icon} alt="" /><span>{label}</span>
                  </button>
                </li>)}
              </S.ShareList>
            </S.ShareSection>
            {!publicShare && members.length > 0 && <S.MemberSection>
              <h3>함께하는 사람</h3>
              <S.MemberList>
                {members.map((member) => <li key={member.userId}>
                  <img src={member.profileImageUrl || memberAvatar} alt="" />
                  <strong>{member.name}{member.me && <small> (나)</small>}</strong>
                  <span>{member.role === "OWNER" ? "여행 생성자" : "참여자"}</span>
                </li>)}
              </S.MemberList>
            </S.MemberSection>}
            {message && <p role="status">{message}</p>}
            {actionError && <p role="alert">{actionError}</p>}
          </>
        ) : <p role="status">{linkLabel}를 만들고 있어요.</p>}
      </S.InviteContent>
    </TripSheet>
  );
}
