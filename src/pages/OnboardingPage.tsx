import { useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import SheetHandle from "../components/common/SheetHandle";
import { onboardingPreferencesToInput } from "../api/adapters";
import {
  canStartGoogleLogin,
  completeSignup,
  googleAuthorizationUrl,
  hasRecentGoogleLogin,
} from "../api/auth";
import { ApiError } from "../api/client";
import { apiMode, isApiEnabled } from "../api/config";
import { saveUserPreferences } from "../api/preferences";
import { hasAuthSession } from "../api/tokenStorage";
import brandLogo from "../assets/images/brand-dotlo-logo.png";
import checkAllIcon from "../assets/onboarding/check-all.svg";
import checkIcon from "../assets/onboarding/check.svg";
import clearIcon from "../assets/onboarding/clear.svg";
import googleIcon from "../assets/onboarding/google.svg";
import profileRing from "../assets/onboarding/profile-ring.svg";
import introOne from "../assets/onboarding/intro-1.png";
import introTwo from "../assets/onboarding/intro-2.png";
import introThree from "../assets/onboarding/intro-3.png";
import ProfileCharacterSheet from "../components/common/ProfileCharacterSheet";
import validCheckIcon from "../assets/onboarding/valid-check.svg";
import welcomeCharacter from "../assets/onboarding/welcome-character.png";
import { routes } from "../config/routes";
import useNicknameAvailability from "../hooks/useNicknameAvailability";
import { policyPath, type PolicyDocumentId } from "../data/policyDocuments";
import { parseProfileSettings, PROFILE_STORAGE_KEY, profileAvatarId, saveProfileSettings, validateNickname, validateNicknameFormat } from "../utils/mySettings";
import { profileCharacter } from "../config/profileCharacters";
import { allowDemoAuthentication } from "../utils/authNavigation";
import { takePendingLoginPath } from "../utils/navigation";
import * as S from "./OnboardingPage.styled";
import type { ProfileAvatar } from "../utils/mySettings";

type AgreementKey = "service" | "privacy" | "age" | "location";
type AgreementState = Record<AgreementKey, boolean>;

interface OnboardingState {
  loginError?: string;
  agreements?: Record<AgreementKey, boolean>;
  nickname?: string;
  preferences?: string[];
  email?: string;
  introduction?: string;
  avatar?: ProfileAvatar;
}

const featureIntroductions = [
  { image: introOne, title: "구글맵에 저장해 둔 장소를\n한 번에 불러와요", description: "가고 싶던 곳을 다시 찾을 필요 없어요" },
  { image: introTwo, title: "AI가 동선에 맞춰\n여행 코스를 짜드려요", description: "누구와, 며칠 가는지만 알려주세요" },
  { image: introThree, title: "다른 여행자의 코스도\n내 일정으로 가져올 수 있어요", description: "그대로 따라가도 되고, 내 취향대로 고쳐도 돼요" },
] as const;

const ONBOARDING_NICKNAME_STORAGE_KEY = "dotlo:onboarding:nickname";
const ONBOARDING_AGREEMENTS_STORAGE_KEY = "dotlo:onboarding:agreements";

const initialAgreements: AgreementState = {
  service: false, privacy: false, age: false, location: false,
};

function readStoredAgreements(): AgreementState | null {
  try {
    const stored = sessionStorage.getItem(ONBOARDING_AGREEMENTS_STORAGE_KEY);
    if (!stored) return null;
    const value = JSON.parse(stored) as Partial<AgreementState>;
    const keys: AgreementKey[] = ["service", "privacy", "age", "location"];
    return keys.every((key) => typeof value[key] === "boolean")
      ? (value as AgreementState)
      : null;
  } catch {
    return null;
  }
}

const agreements: Array<{ key: AgreementKey; required: boolean; label: string; details?: boolean }> = [
  { key: "service", required: true, label: "서비스 이용약관", details: true },
  { key: "privacy", required: true, label: "개인정보 수집 및 이용", details: true },
  { key: "age", required: true, label: "만 14세 이상이에요" },
  { key: "location", required: false, label: "위치 정보 이용", details: true },
];

const agreementPolicy: Partial<Record<AgreementKey, PolicyDocumentId>> = {
  service: "service",
  privacy: "privacy",
  location: "location",
};

const preferenceOptions = [
  "맛집 탐방",
  "카페 투어",
  "자연 풍경",
  "역사와 문화",
  "쇼핑",
  "야경",
  "사진 명소",
  "액티비티",
  "온천과 휴식",
  "골목 산책",
];

function Logo() {
  return (
    <S.Logo aria-label="Dotlo">
      <S.SymbolCrop><img src={brandLogo} alt="" /></S.SymbolCrop>
      <S.WordmarkCrop><img src={brandLogo} alt="" /></S.WordmarkCrop>
    </S.Logo>
  );
}

function LoginBackdrop({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <S.LoginScreen>
      <S.LoginHero>
        <Logo />
        {withTagline && (
          <>
            <h1>가고 싶은 곳만 고르면<br />여행 코스가 완성돼요</h1>
            <p>구글맵에 저장한 장소로 AI가 일정을 짜드려요</p>
          </>
        )}
      </S.LoginHero>
    </S.LoginScreen>
  );
}

function OnboardingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const onboarding = location.state as OnboardingState | null;
  const termsOpen =
    location.pathname === routes.onboardingTerms ||
    new URLSearchParams(location.search).get("terms") === "1";
  const [agreementsState, setAgreementsState] = useState(
    () => onboarding?.agreements ?? readStoredAgreements() ?? initialAgreements,
  );
  const [nickname, setNickname] = useState(
    () =>
      onboarding?.nickname ??
      sessionStorage.getItem(ONBOARDING_NICKNAME_STORAGE_KEY) ??
      "",
  );
  const [preferences, setPreferences] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<ProfileAvatar>(profileAvatarId(onboarding?.avatar));
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [featureIndex, setFeatureIndex] = useState<number>();
  const [recentGoogleLogin] = useState(hasRecentGoogleLogin);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const profileRequestPending = useRef(false);
  const [error, setError] = useState(onboarding?.loginError ?? "");
  const liveGoogleLogin = isApiEnabled() && canStartGoogleLogin();
  const demoAuthentication = allowDemoAuthentication(import.meta.env.DEV, apiMode);
  const liveSession = isApiEnabled() && hasAuthSession();
  const nicknameText = nickname.trim();
  const format = validateNicknameFormat(nicknameText);
  const { availability, clear: clearNicknameCheck, markTaken } = useNicknameAvailability(
    liveSession && location.pathname === routes.onboardingProfile && format.valid ? nicknameText : undefined,
  );

  const displayNickname =
    onboarding?.nickname ??
    sessionStorage.getItem(ONBOARDING_NICKNAME_STORAGE_KEY) ??
    "하늘";
  const allAgreed = useMemo(
    () => agreements.every(({ key }) => agreementsState[key]),
    [agreementsState],
  );
  const requiredAgreed = agreements
    .filter(({ required }) => required)
    .every(({ key }) => agreementsState[key]);

  const toggleAll = () => {
    const next = !allAgreed;
    setAgreementsState({ service: next, privacy: next, age: next, location: next });
  };

  const startGoogleLogin = () => {
    if (!liveGoogleLogin && demoAuthentication) {
      navigate(routes.onboardingTerms);
      return;
    }
    if (!liveGoogleLogin) {
      setError("Google 로그인 설정을 확인하고 있어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    try {
      window.location.assign(googleAuthorizationUrl());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Google 로그인을 시작하지 못했어요.",
      );
    }
  };

  const continueAfterTerms = () => {
    sessionStorage.setItem(
      ONBOARDING_AGREEMENTS_STORAGE_KEY,
      JSON.stringify(agreementsState),
    );
    navigate(routes.onboardingProfile, {
      state: { agreements: agreementsState },
    });
  };

  if (
    location.pathname === routes.onboardingProfile &&
    liveSession &&
    !requiredAgreed
  ) {
    return <Navigate to={routes.onboardingTerms} replace />;
  }

  if (location.pathname === routes.onboardingProfile) {
    const validation = liveSession ? format : validateNickname(nickname);
    const nicknameEmpty = nicknameText.length === 0;
    const nicknameInvalid = !nicknameEmpty && (!validation.valid || availability === "taken");
    const canContinue = validation.valid && (!liveSession || availability === "available");
    const changeNickname = (value: string) => {
      setNickname(value);
      if (value.trim() !== nicknameText) clearNicknameCheck();
      setProfileError("");
    };
    const continueProfile = async () => {
      if (!canContinue || savingProfile || profileRequestPending.current) return;
      setProfileError("");
      const email = onboarding?.email;
      const introduction = onboarding?.introduction;

      if (liveSession) {
        profileRequestPending.current = true;
        setSavingProfile(true);
        try {
          await completeSignup({
            agreements: {
              terms: agreementsState.service,
              privacy: agreementsState.privacy,
              age14: agreementsState.age,
              location: agreementsState.location,
            },
            nickname: nicknameText,
            characterId: avatar,
          });
        } catch (reason) {
          if (reason instanceof ApiError && reason.code === "NICKNAME_TAKEN") {
            markTaken(nicknameText);
            return;
          }
          setProfileError(
            reason instanceof Error
              ? reason.message
              : "가입 정보를 저장하지 못했어요. 다시 시도해 주세요.",
          );
          return;
        } finally {
          profileRequestPending.current = false;
          setSavingProfile(false);
        }
      }

      sessionStorage.setItem(ONBOARDING_NICKNAME_STORAGE_KEY, nicknameText);
      navigate(routes.onboardingPreferences, {
        state: {
          agreements: agreementsState,
          nickname: nicknameText,
          avatar,
          email,
          introduction,
        },
      });
    };
    const validationMessage = !validation.valid ? validation.message
      : availability === "taken" ? "이미 다른 사람이 쓰고 있는 닉네임이에요"
      : availability === "error" ? "닉네임을 확인하지 못했어요. 다시 입력해 주세요"
      : canContinue ? "사용할 수 있는 닉네임이에요"
      : "닉네임을 확인하고 있어요";
    return (
      <S.FlowScreen>
        <S.FlowBody>
          <S.Progress aria-label="온보딩 1단계"><i /><i /></S.Progress>
          <h1>어떻게 불러드릴까요?</h1>
          <S.Avatar type="button" aria-label="프로필 캐릭터 선택" disabled={savingProfile} onClick={() => setShowCharacterSheet(true)}>
            <img className="ring" src={profileRing} alt="" />
            <img className="photo" src={profileCharacter(avatar).image} alt="" />
          </S.Avatar>
          <S.FieldLabel htmlFor="onboarding-nickname">닉네임</S.FieldLabel>
          <S.NicknameField $valid={!nicknameInvalid}>
            <input
              id="onboarding-nickname"
              maxLength={12}
              value={nickname}
              aria-invalid={nicknameInvalid}
              readOnly={savingProfile}
              onChange={(event) => changeNickname(event.target.value)}
            />
            <small>{nickname.length}/12</small>
            {nickname && (
              <button
                type="button"
                aria-label="닉네임 지우기"
                disabled={savingProfile}
                onClick={() => changeNickname("")}
              >
                <img src={clearIcon} alt="" />
              </button>
            )}
          </S.NicknameField>
          {(!nicknameEmpty || profileError) && <S.ValidText $error={nicknameInvalid || availability === "error" || Boolean(profileError)} role="status">
            {canContinue && !savingProfile && !profileError && <img src={validCheckIcon} alt="" />}
            {profileError || (savingProfile ? "가입 정보를 저장하고 있어요" : validationMessage)}
          </S.ValidText>}
        </S.FlowBody>
        <S.BottomButton
          type="button"
          disabled={!canContinue || savingProfile}
          onClick={() => void continueProfile()}
        >
          {savingProfile ? "저장하고 있어요" : "다음"}
        </S.BottomButton>
        {showCharacterSheet && (
          <ProfileCharacterSheet current={avatar} title="프로필 사진" description="기본 이미지" onClose={() => setShowCharacterSheet(false)}
            onApply={(value) => { setAvatar(value); setShowCharacterSheet(false); }} />
        )}
      </S.FlowScreen>
    );
  }

  if (location.pathname === routes.onboardingPreferences) {
    const togglePreference = (preference: string) => {
      setPreferences((current) =>
        current.includes(preference)
          ? current.filter((item) => item !== preference)
          : [...current, preference],
      );
    };
    const complete = async (chosenPreferences: string[]) => {
      if (savingPreferences) return;
      let email = onboarding?.email;
      let introduction = onboarding?.introduction;

      if (liveSession) {
        setSavingPreferences(true);
        setError("");
        try {
          if (chosenPreferences.length) {
            await saveUserPreferences(
              onboardingPreferencesToInput(chosenPreferences),
            );
          }
        } catch (reason) {
          setError(
            reason instanceof Error
              ? reason.message
              : "여행 취향을 저장하지 못했어요. 다시 시도해 주세요.",
          );
          setSavingPreferences(false);
          return;
        }
        setSavingPreferences(false);
      }
      navigate(routes.onboardingComplete, {
        state: {
          nickname: displayNickname,
          preferences: chosenPreferences,
          avatar: onboarding?.avatar ?? avatar,
          email,
          introduction,
        },
      });
    };
    return (
      <S.FlowScreen>
        <S.SkipButton
          type="button"
          disabled={savingPreferences}
          onClick={() => void complete([])}
        >
          건너뛰기
        </S.SkipButton>
        <S.FlowBody>
          <S.Progress $complete aria-label="온보딩 2단계"><i /><i /></S.Progress>
          <h1>어떤 여행을 좋아하세요?</h1>
          <S.Description>
            골라주시면 취향에 맞는 코스를 먼저 보여드려요
          </S.Description>
          <S.Chips>
            {preferenceOptions.map((preference) => (
              <button
                type="button"
                key={preference}
                aria-pressed={preferences.includes(preference)}
                onClick={() => togglePreference(preference)}
              >
                {preference}
              </button>
            ))}
          </S.Chips>
          <S.SelectionCount>{preferences.length}개 선택했어요</S.SelectionCount>
          {error && <S.ValidText $error role="alert">{error}</S.ValidText>}
        </S.FlowBody>
        <S.BottomButton
          type="button"
          disabled={savingPreferences}
          onClick={() => void complete(preferences)}
        >
          {savingPreferences ? "취향을 저장하고 있어요" : "선택 완료"}
        </S.BottomButton>
      </S.FlowScreen>
    );
  }

  if (location.pathname === routes.onboardingComplete) {
    const finishOnboarding = () => {
      try {
        const profile = parseProfileSettings(localStorage.getItem(PROFILE_STORAGE_KEY));
        saveProfileSettings(window.localStorage, {
          nickname: displayNickname,
          email: onboarding?.email ?? profile?.email ?? "",
          introduction: onboarding?.introduction ?? profile?.introduction ?? "",
          avatar: onboarding?.avatar ?? avatar,
          travelPreferences: onboarding?.preferences ?? [],
        });
        sessionStorage.removeItem(ONBOARDING_NICKNAME_STORAGE_KEY);
        sessionStorage.removeItem(ONBOARDING_AGREEMENTS_STORAGE_KEY);
      } catch {
        setError("브라우저에 데모 프로필을 저장하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      setFeatureIndex(0);
    };
    if (featureIndex !== undefined) {
      const feature = featureIntroductions[featureIndex];
      const last = featureIndex === featureIntroductions.length - 1;
      const finishIntroduction = () => navigate(takePendingLoginPath(sessionStorage) ?? routes.home, { replace: true });
      return (
        <S.FeatureScreen>
          {!last && <S.FeatureSkip type="button" onClick={finishIntroduction}>건너뛰기</S.FeatureSkip>}
          <S.FeatureIllustration $last={last}><img src={feature.image} alt="" /></S.FeatureIllustration>
          <S.FeatureDescription aria-live="polite">
            <S.FeatureDots aria-label={`기능 소개 ${featureIndex + 1}/3`}>
              {featureIntroductions.map((item, index) => <span key={item.title} data-active={index === featureIndex} />)}
            </S.FeatureDots>
            <h1>{feature.title}</h1>
            <p>{feature.description}</p>
          </S.FeatureDescription>
          <S.BottomButton type="button" onClick={last ? finishIntroduction : () => setFeatureIndex(featureIndex + 1)}>
            {last ? "시작하기" : "다음"}
          </S.BottomButton>
        </S.FeatureScreen>
      );
    }
    return (
      <S.CompleteScreen>
        <S.CompleteContent>
          <img src={welcomeCharacter} alt="반갑게 인사하는 도틀로 캐릭터" />
          <h1>{displayNickname}님, 반가워요!</h1>
          <p>이제 가고 싶은 곳을 모아<br />나만의 여행 코스를 만들어 보세요</p>
          {error && <S.ValidText $error role="alert">{error}</S.ValidText>}
        </S.CompleteContent>
        <S.BottomButton type="button" onClick={finishOnboarding}>시작하기</S.BottomButton>
      </S.CompleteScreen>
    );
  }

  return (
    <S.LoginShell>
      <LoginBackdrop withTagline={termsOpen} />
      {!termsOpen && (
        <S.LoginButtons>
          <S.ProviderButton
            type="button"
            disabled={!liveGoogleLogin && !demoAuthentication}
            onClick={startGoogleLogin}
          >
            {liveGoogleLogin && recentGoogleLogin && <S.RecentLogin>최근 로그인</S.RecentLogin>}
            <img src={googleIcon} alt="" />
            {liveGoogleLogin
              ? "Google로 시작하기"
              : demoAuthentication
                ? "Google 로그인 데모 시작"
                : "Google 로그인 준비 중"}
          </S.ProviderButton>
          {error && <S.ValidText $error role="alert">{error}</S.ValidText>}
          <S.GuestButton type="button" onClick={() => navigate(routes.courses)}>
            먼저 둘러볼게요
          </S.GuestButton>
        </S.LoginButtons>
      )}
      {termsOpen && (
        <>
          <S.Dim
            type="button"
            aria-label="약관 닫기"
            tabIndex={liveSession ? -1 : undefined}
            onClick={() => {
              if (!liveSession) navigate(routes.login);
            }}
          />
          <S.TermsSheet role="dialog" aria-modal="true" aria-labelledby="terms-title">
            <SheetHandle onClose={() => { if (!liveSession) navigate(routes.login); }} />
            <h2 id="terms-title">약관에 동의해 주세요</h2>
            <S.AllAgreement type="button" aria-pressed={allAgreed} onClick={toggleAll}>
              <S.Check $large $checked={allAgreed}>{allAgreed && <img src={checkAllIcon} alt="" />}</S.Check>
              <span><strong>전체 동의</strong><small>선택 항목을 포함한 모든 약관에 동의해요</small></span>
            </S.AllAgreement>
            <S.TermDivider />
            <S.TermList>
              {agreements.map((agreement) => (
                <li key={agreement.key}>
                  <button
                    type="button"
                    aria-pressed={agreementsState[agreement.key]}
                    onClick={() => setAgreementsState((current) => ({ ...current, [agreement.key]: !current[agreement.key] }))}
                  >
                    <S.Check $checked={agreementsState[agreement.key]}>
                      {agreementsState[agreement.key] && <img src={checkIcon} alt="" />}
                    </S.Check>
                    <span data-optional={!agreement.required}>[{agreement.required ? "필수" : "선택"}]</span>
                    <b>{agreement.label}</b>
                  </button>
                  {agreement.details && agreementPolicy[agreement.key] && (
                    <button
                      type="button"
                      onClick={() => navigate(policyPath(agreementPolicy[agreement.key]!, true), {
                        state: { agreements: agreementsState },
                      })}
                    >
                      보기
                    </button>
                  )}
                </li>
              ))}
            </S.TermList>
            <S.TermsSubmit
              type="button"
              disabled={!requiredAgreed}
              onClick={continueAfterTerms}
            >
              동의하고 시작하기
            </S.TermsSubmit>
            {error && <S.ValidText $error role="alert">{error}</S.ValidText>}
          </S.TermsSheet>
        </>
      )}
    </S.LoginShell>
  );
}

export default OnboardingPage;
