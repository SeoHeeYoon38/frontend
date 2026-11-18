import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import chevronIcon from "../assets/icons/nav-chevron-right-muted.svg";
import { profileCharacter } from "../config/profileCharacters";
import googleMapsLogo from "../assets/figma/course-map-google.png";
import googleIcon from "../assets/onboarding/google.svg";
import { routes } from "../config/routes";
import { policyPath, type PolicyDocumentId } from "../data/policyDocuments";
import { readProfileSettings } from "../utils/mySettings";
import * as S from "./AccountSettingsPage.styled";
import { getMe, logout, type UserResponse } from "../api/auth";
import { hasAuthSession } from "../api/tokenStorage";
import SettingsConfirmDialog from "../components/common/SettingsConfirmDialog";
import useImportedGooglePlaces from "../hooks/useImportedGooglePlaces";

const policies: Array<{ id: PolicyDocumentId; label: string }> = [
  { id: "service", label: "서비스 이용약관" },
  { id: "privacy", label: "개인정보 처리방침" },
  { id: "location", label: "위치기반 서비스 이용약관" },
];

function AccountSettingsPage() {
  const navigate = useNavigate();
  const activeAccount = useOutletContext<UserResponse | undefined>();
  const [updatedAccount, setUpdatedAccount] = useState<UserResponse>();
  const account = updatedAccount ?? activeAccount;
  const [profile] = useState(() => readProfileSettings(window.localStorage));
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const signedIn = hasAuthSession();
  const imported = useImportedGooglePlaces();
  const avatar = account
    ? profileCharacter(account.characterId).image
    : profileCharacter(profile.avatar).image;
  const joinedDate = account?.createdAt.match(/^(\d{4})-(\d{2})-(\d{2})/)?.slice(1).map(Number);

  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    void getMe(controller.signal).then(
      (user) => { if (!controller.signal.aborted) setUpdatedAccount(user); },
      () => undefined,
    );
    return () => controller.abort();
  }, [signedIn]);

  async function signOut() {
    if (isLoggingOut) return;
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
              <S.Provider><img src={googleIcon} alt="" />Google 로그인</S.Provider>
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
          <S.ServiceLogo><img src={googleMapsLogo} alt="" /></S.ServiceLogo>
          <span>
            <strong>Google Maps</strong>
            <small><i data-linked={imported.count > 0} />
              {imported.count ? `가져온 장소 ${imported.count}곳` : imported.pending ? "장소 확인 중" : "저장 장소 가져오기"}
            </small>
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
            <button type="button" onClick={() => setConfirmLogout(true)}>로그아웃</button>
          ) : <Link to={routes.login}>로그인</Link>}
          {signedIn && <><i aria-hidden="true" /><Link to={routes.withdrawal}>회원 탈퇴</Link></>}
        </S.AccountActions>
      </S.Section>
      {confirmLogout && (
        <SettingsConfirmDialog title="로그아웃할까요?"
          description={<>다시 로그인하면 저장한 장소와<br />여행 일정을 그대로 볼 수 있어요</>}
          confirmLabel={isLoggingOut ? "로그아웃 중…" : "로그아웃"} pending={isLoggingOut}
          onCancel={() => setConfirmLogout(false)} onConfirm={() => void signOut()} />
      )}
    </S.Page>
  );
}

export default AccountSettingsPage;
