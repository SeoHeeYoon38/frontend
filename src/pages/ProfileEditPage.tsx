import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { checkNickname, getMe, updateMyProfile } from "../api/auth";
import { isApiEnabled } from "../api/config";
import { ApiError } from "../api/client";
import { hasAuthSession } from "../api/tokenStorage";
import avatarBackground from "../assets/figma/my-profile-avatar-bg.svg";
import googleIcon from "../assets/onboarding/google.svg";
import clearIcon from "../assets/figma/my-profile-clear.svg";
import validIcon from "../assets/figma/my-profile-valid.svg";
import invalidIcon from "../assets/figma/my-profile-invalid.svg";
import backIcon from "../assets/icons/nav-back.svg";
import { profileCharacter } from "../config/profileCharacters";
import ProfileCharacterSheet from "../components/common/ProfileCharacterSheet";
import SettingsConfirmDialog from "../components/common/SettingsConfirmDialog";
import { routes } from "../config/routes";
import {
  readProfileSettings,
  profileAvatarId,
  saveProfileSettings,
  validateNickname,
  validateNicknameFormat,
  type ProfileAvatar,
} from "../utils/mySettings";
import * as S from "./ProfileEditPage.styled";

function ProfileEditPage() {
  const navigate = useNavigate();
  const liveProfile = isApiEnabled() && hasAuthSession();
  const [initialProfile, setInitialProfile] = useState(() => {
    const stored = readProfileSettings(window.localStorage);
    return liveProfile ? { ...stored, nickname: "", email: "", introduction: "" } : stored;
  });
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [introduction, setIntroduction] = useState(initialProfile.introduction);
  const [avatar, setAvatar] = useState<ProfileAvatar>(initialProfile.avatar);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [loading, setLoading] = useState(liveProfile);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [checkedNickname, setCheckedNickname] = useState<{ text: string; state: "available" | "taken" | "error" }>();
  const pendingSave = useRef(false);
  const nicknameText = nickname.trim();
  const nicknameChanged = nicknameText !== initialProfile.nickname;
  const format = nicknameChanged ? validateNicknameFormat(nicknameText) : { valid: true, tone: "default" as const, message: "" };
  const needsNicknameCheck = liveProfile && !loading && format.valid && nicknameChanged;

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
          avatar: profileAvatarId(user.characterId),
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

  useEffect(() => {
    if (!needsNicknameCheck) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void checkNickname(nicknameText, controller.signal).then(
        (result) => {
          if (!controller.signal.aborted) {
            setCheckedNickname({ text: nicknameText, state: result.available ? "available" : "taken" });
          }
        },
        () => {
          if (!controller.signal.aborted) setCheckedNickname({ text: nicknameText, state: "error" });
        },
      );
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [needsNicknameCheck, nicknameText]);

  const checked = checkedNickname?.text === nicknameText ? checkedNickname.state : undefined;
  const validation = !liveProfile ? validateNickname(nickname, initialProfile.nickname)
    : !needsNicknameCheck ? format
    : checked === "available" ? format
    : checked === "taken" ? { valid: false, tone: "error" as const, message: "이미 다른 사람이 쓰고 있는 닉네임이에요" }
    : checked === "error" ? { valid: false, tone: "error" as const, message: "닉네임을 확인하지 못했어요. 다시 입력해 주세요" }
    : { valid: false, tone: "default" as const, message: "닉네임을 확인하고 있어요" };
  const dirty =
    nickname !== initialProfile.nickname ||
    introduction !== initialProfile.introduction ||
    avatar !== initialProfile.avatar;
  const canSave =
    dirty && validation.valid && introduction.length <= 30 && !loading && !saving && Boolean(nicknameText);
  const avatarImage = profileCharacter(avatar).image;
  const introductionAtLimit = introduction.length >= 30;

  function changeNickname(value: string) {
    setNickname(value);
    if (value.trim() !== nicknameText) setCheckedNickname(undefined);
    setServerError("");
  }

  const requestBack = () => {
    if (dirty) setShowLeaveDialog(true);
    else navigate(routes.my);
  };

  const save = async () => {
    if (!canSave || pendingSave.current) return;
    setServerError("");
    let profile = {
      ...initialProfile,
      nickname: nickname.trim(),
      introduction: introduction.trim(),
      avatar,
    };

    if (liveProfile) {
      pendingSave.current = true;
      setSaving(true);
      try {
        const user = await updateMyProfile({
          nickname: profile.nickname,
          bio: profile.introduction || null,
          characterId: avatar,
        });
        profile = {
          ...profile,
          nickname: user.nickname?.trim() || profile.nickname,
          email: user.email,
          introduction: user.bio ?? "",
          avatar: profileAvatarId(user.characterId),
        };
      } catch (reason) {
        if (reason instanceof ApiError && reason.code === "NICKNAME_TAKEN") {
          setCheckedNickname({ text: nicknameText, state: "taken" });
        } else {
          setServerError(reason instanceof Error ? reason.message : "프로필을 저장하지 못했어요. 다시 시도해 주세요.");
        }
        return;
      } finally {
        pendingSave.current = false;
        setSaving(false);
      }
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
          aria-label="프로필 캐릭터 변경"
          disabled={loading || saving}
          onClick={() => setShowPhotoSheet(true)}
        >
          <img className="profile-avatar-background" src={avatarBackground} alt="" />
          <img className="profile-avatar-character" src={avatarImage} alt="" />
        </S.AvatarButton>

        <S.Field $tone={validation.tone}>
          <label htmlFor="profile-nickname">닉네임</label>
          <S.InputWrap $tone={validation.tone}>
            <input
              id="profile-nickname"
              value={nickname}
              maxLength={12}
              disabled={loading || saving}
              aria-invalid={validation.tone === "error"}
              aria-describedby="profile-nickname-status"
              onChange={(event) => changeNickname(event.target.value)}
            />
            {nicknameChanged && nickname && !loading && (
              <button type="button" aria-label="닉네임 지우기" disabled={saving} onClick={() => changeNickname("")}>
                <img src={clearIcon} alt="" />
              </button>
            )}
            <span>{nickname.length}/12</span>
          </S.InputWrap>
          <small id="profile-nickname-status" aria-live="polite">
            {validation.tone === "success" && <img src={validIcon} alt="" />}
            {validation.tone === "error" && <img src={invalidIcon} alt="" />}
            {validation.message || "동행자의 채팅방에 이 이름으로 보여요"}
          </small>
        </S.Field>

        <S.Field>
          <label htmlFor="profile-email">이메일</label>
          <S.DisabledInput>
            <input id="profile-email" value={initialProfile.email} readOnly />
            <span>{liveProfile ? <><img src={googleIcon} alt="" />Google 연동</> : "데모 프로필"}</span>
          </S.DisabledInput>
          <small>로그인 계정의 이메일이라 여기서는 바꿀 수 없어요</small>
        </S.Field>

        <S.Field $tone={introductionAtLimit ? "error" : "default"}>
          <label htmlFor="profile-introduction">한 줄 소개</label>
          <S.InputWrap $tone={introductionAtLimit ? "error" : "default"}>
            <input
              id="profile-introduction"
              value={introduction}
              maxLength={30}
              disabled={loading || saving}
              aria-describedby={introductionAtLimit ? "profile-introduction-limit" : undefined}
              onChange={(event) => setIntroduction(event.target.value)}
            />
            <span>{introduction.length}/30</span>
          </S.InputWrap>
          {introductionAtLimit && <small id="profile-introduction-limit">30자까지 쓸 수 있어요</small>}
        </S.Field>
        {serverError && <S.ErrorNotice role="alert">{serverError}</S.ErrorNotice>}
      </S.Body>

      <S.Cta>
        <button type="button" disabled={!canSave} onClick={() => void save()}>
          {loading ? "프로필을 불러오고 있어요" : saving ? "저장하고 있어요" : "저장하기"}
        </button>
      </S.Cta>

      {showPhotoSheet && (
        <ProfileCharacterSheet current={avatar} title="프로필 사진 변경" confirmLabel="이 캐릭터로 변경"
          onClose={() => setShowPhotoSheet(false)}
          onApply={(value) => { setAvatar(value); setShowPhotoSheet(false); }} />
      )}

      {showLeaveDialog && (
        <SettingsConfirmDialog title={<>수정한 내용을<br />저장하지 않고 나갈까요?</>}
          description={nicknameChanged ? "나가면 바꾼 닉네임이 사라져요" : "나가면 수정한 내용이 사라져요"}
          cancelLabel="나가기" confirmLabel="계속 수정"
          onCancel={() => navigate(routes.my)} onConfirm={() => setShowLeaveDialog(false)}
          onDismiss={() => setShowLeaveDialog(false)} />
      )}
    </S.Page>
  );
}

export default ProfileEditPage;
