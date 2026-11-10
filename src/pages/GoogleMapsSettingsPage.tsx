import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import { routes } from "../config/routes";
import {
  readGoogleMapsSettings,
  saveGoogleMapsSettings,
} from "../utils/mySettings";
import * as S from "./GoogleMapsSettingsPage.styled";

const mapLists = [
  { id: "osaka-food", name: "오사카 맛집", count: 24 },
  { id: "tokyo-places", name: "도쿄 가볼 곳", count: 18 },
  { id: "kyoto-trip", name: "교토 여행", count: 10 },
  { id: "seoul-cafe", name: "서울 카페", count: 31 },
];

function GoogleMapsSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() =>
    readGoogleMapsSettings(window.localStorage),
  );
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [lastImported, setLastImported] = useState("오늘 오전 9시 41분");

  useEffect(() => {
    saveGoogleMapsSettings(window.localStorage, settings);
  }, [settings]);

  const toggleList = (id: string) => {
    setSettings((current) => ({
      ...current,
      selectedListIds: current.selectedListIds.includes(id)
        ? current.selectedListIds.filter((item) => item !== id)
        : [...current.selectedListIds, id],
    }));
  };

  const disconnect = () => {
    const next = { ...settings, linked: false, autoImport: false };
    saveGoogleMapsSettings(window.localStorage, next);
    navigate(routes.accountSettings, { replace: true });
  };

  return (
    <S.Page>
      <S.Header>
        <Link to={routes.accountSettings} aria-label="계정 관리로 돌아가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1>Google Maps 연동</h1>
      </S.Header>

      <S.Status>
        <S.Logo><img src={googleMapsLogo} alt="Google Maps" /></S.Logo>
        <span><strong>Google Maps <i /> <b>연동됨</b></strong><small>yebin5929@gmail.com</small></span>
      </S.Status>
      <S.Imported>
        <span><strong>불러온 장소 <b>52곳</b></strong><small>{lastImported}에 마지막으로 불러왔어요</small></span>
        <button type="button" onClick={() => setLastImported("방금")}>↻ 다시 불러오기</button>
      </S.Imported>

      <S.Band />
      <S.ListSection>
        <h2>불러올 목록</h2>
        <p>Google Maps에서 만든 목록 중 도틀로에 담을 목록을 골라요</p>
        {mapLists.map((list) => {
          const checked = settings.selectedListIds.includes(list.id);
          return (
            <S.CheckRow key={list.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={`${list.name} 불러오기`}
                onClick={() => toggleList(list.id)}
              >{checked && "✓"}</button>
              <strong>{list.name}</strong>
              <span>{list.count}곳</span>
            </S.CheckRow>
          );
        })}
      </S.ListSection>

      <S.Band />
      <S.AutoImport>
        <span><strong>새로 저장한 장소 자동으로 불러오기</strong><small>Google Maps에 저장하면 도틀로에도 담겨요</small></span>
        <S.Toggle
          type="button"
          role="switch"
          aria-checked={settings.autoImport}
          aria-label="새 장소 자동 불러오기"
          onClick={() => setSettings((current) => ({ ...current, autoImport: !current.autoImport }))}
        ><span /></S.Toggle>
      </S.AutoImport>

      <S.Band />
      <S.Disconnect type="button" onClick={() => setShowDisconnect(true)}>
        <strong>연동 해제</strong>
        <small>해제해도 이미 불러온 장소는 그대로 남아 있어요</small>
      </S.Disconnect>
      <S.HomeIndicator />

      {showDisconnect && (
        <S.Overlay>
          <S.Dialog role="alertdialog" aria-modal="true">
            <strong>Google Maps 연동을 해제할까요?</strong>
            <p>불러온 장소 52곳은 그대로 남고,<br />앞으로 새로 저장한 장소는 불러오지 않아요</p>
            <div>
              <button type="button" onClick={() => setShowDisconnect(false)}>취소</button>
              <button type="button" data-danger onClick={disconnect}>해제하기</button>
            </div>
          </S.Dialog>
        </S.Overlay>
      )}
    </S.Page>
  );
}

export default GoogleMapsSettingsPage;
