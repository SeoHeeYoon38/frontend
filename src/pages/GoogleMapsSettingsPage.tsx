import { useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import googleMapsLogo from "../assets/figma/course-map-google.png";
import refreshIcon from "../assets/figma/my-maps-refresh.svg";
import importedIcon from "../assets/figma/my-maps-imported.svg";
import type { UserResponse } from "../api/auth";
import { routes } from "../config/routes";
import useImportedGooglePlaces from "../hooks/useImportedGooglePlaces";
import SettingsConfirmDialog from "../components/common/SettingsConfirmDialog";
import * as S from "./GoogleMapsSettingsPage.styled";

function GoogleMapsSettingsPage() {
  const account = useOutletContext<UserResponse | undefined>();
  const fromMyHome = useLocation().state?.fromMyHome === true;
  const imported = useImportedGooglePlaces();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const hasImported = imported.count > 0;
  const checkedTime = imported.checkedAt && new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(imported.checkedAt);

  return (
    <S.Page>
      <S.Header>
        <Link to={fromMyHome ? routes.my : routes.accountSettings} aria-label={fromMyHome ? "마이 화면으로 돌아가기" : "계정 관리로 돌아가기"}>
          <img src={backIcon} alt="" />
        </Link>
        <h1>Google Maps 연동</h1>
      </S.Header>

      <S.Status>
        <S.Logo><img src={googleMapsLogo} alt="" /></S.Logo>
        <span>
          <strong>Google Maps {hasImported && <><i aria-hidden="true" /><b>연동됨</b></>}</strong>
          {account?.email && <small>{account.email}</small>}
        </span>
      </S.Status>

      <S.Imported>
        <span>
          <strong>불러온 장소 <b>{imported.checkedAt ? imported.count + "곳" : "—"}</b></strong>
          {checkedTime && <small>마지막 확인 {checkedTime}</small>}
        </span>
        <button type="button" disabled={imported.pending} onClick={imported.reload}>
          <img src={refreshIcon} alt="" />{imported.pending ? "불러오는 중" : "다시 불러오기"}
        </button>
      </S.Imported>

      <S.Band />
      <S.ListSection>
        <h2>불러온 목록</h2>
        {imported.error && <p role="alert">{imported.error}</p>}
        {imported.lists.map((list) => (
          <S.CheckRow key={list.name}>
            <img src={importedIcon} alt="" />
            <strong>{list.name}</strong>
            <span>{list.count}곳</span>
          </S.CheckRow>
        ))}
        {!imported.pending && !imported.lists.length && !imported.error && (
          <p>공개 공유 링크나 Takeout 파일에서 가져온 목록이 여기에 표시돼요.</p>
        )}
      </S.ListSection>

      <S.Band />
      <S.AutoImport>
        <span>
          <strong>새로 저장한 장소 자동으로 불러오기</strong>
          <small>자동으로 가져오려면 Google Maps 계정 연동이 필요해요.</small>
        </span>
        <S.Toggle type="button" role="switch" aria-label="새로 저장한 장소 자동으로 불러오기"
          aria-checked="false" disabled><span /></S.Toggle>
      </S.AutoImport>
      <S.Band />
      <S.Disconnect type="button" aria-haspopup="dialog" onClick={() => setShowDisconnect(true)}>
        <strong>연동 해제</strong>
        <small>해제해도 이미 불러온 장소는 그대로 남아 있어요</small>
      </S.Disconnect>
      {showDisconnect && (
        <SettingsConfirmDialog
          title="Google Maps 연동을 해제할까요?"
          description={<>{hasImported && <>불러온 장소 {imported.count}곳은 그대로 남아요.<br /></>}해제할 Google Maps 계정 연결이 없어요.</>}
          confirmLabel="해제하기" tone="danger"
          onCancel={() => setShowDisconnect(false)}
        />
      )}
    </S.Page>
  );
}

export default GoogleMapsSettingsPage;
