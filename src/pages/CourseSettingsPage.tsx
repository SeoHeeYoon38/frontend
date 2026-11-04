import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import statusIcons from "../assets/course-completion/status-icons.svg";
import avatarBlue from "../assets/course-settings/avatar-blue.png";
import avatarPurple from "../assets/course-settings/avatar-purple.png";
import avatarYellow from "../assets/course-settings/avatar-yellow.png";
import backIcon from "../assets/course-settings/back.svg";
import bellIcon from "../assets/course-settings/bell.svg";
import cameraIcon from "../assets/course-settings/camera.svg";
import closeIcon from "../assets/course-settings/close.svg";
import deleteIcon from "../assets/course-settings/delete.svg";
import editIcon from "../assets/course-settings/edit.svg";
import linkIcon from "../assets/course-settings/link.svg";
import memberIcon from "../assets/course-settings/member.svg";
import pinIcon from "../assets/course-settings/pin.svg";
import shareAirDrop from "../assets/course-settings/share-airdrop.png";
import shareKakao from "../assets/course-settings/share-kakao.png";
import shareMail from "../assets/course-settings/share-mail.png";
import shareMessages from "../assets/course-settings/share-messages.png";
import successCheck from "../assets/course-settings/success-check.svg";
import successRing from "../assets/course-settings/success-ring.svg";
import * as S from "./CourseSettingsPage.styled";

type SheetName = "trip" | "invite" | null;

const inviteLink = "https://dotlo.app/t/tokyo-3n4d-sample";

const members = [
  { name: "우예빈", suffix: "(나)", role: "여행 생성자", avatar: avatarPurple },
  { name: "정다은", suffix: "", role: "편집 가능", avatar: avatarBlue },
  { name: "이지우", suffix: "", role: "편집 가능", avatar: avatarYellow },
];

const shareTargets = [
  { label: "AirDrop", image: shareAirDrop },
  { label: "메시지", image: shareMessages },
  { label: "카카오톡", image: shareKakao },
  { label: "Mail", image: shareMail },
];

