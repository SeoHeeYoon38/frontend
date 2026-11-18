import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import chevronIcon from "../assets/icons/nav-chevron-right-muted.svg";
import blueAvatar from "../assets/images/character-blue.webp";
import purpleAvatar from "../assets/images/character-purple.webp";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import { routes } from "../config/routes";
import { policyPath, type PolicyDocumentId } from "../data/policyDocuments";
import { readProfileSettings } from "../utils/mySettings";
import * as S from "./AccountSettingsPage.styled";
import { getMyStats, logout, type UserResponse } from "../api/auth";
import { hasAuthSession } from "../api/tokenStorage";
import { myProfile } from "../data/mocks/myData";

const policies: Array<{ id: PolicyDocumentId; label: string }> = [
  { id: "service", label: "서비스 이용약관" },
  { id: "privacy", label: "개인정보 처리방침" },
  { id: "location", label: "위치기반 서비스 이용약관" },
];

function AccountSettingsPage() {
  const navigate = useNavigate();
  const account = useOutletContext<UserResponse | undefined>();
  const [profile] = useState(() => readProfileSettings(window.localStorage));
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const signedIn = hasAuthSession();
  const [googlePlaceCount, setGooglePlaceCount] = useState(myProfile.googlePlaceCount);
  const avatar = account
    ? account.profileImageUrl || (account.characterId === 2 ? purpleAvatar : blueAvatar)
    : profile.avatar === "purple" ? purpleAvatar : blueAvatar;
  const joinedDate = account?.createdAt.split("T")[0].split("-").map(Number);

  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    void getMyStats(controller.signal).then(
      (stats) => setGooglePlaceCount(stats.savedPlaceCount),
      () => undefined,
    );
    return () => controller.abort();
  }, [signedIn]);

  async function signOut() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // 서버가 토큰을 거부해도 이 브라우저의 토큰은 제거되어 있습니다.
    } finally {
      navigate(routes.login, { replace: true });
    }
  }

  return (
    <S.Page>
      <S.Header>
        <Link to={routes.my} aria-label="마이 화면으로 돌아가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1>계정 관리</h1>
      </S.Header>

      <S.AccountCard>
        <S.Avatar><img src={avatar} alt="" /></S.Avatar>
        <span>
          <strong>{account?.email || (signedIn ? "내 계정" : profile.nickname)}</strong>
          {signedIn && (
            <small>
              Google 로그인
              {joinedDate?.length === 3 && joinedDate.every(Number.isFinite) && (
                <b>{joinedDate[0]}년 {joinedDate[1]}월 {joinedDate[2]}일 가입</b>
              )}
            </small>
          )}
          {!signedIn && <small>브라우저에 저장되는 데모 프로필</small>}
        </span>
      </S.AccountCard>

      <S.Band />
      <S.Section>
        <h2>연결된 서비스</h2>
        <S.ServiceRow>
          <S.ServiceLogo><img src={googleMapsLogo} alt="Google Maps" /></S.ServiceLogo>
          <span>
            <strong>Google Maps</strong>
            <small><i data-linked="true" />연동됨, 저장 장소 {googlePlaceCount}곳</small>
          </span>
          <Link to={routes.googleMapsSettings}>관리</Link>
        </S.ServiceRow>
      </S.Section>

      <S.Band />
      <S.Section>
        <h2>약관과 개인정보</h2>
        {policies.map((policy) => (
          <S.PolicyButton
            as={Link}
            to={policyPath(policy.id)}
            key={policy.id}
          >
            {policy.label}<img src={chevronIcon} alt="" />
          </S.PolicyButton>
        ))}
        <S.AccountActions>
          {signedIn ? (
            <button type="button" disabled={isLoggingOut} onClick={() => void signOut()}>
              {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
            </button>
          ) : <Link to={routes.login}>로그인</Link>}
          {signedIn && <><i aria-hidden="true" /><Link to={routes.withdrawal}>회원 탈퇴</Link></>}
        </S.AccountActions>
      </S.Section>
      <S.HomeIndicator />

    </S.Page>
  );
}

export default AccountSettingsPage;
