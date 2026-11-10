import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import cameraIcon from "../assets/course-settings/camera.svg";
import backIcon from "../assets/icons/nav-back.svg";
import blueAvatar from "../assets/images/character-blue.webp";
import purpleAvatar from "../assets/images/character-purple.webp";
import AppStatusBar from "../components/common/AppStatusBar";
import { routes } from "../config/routes";
import {
  readProfileSettings,
  saveProfileSettings,
  validateNickname,
  type ProfileAvatar,
} from "../utils/mySettings";
import * as S from "./ProfileEditPage.styled";

function ProfileEditPage() {
  const navigate = useNavigate();
  const [initialProfile] = useState(() => readProfileSettings(window.localStorage));
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [introduction, setIntroduction] = useState(initialProfile.introduction);
  const [avatar, setAvatar] = useState<ProfileAvatar>(initialProfile.avatar);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const validation = useMemo(
    () => validateNickname(nickname, initialProfile.nickname),
    [initialProfile.nickname, nickname],
  );
  const dirty =
    nickname !== initialProfile.nickname ||
    introduction !== initialProfile.introduction ||
    avatar !== initialProfile.avatar;
  const canSave = dirty && validation.valid && introduction.length <= 30;
  const avatarImage = avatar === "purple" ? purpleAvatar : blueAvatar;

  const requestBack = () => {
    if (dirty) setShowLeaveDialog(true);
    else navigate(routes.my);
  };

  const save = () => {
    if (!canSave) return;
    saveProfileSettings(window.localStorage, {
      nickname: nickname.trim(),
      email: initialProfile.email,
      introduction: introduction.trim(),
      avatar,
    });
    navigate(routes.my, { replace: true, state: { profileSaved: true } });
  };

  return (
    <S.Page>
      <AppStatusBar />
      <S.Header>
        <button type="button" aria-label="마이 화면으로 돌아가기" onClick={requestBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1>프로필 수정</h1>
      </S.Header>

      <S.Body>
        <S.AvatarButton
          type="button"
          aria-label="프로필 사진 변경"
          onClick={() => setShowPhotoSheet(true)}
        >
          <img src={avatarImage} alt="" />
          <span><img src={cameraIcon} alt="" /></span>
        </S.AvatarButton>

        <S.Field $tone={validation.tone}>
          <label htmlFor="profile-nickname">닉네임</label>
          <S.InputWrap>
            <input
              id="profile-nickname"
              value={nickname}
              maxLength={12}
              onChange={(event) => setNickname(event.target.value)}
            />
            <span>{nickname.length}/12</span>
          </S.InputWrap>
          <small>
            {validation.message || "동행자의 채팅방에 이 이름으로 보여요"}
          </small>
        </S.Field>

        <S.Field>
          <label htmlFor="profile-email">이메일</label>
          <S.DisabledInput>
            <input id="profile-email" value={initialProfile.email} readOnly />
            <span><i /> 카카오 연동</span>
          </S.DisabledInput>
          <small>로그인 계정의 이메일이라 여기서는 바꿀 수 없어요</small>
        </S.Field>

        <S.Field>
          <label htmlFor="profile-introduction">한 줄 소개</label>
          <S.InputWrap>
            <input
              id="profile-introduction"
              value={introduction}
              maxLength={30}
              onChange={(event) => setIntroduction(event.target.value)}
            />
            <span>{introduction.length}/30</span>
          </S.InputWrap>
        </S.Field>
      </S.Body>

      <S.Cta>
        <button type="button" disabled={!canSave} onClick={save}>저장하기</button>
        <S.HomeIndicator />
      </S.Cta>

      {showPhotoSheet && (
        <S.Overlay role="presentation" onClick={() => setShowPhotoSheet(false)}>
          <S.PhotoSheet role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <strong>프로필 사진</strong>
            <button type="button" onClick={() => { setAvatar("purple"); setShowPhotoSheet(false); }}>
              앨범에서 사진 선택
            </button>
            <button type="button" onClick={() => { setAvatar("blue"); setShowPhotoSheet(false); }}>
              기본 이미지로 변경
            </button>
            <button type="button" onClick={() => setShowPhotoSheet(false)}>취소</button>
          </S.PhotoSheet>
        </S.Overlay>
      )}

      {showLeaveDialog && (
        <S.Overlay role="presentation">
          <S.Dialog role="alertdialog" aria-modal="true">
            <strong>저장하지 않고 나갈까요?</strong>
            <p>수정한 프로필 정보가 저장되지 않아요</p>
            <div>
              <button type="button" onClick={() => setShowLeaveDialog(false)}>계속 수정</button>
              <button type="button" data-danger onClick={() => navigate(routes.my)}>나가기</button>
            </div>
          </S.Dialog>
        </S.Overlay>
      )}
    </S.Page>
  );
}

export default ProfileEditPage;
