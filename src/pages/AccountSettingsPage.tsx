import { useState } from "react";
import { Link } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import chevronIcon from "../assets/icons/nav-chevron-right-muted.svg";
import blueAvatar from "../assets/images/character-blue.webp";
import purpleAvatar from "../assets/images/character-purple.webp";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import { routes } from "../config/routes";
import { policyPath, type PolicyDocumentId } from "../data/policyDocuments";
import { readProfileSettings } from "../utils/mySettings";
import * as S from "./AccountSettingsPage.styled";

const policies: Array<{ id: PolicyDocumentId; label: string }> = [
  { id: "service", label: "서비스 이용약관" },
  { id: "privacy", label: "개인정보 처리방침" },
  { id: "location", label: "위치기반 서비스 이용약관" },
];

function AccountSettingsPage() {
  const [profile] = useState(() => readProfileSettings(window.localStorage));
  const avatar = profile.avatar === "purple" ? purpleAvatar : blueAvatar;

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
          <strong>{profile.nickname}</strong>
          <small>브라우저에 저장되는 데모 프로필</small>
        </span>
      </S.AccountCard>

      <S.Band />
      <S.Section>
        <h2>장소 가져오기</h2>
        <S.ServiceRow>
          <S.ServiceLogo><img src={googleMapsLogo} alt="Google Maps" /></S.ServiceLogo>
          <span>
            <strong>Google Maps</strong>
            <small>Takeout 파일 또는 공개 목록 링크</small>
          </span>
          <Link to={routes.googleMapsSettings}>안내</Link>
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
          <Link to={routes.login}>로그인 데모</Link>
          <i />
          <Link to={routes.withdrawal}>회원 탈퇴</Link>
        </S.AccountActions>
      </S.Section>
      <S.HomeIndicator />

    </S.Page>
  );
}

export default AccountSettingsPage;