function CourseSettingsPage() {
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState<SheetName>(null);
  const [tripName, setTripName] = useState("도쿄 3박 4일");
  const [draftName, setDraftName] = useState(tripName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeSheet) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveSheet(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeSheet]);

  const openSheet = (sheet: Exclude<SheetName, null>) => {
    setActiveSheet(sheet);
    setCopied(false);
    setNotice("");
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setIsEditingName(false);
    setDraftName(tripName);
  };

  const startEditingName = () => {
    setDraftName(tripName);
    setIsEditingName(true);
    window.setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const saveTripName = () => {
    const nextName = draftName.trim();
    if (nextName) {
      setTripName(nextName);
      setNotice("여행 이름을 수정했어요.");
    }
    setIsEditingName(false);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
    setCopied(true);
  };

  const showNotice = (message: string) => {
    setNotice(message);
  };

  return (
    <S.PageShell>
      <S.Page>
        <S.StatusBar aria-hidden="true">
          <span>9:41</span>
          <img src={statusIcons} alt="" />
        </S.StatusBar>

        <S.Navigation aria-label="코스 설정 탐색">
          <button type="button" aria-label="이전 화면으로 이동" onClick={() => navigate(-1)}>
            <img src={backIcon} alt="" />
          </button>
          <h1>코스 설정</h1>
          <span aria-hidden="true" />
        </S.Navigation>

        <S.SettingsContent>
          <S.SettingsSection aria-labelledby="course-edit-heading">
            <h2 id="course-edit-heading">코스 편집</h2>
            <S.MenuList>
              <S.MenuButton type="button" onClick={() => openSheet("trip")}>
                <img src={pinIcon} alt="" />
                <span>내 여행 수정</span>
                <S.Chevron aria-hidden="true">›</S.Chevron>
              </S.MenuButton>
              <S.MenuButton type="button" onClick={() => showNotice("대표 이미지 수정 기능은 사진 연결 후 사용할 수 있어요.")}>
                <img src={cameraIcon} alt="" />
                <span>대표 이미지 수정</span>
                <S.Chevron aria-hidden="true">›</S.Chevron>
              </S.MenuButton>
            </S.MenuList>
          </S.SettingsSection>

          <S.Divider />

          <S.SettingsSection aria-labelledby="feature-heading">
            <h2 id="feature-heading">기능</h2>
            <S.MenuList>
              <S.MenuButton type="button" onClick={() => showNotice("알림 설정 화면은 다음 단계에서 연결할 수 있어요.")}>
                <img src={bellIcon} alt="" />
                <span>알림 설정</span>
                <S.Chevron aria-hidden="true">›</S.Chevron>
              </S.MenuButton>
              <S.MenuButton type="button" onClick={() => showNotice("코스 삭제는 서버 연동 후 사용할 수 있어요.")}>
                <img src={deleteIcon} alt="" />
                <span>코스 삭제하기</span>
                <S.Chevron aria-hidden="true">›</S.Chevron>
              </S.MenuButton>
            </S.MenuList>
          </S.SettingsSection>

          <S.Divider />

          <S.SettingsSection aria-labelledby="member-heading">
            <h2 id="member-heading">멤버</h2>
            <S.MenuList>
              <S.MenuButton type="button" onClick={() => openSheet("invite")}>
                <img src={memberIcon} alt="" />
                <span>친구 초대</span>
                <S.ActionBadge $tone="cyan" aria-hidden="true">＋</S.ActionBadge>
              </S.MenuButton>
              <S.MenuButton type="button" onClick={() => showNotice("코스 나가기는 서버 연동 후 사용할 수 있어요.")}>
                <S.LeaveIcon aria-hidden="true"><span /></S.LeaveIcon>
                <span>코스 나가기</span>
                <S.ActionBadge $tone="pink" aria-hidden="true">−</S.ActionBadge>
              </S.MenuButton>
            </S.MenuList>
          </S.SettingsSection>
        </S.SettingsContent>

        <S.LiveRegion aria-live="polite">{notice}</S.LiveRegion>

        {activeSheet && (
          <S.SheetLayer role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeSheet()}>
            <S.BottomSheet role="dialog" aria-modal="true" aria-labelledby={`${activeSheet}-sheet-title`}>
              <S.Grabber />
              <S.SheetHeader>
                <h2 id={`${activeSheet}-sheet-title`}>{activeSheet === "trip" ? "내 여행 수정" : "친구 초대"}</h2>
                <button type="button" aria-label="닫기" onClick={closeSheet}>
                  <img src={closeIcon} alt="" />
                </button>
              </S.SheetHeader>

              {activeSheet === "trip" ? (
                <S.TripDetails>
                  <S.DetailRow>
                    <dt>여행 이름</dt>
                    <dd>
                      {isEditingName ? (
                        <S.NameEditor
                          ref={nameInputRef}
                          value={draftName}
                          aria-label="여행 이름"
                          onChange={(event) => setDraftName(event.target.value)}
                          onBlur={saveTripName}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") saveTripName();
                            if (event.key === "Escape") {
                              setDraftName(tripName);
                              setIsEditingName(false);
                            }
                          }}
                        />
                      ) : (
                        <span>{tripName}</span>
                      )}
                      <button type="button" aria-label="여행 이름 수정" onClick={startEditingName}>
                        <img src={editIcon} alt="" />
                      </button>
                    </dd>
                  </S.DetailRow>
                  <S.DetailRow><dt>여행지</dt><dd>일본 · 도쿄</dd></S.DetailRow>
                  <S.DetailRow><dt>날짜</dt><dd>2026.05.18 – 05.21 · 3박 4일</dd></S.DetailRow>
                  <S.DetailRow><dt>인원</dt><dd>3명</dd></S.DetailRow>
                  <S.DetailRow><dt>이동 수단</dt><dd>대중교통</dd></S.DetailRow>
                </S.TripDetails>
              ) : (
                <S.InviteContent>
                  <S.LinkBox>
                    <img src={linkIcon} alt="" />
                    <span>{inviteLink.replace("https://", "")}</span>
                    <button type="button" onClick={copyInviteLink}>링크 복사</button>
                  </S.LinkBox>
                  <S.CopyMessage $visible={copied} aria-hidden={!copied} aria-live="polite">
                    <S.SuccessIcon aria-hidden="true">
                      <img src={successRing} alt="" />
                      <img src={successCheck} alt="" />
                    </S.SuccessIcon>
                    링크를 복사했어요
                  </S.CopyMessage>

                  <S.MemberSection>
                    <h3>함께하는 친구</h3>
                    <S.MemberList>
                      {members.map((member) => (
                        <li key={member.name}>
                          <img src={member.avatar} alt="" />
                          <strong>{member.name} <small>{member.suffix}</small></strong>
                          <span>{member.role}</span>
                        </li>
                      ))}
                    </S.MemberList>
                  </S.MemberSection>

                  <S.ShareSection>
                    <h3>다른 앱으로 공유</h3>
                    <S.ShareList>
                      {shareTargets.map((target) => (
                        <li key={target.label}>
                          <button type="button" onClick={() => showNotice(`${target.label} 공유는 모바일 앱에서 사용할 수 있어요.`)}>
                            <img src={target.image} alt="" />
                            <span>{target.label}</span>
                          </button>
                        </li>
                      ))}
                    </S.ShareList>
                  </S.ShareSection>
                </S.InviteContent>
              )}
            </S.BottomSheet>
          </S.SheetLayer>
        )}
      </S.Page>
    </S.PageShell>
  );
}

export default CourseSettingsPage;
