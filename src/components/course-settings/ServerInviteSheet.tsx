import { useEffect, useRef, useState } from "react";
import linkIcon from "../../assets/course-settings/link.svg";
import airDropIcon from "../../assets/course-settings/share-airdrop.png";
import messagesIcon from "../../assets/course-settings/share-messages.png";
import kakaoIcon from "../../assets/course-settings/share-kakao.png";
import mailIcon from "../../assets/course-settings/share-mail.png";
import addedCheck from "../../assets/direct-trip/added-check.svg";
import osakaCover from "../../assets/invite/hero.png";
import { profileCharacter } from "../../config/profileCharacters";
import { createInvite, getTripMembers } from "../../api/members";
import { createTripShare } from "../../api/trips";
import type { MemberResponse, TripResponse } from "../../api/types";
import { apiTripToSummary } from "../../utils/serverTrip";
import { formatTripDateRange } from "../../utils/importedTrip";
import { routes } from "../../config/routes";
import { inviteSmsUrl } from "../../utils/inviteSharing";
import { kakaoShareConfigured, prepareKakaoShare, reportKakaoShareError, type KakaoShare } from "../../utils/kakaoShare";
import { invitePath } from "../../utils/navigation";
import TripSheet from "../common/TripSheet";
import * as S from "./CourseSettings.styled";

const shareActions = [
  { label: "AirDrop", accessibilityLabel: "AirDrop으로 공유", icon: airDropIcon, method: "native" },
  { label: "메시지", accessibilityLabel: "메시지로 공유", icon: messagesIcon, method: "sms" },
  { label: "카카오톡", accessibilityLabel: "카카오톡으로 공유", icon: kakaoIcon, method: "kakao" },
  { label: "Mail", accessibilityLabel: "메일로 공유", icon: mailIcon, method: "mail" },
] as const;

