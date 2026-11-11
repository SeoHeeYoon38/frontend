import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { canStartGoogleLogin, googleAuthorizationUrl } from "../api/auth";
import { isApiEnabled } from "../api/config";
import brandLogo from "../assets/images/brand-dotlo-logo.png";
import checkAllIcon from "../assets/onboarding/check-all.svg";
import checkIcon from "../assets/onboarding/check.svg";
import clearIcon from "../assets/onboarding/clear.svg";
import googleIcon from "../assets/onboarding/google.svg";
import profileAvatar from "../assets/onboarding/profile-avatar.png";
import profileRing from "../assets/onboarding/profile-ring.svg";
import validCheckIcon from "../assets/onboarding/valid-check.svg";
import welcomeCharacter from "../assets/onboarding/welcome-character.png";
import { routes } from "../config/routes";
import { policyPath, type PolicyDocumentId } from "../data/policyDocuments";
import { parseProfileSettings, PROFILE_STORAGE_KEY, saveProfileSettings, validateNickname } from "../utils/mySettings";
import * as S from "./OnboardingPage.styled";

type AgreementKey = "service" | "privacy" | "age" | "location" | "marketing";

interface OnboardingState {
  agreements?: Record<AgreementKey, boolean>;
  nickname?: string;
  preferences?: string[];
}

const initialAgreements = {
  service: false, privacy: false, age: false, location: false, marketing: false,
};

const agreements: Array<{ key: AgreementKey; required: boolean; label: string; details?: boolean }> = [
  { key: "service", required: true, label: "서비스 이용약관", details: true },
  { key: "privacy", required: true, label: "개인정보 수집 및 이용", details: true },
  { key: "age", required: true, label: "만 14세 이상이에요" },
  { key: "location", required: false, label: "위치 정보 이용", details: true },
  { key: "marketing", required: false, label: "혜택과 이벤트 알림 받기", details: true },
];

