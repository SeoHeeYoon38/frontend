import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getMe, updateMyProfile } from "../api/auth";
import { isApiEnabled } from "../api/config";
import { hasAuthSession } from "../api/tokenStorage";
import cameraIcon from "../assets/course-settings/camera.svg";
import backIcon from "../assets/icons/nav-back.svg";
import blueAvatar from "../assets/images/character-blue.webp";
import purpleAvatar from "../assets/images/character-purple.webp";
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
  const liveProfile = isApiEnabled() && hasAuthSession();
  const [initialProfile, setInitialProfile] = useState(() =>
    readProfileSettings(window.localStorage),
  );
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [introduction, setIntroduction] = useState(initialProfile.introduction);
  const [avatar, setAvatar] = useState<ProfileAvatar>(initialProfile.avatar);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [loading, setLoading] = useState(liveProfile);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!liveProfile) return;
    const controller = new AbortController();
    void getMe(controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return;
        const profile = {
          nickname: user.nickname?.trim() || user.name,
          email: user.email,
          introduction: user.bio ?? "",
          avatar: (user.characterId === 2 ? "purple" : "blue") as ProfileAvatar,
          travelPreferences: initialProfile.travelPreferences,
        };
        setInitialProfile(profile);
        setNickname(profile.nickname);
        setIntroduction(profile.introduction);
        setAvatar(profile.avatar);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setServerError(
            reason instanceof Error
              ? reason.message
              : "프로필을 불러오지 못했어요. 다시 시도해 주세요.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [initialProfile.travelPreferences, liveProfile]);

  const validation = useMemo(
    () => validateNickname(nickname, initialProfile.nickname),
    [initialProfile.nickname, nickname],
  );
  const dirty =
    nickname !== initialProfile.nickname ||
    introduction !== initialProfile.introduction ||
    avatar !== initialProfile.avatar;
  const canSave =
    dirty && validation.valid && introduction.length <= 30 && !loading && !saving;
  const avatarImage = avatar === "purple" ? purpleAvatar : blueAvatar;

  const requestBack = () => {
    if (dirty) setShowLeaveDialog(true);
    else navigate(routes.my);
  };

  const save = async () => {
    if (!canSave) return;
    setServerError("");
    let profile = {
      ...initialProfile,
      nickname: nickname.trim(),
      introduction: introduction.trim(),
      avatar,
    };

    if (liveProfile) {
      setSaving(true);
      try {
        const user = await updateMyProfile({
          nickname: profile.nickname,
          bio: profile.introduction || null,
          characterId: avatar === "purple" ? 2 : 1,
        });
        profile = {
          ...profile,
          nickname: user.nickname?.trim() || profile.nickname,
          email: user.email,
          introduction: user.bio ?? "",
          avatar: user.characterId === 2 ? "purple" : "blue",
        };
      } catch (reason) {
        setServerError(
          reason instanceof Error
            ? reason.message
            : "프로필을 저장하지 못했어요. 다시 시도해 주세요.",
        );
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    saveProfileSettings(window.localStorage, profile);
    navigate(routes.my, { replace: true, state: { profileSaved: true } });
  };

  return (
    <S.Page>
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
            <span>{liveProfile ? "Google 계정" : "데모 프로필"}</span>
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
        {serverError && <S.ErrorNotice role="alert">{serverError}</S.ErrorNotice>}
      </S.Body>

      <S.Cta>
        <button type="button" disabled={!canSave} onClick={() => void save()}>
          {loading ? "프로필을 불러오고 있어요" : saving ? "저장하고 있어요" : "저장하기"}
        </button>
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
