import { Link } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import { routes } from "../config/routes";
import { isApiEnabled } from "../api/config";
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
          <small>공개 목록 링크나 Takeout 파일을 가져올 수 있어요.</small>
        </span>
      </S.Status>

      <S.Band />
      <S.ListSection>
        <h2>가져오기 방법</h2>
        <p>Google Maps의 저장 목록을 공개로 설정한 뒤 공유 링크를 복사해 주세요.</p>
        <p>Google Takeout에서 ‘저장됨’을 내보낸 ZIP·CSV 파일(최대 20MB)도 가져올 수 있어요.</p>
        {!isApiEnabled() && <p>데모에서는 파일과 링크 형식을 확인한 뒤 샘플 장소를 표시해요.</p>}
        <Link to={routes.createTrip}>AI 맞춤 여행 만들기 →</Link>
      </S.ListSection>
      <S.HomeIndicator />
    </S.Page>
  );
}

export default GoogleMapsSettingsPage;