const agreementPolicy: Partial<Record<AgreementKey, PolicyDocumentId>> = {
  service: "service",
  privacy: "privacy",
  location: "location",
  marketing: "marketing",
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

function HomeIndicator() {
  return <S.HomeIndicator aria-hidden="true" />;
}

function LoginBackdrop({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <S.LoginScreen>
      <S.LoginHero $withTagline={withTagline}>
        <Logo />
        {withTagline && (
          <>
            <h1>가고 싶은 곳만 고르면<br />여행 코스가 완성돼요</h1>
            <p>샘플 장소를 골라 여행 일정을 만들어 보세요</p>
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
  const [termsOpen, setTermsOpen] = useState(
    () => new URLSearchParams(location.search).get("terms") === "1",
  );
  const [agreementsState, setAgreementsState] = useState(() => onboarding?.agreements ?? initialAgreements);
  const [nickname, setNickname] = useState(() => onboarding?.nickname ?? "하늘");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [error, setError] = useState("");
  const liveGoogleLogin = isApiEnabled() && canStartGoogleLogin();

  const displayNickname = onboarding?.nickname ?? "하늘";
  const allAgreed = useMemo(
    () => agreements.every(({ key }) => agreementsState[key]),
    [agreementsState],
  );
  const requiredAgreed = agreements
    .filter(({ required }) => required)
    .every(({ key }) => agreementsState[key]);

  const toggleAll = () => {
    const next = !allAgreed;
    setAgreementsState({ service: next, privacy: next, age: next, location: next, marketing: next });
  };

  const continueAfterTerms = () => {
    if (!liveGoogleLogin) {
      navigate(routes.onboardingProfile);
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

  if (location.pathname === routes.onboardingProfile) {
    const validation = validateNickname(nickname);
    return (
      <S.FlowScreen>
        <S.FlowBody>
          <S.Progress aria-label="온보딩 1단계"><i /><i /></S.Progress>
          <h1>어떻게 불러드릴까요?</h1>
          <S.Avatar>
            <img className="ring" src={profileRing} alt="" />
            <img className="photo" src={profileAvatar} alt="프로필 캐릭터" />
          </S.Avatar>
          <S.FieldLabel htmlFor="onboarding-nickname">닉네임</S.FieldLabel>
          <S.NicknameField $valid={validation.valid}>
            <input
              id="onboarding-nickname"
              maxLength={12}
              value={nickname}
              aria-invalid={!validation.valid}
              onChange={(event) => setNickname(event.target.value)}
            />
            <small>{nickname.length}/12</small>
            {nickname && (
              <button type="button" aria-label="닉네임 지우기" onClick={() => setNickname("")}>
                <img src={clearIcon} alt="" />
              </button>
            )}
          </S.NicknameField>
          <S.ValidText $error={!validation.valid} role="status">
            {validation.valid && <img src={validCheckIcon} alt="" />}
            {validation.valid ? "데모에서 사용할 수 있는 닉네임이에요" : validation.message}
          </S.ValidText>
        </S.FlowBody>
        <S.BottomButton
          type="button"
          disabled={!validation.valid}
          onClick={() => navigate(routes.onboardingPreferences, { state: { nickname: nickname.trim() } })}
        >
          다음
        </S.BottomButton>
        <HomeIndicator />
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
    const complete = (chosenPreferences: string[]) => {
      navigate(routes.onboardingComplete, {
        state: { nickname: displayNickname, preferences: chosenPreferences },
      });
    };
    return (
      <S.FlowScreen>
        <S.SkipButton type="button" onClick={() => complete([])}>건너뛰기</S.SkipButton>
        <S.FlowBody>
          <S.Progress $complete aria-label="온보딩 2단계"><i /><i /></S.Progress>
          <h1>어떤 여행을 좋아하세요?</h1>
          <S.Description>고른 취향은 이 브라우저의 데모 프로필에 저장해요.</S.Description>
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
        </S.FlowBody>
        <S.BottomButton type="button" onClick={() => complete(preferences)}>선택 완료</S.BottomButton>
        <HomeIndicator />
      </S.FlowScreen>
    );
  }

  if (location.pathname === routes.onboardingComplete) {
    const startDemo = () => {
      try {
        const profile = parseProfileSettings(localStorage.getItem(PROFILE_STORAGE_KEY));
        saveProfileSettings(window.localStorage, {
          nickname: displayNickname,
          email: profile?.email ?? "",
          introduction: profile?.introduction ?? "",
          avatar: profile?.avatar ?? "blue",
          travelPreferences: onboarding?.preferences ?? [],
        });
      } catch {
        setError("브라우저에 데모 프로필을 저장하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      navigate(routes.home);
    };
    return (
      <S.CompleteScreen>
        <S.CompleteContent>
          <img src={welcomeCharacter} alt="반갑게 인사하는 도틀로 캐릭터" />
          <h1>{displayNickname}님, 반가워요!</h1>
          <p>이제 가고 싶은 곳을 모아<br />나만의 여행 코스를 만들어 보세요</p>
          {error && <S.ValidText $error role="alert">{error}</S.ValidText>}
        </S.CompleteContent>
        <S.BottomButton type="button" onClick={startDemo}>시작하기</S.BottomButton>
        <HomeIndicator />
      </S.CompleteScreen>
    );
  }

  return (
    <S.LoginShell>
      <LoginBackdrop withTagline={termsOpen} />
      {!termsOpen && (
        <S.LoginButtons>
          <S.LoginNotice>
            {liveGoogleLogin
              ? "Google 계정으로 로그인하고 내 여행을 안전하게 불러와요."
              : "Google 계정 없이 로그인과 가입 흐름을 체험할 수 있어요."}
          </S.LoginNotice>
          <S.ProviderButton type="button" onClick={() => setTermsOpen(true)}>
            <img src={googleIcon} alt="" />
            {liveGoogleLogin ? "Google로 시작하기" : "Google 로그인 데모 시작"}
          </S.ProviderButton>
          <S.GuestButton type="button" onClick={() => navigate(routes.home)}>먼저 둘러볼게요</S.GuestButton>
        </S.LoginButtons>
      )}
      {termsOpen && (
        <>
          <S.Dim onClick={() => setTermsOpen(false)} />
          <S.TermsSheet role="dialog" aria-modal="true" aria-labelledby="terms-title">
            <S.Grabber />
            <h2 id="terms-title">약관 동의 체험</h2>
            <p>필수 항목을 선택하면 데모 프로필을 만들 수 있어요.</p>
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
      <HomeIndicator />
    </S.LoginShell>
  );
}

export default OnboardingPage;
