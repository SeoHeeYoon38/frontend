import { Link } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import { routes } from "../config/routes";
import * as S from "./GoogleMapsSettingsPage.styled";

function GoogleMapsSettingsPage() {
  return (
    <S.Page>
      <S.Header>
        <Link to={routes.accountSettings} aria-label="계정 관리로 돌아가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1>Google Maps 장소 가져오기</h1>
      </S.Header>

      <S.Status>
        <S.Logo><img src={googleMapsLogo} alt="" /></S.Logo>
        <span>
          <strong>Google Maps 저장 장소</strong>
          <small>여행을 만들 때 가져오기 흐름을 체험할 수 있어요.</small>
        </span>
      </S.Status>

      <S.Band />
      <S.ListSection>
        <h2>가져오기 방법</h2>
        <p>Google Takeout에서 ‘저장됨’을 내보낸 ZIP·CSV 파일(최대 20MB)이나 공개 목록 공유 링크를 선택할 수 있어요.</p>
        <p>데모에서는 파일과 링크 형식만 확인하고 샘플 장소를 표시해요.</p>
        <Link to={routes.createTrip}>AI 맞춤 여행 만들기 →</Link>
      </S.ListSection>
      <S.HomeIndicator />
    </S.Page>
  );
}

export default GoogleMapsSettingsPage;