export default function ServerInviteSheet({ tripId, trip, onClose, publicShare = false }: {
  tripId: number;
  trip?: TripResponse;
  onClose: () => void;
  publicShare?: boolean;
}) {
  const title = publicShare ? "일정 공유" : "친구 초대";
  const linkLabel = publicShare ? "공유 링크" : "초대 링크";
  const [path, setPath] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [copiedAt, setCopiedAt] = useState(0);
  const inviteContent = useRef<HTMLDivElement>(null);
  const [toastBottom, setToastBottom] = useState(0);
  const [actionError, setActionError] = useState("");
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [kakaoShare, setKakaoShare] = useState<KakaoShare>();
  const [kakaoLoading, setKakaoLoading] = useState(kakaoShareConfigured);

  useEffect(() => {
    if (!copiedAt) return;
    const dialog = inviteContent.current?.closest("dialog");
    const updatePosition = () => {
      if (dialog) setToastBottom(window.innerHeight - dialog.getBoundingClientRect().top + 12);
    };
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    if (dialog) observer.observe(dialog);
    const timer = window.setTimeout(() => setCopiedAt(0), 3000);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [copiedAt]);

  useEffect(() => {
    const sdk = prepareKakaoShare();
    if (!sdk) return;
    let active = true;
    void sdk.then((share) => { if (active) setKakaoShare(share); }, (reason: unknown) => {
      reportKakaoShareError("load", reason);
    }).finally(() => { if (active) setKakaoLoading(false); });
    return () => { active = false; };
  }, []);

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

  async function shareLink(method: "copy" | typeof shareActions[number]["method"]) {
    setCopiedAt(0);
    setActionError("");
    try {
      if (method === "copy") {
        await navigator.clipboard.writeText(link);
        setCopiedAt(Date.now());
        return;
      }
      if (method === "mail") {
        window.location.href = `mailto:?subject=${encodeURIComponent(`도틀로 ${title}`)}&body=${encodeURIComponent(link)}`;
        return;
      }
      if (method === "sms") {
        window.location.href = inviteSmsUrl(link, navigator);
        return;
      }
      if (method === "kakao" && kakaoShare) {
        const shareLink = { webUrl: link, mobileWebUrl: link };
        const summary = trip && apiTripToSummary(trip);
        const cover = trip?.city === "오사카" ? osakaCover : summary?.coverImage;
        if (!publicShare && trip && summary && cover) {
          const inviter = members.find((member) => member.me)?.name;
          await kakaoShare.sendDefault({
            objectType: "feed",
            content: {
              title: `${inviter ? inviter + "님이 " : ""}${summary.title} 여행에 초대했어요`,
              description: formatTripDateRange(trip.startDate, trip.endDate),
              imageUrl: new URL(cover, window.location.origin).href,
              link: shareLink,
            },
            buttons: [{ title: "여행 보러 가기", link: shareLink }],
          });
        } else await kakaoShare.sendDefault({
          objectType: "text",
          text: `도틀로 ${title}`,
          link: shareLink,
          buttonTitle: publicShare ? "일정 보기" : "참여하기",
        });
        return;
      }
      const data = { title: `도틀로 ${title}`, url: link };
      if (typeof navigator.share !== "function" || navigator.canShare?.(data) === false) {
        setActionError("이 브라우저에서는 공유창을 열 수 없어요. Safari 또는 Chrome에서 다시 열어 주세요.");
        return;
      }
      await navigator.share(data);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      if (method === "kakao") reportKakaoShareError(kakaoShare ? "share" : "device", reason);
      setActionError("링크를 공유하지 못했어요. 링크를 직접 복사해 주세요.");
    }
  }

  const Sheet = publicShare ? TripSheet : S.FriendInviteSheet;
  return (
    <Sheet title={title} onClose={onClose} minHeight={publicShare ? undefined : 412}>
      <S.InviteContent ref={inviteContent}>
        <p>{publicShare ? "링크를 받은 사람은 로그인 없이 일정을 볼 수 있어요." : "링크를 받은 친구는 일정을 함께 볼 수 있어요"}</p>
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
              {publicShare && <img src={linkIcon} alt="" />}
              <span title={link}>{link}</span>
              <button type="button" data-copied={copiedAt > 0 || undefined} onClick={() => void shareLink("copy")}>{copiedAt ? "복사됨" : "링크 복사"}</button>
            </S.LinkBox>
            <S.ShareSection aria-label="공유하기">
              {publicShare && <h3>공유하기</h3>}
              <S.ShareList>
                {shareActions.map(({ label, accessibilityLabel, icon, method }) => <li key={label}>
                  <button type="button" aria-label={accessibilityLabel} disabled={method === "kakao" && kakaoLoading}
                    onClick={() => void shareLink(method)}>
                    <img src={icon} alt="" /><span>{label}</span>
                  </button>
                </li>)}
              </S.ShareList>
            </S.ShareSection>
            {!publicShare && members.length > 0 && <S.MemberSection>
              <h3>참여자 {members.length}명</h3>
              <S.MemberList>
                {members.map((member) => <li key={member.userId}>
                  <img src={profileCharacter(member.characterId).image} alt="" />
                  <strong>{member.name}{member.me && <small> (나)</small>}</strong>
                  <span>{member.role === "OWNER" ? "여행 생성자" : "참여자"}</span>
                </li>)}
              </S.MemberList>
            </S.MemberSection>}
            {copiedAt > 0 && <S.SettingsToast style={{ bottom: toastBottom }} role="status"><img src={addedCheck} alt="" />
              {publicShare ? "공유 링크를 복사했어요" : "링크를 복사했어요. 친구에게 보내보세요"}
            </S.SettingsToast>}
            {actionError && <p role="alert">{actionError}</p>}
          </>
        ) : <p role="status">{linkLabel}를 만들고 있어요.</p>}
      </S.InviteContent>
    </Sheet>
  );
}
