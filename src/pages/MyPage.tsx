import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import bellIcon from "../assets/figma/my-setting-bell.svg";
import locationIcon from "../assets/figma/my-stat-place.svg";
import courseIcon from "../assets/figma/my-stat-course.svg";
import profileIcon from "../assets/figma/my-setting-account.svg";
import airplaneIcon from "../assets/figma/my-stat-trip.svg";
import chevronIcon from "../assets/icons/nav-chevron-right-muted.svg";
import noticeIcon from "../assets/figma/my-flag.svg";
import faqIcon from "../assets/figma/my-search.svg";
import feedbackIcon from "../assets/figma/my-pen.svg";
import { profileCharacter } from "../config/profileCharacters";
import googleMapsLogo from "../assets/figma/course-map-google.png";
import checkIcon from "../assets/figma/my-profile-saved.svg";
import { getMe, getMyStats } from "../api/auth";
import { isApiEnabled } from "../api/config";
import { hasAuthSession } from "../api/tokenStorage";
import { routes } from "../config/routes";
import { myProfile } from "../data/mocks/myData";
import useImportedGooglePlaces from "../hooks/useImportedGooglePlaces";
import {
  countEnabledNotifications,
  profileAvatarId,
  readNotificationSettings,
  readProfileSettings,
} from "../utils/mySettings";
import * as S from "./MyPage.styled";

function MyPage() {
  const location = useLocation();
  const liveProfile = isApiEnabled() && hasAuthSession();
  const imported = useImportedGooglePlaces();
  const [profile, setProfile] = useState(() => liveProfile ? null : readProfileSettings(window.localStorage));
  const [stats, setStats] = useState(() => liveProfile ? null : {
    savedPlaceCount: myProfile.savedPlaceCount,
    savedCourseCount: myProfile.savedCourseCount,
    visitedTripCount: myProfile.visitedTripCount,
  });
  const [apiPending, setApiPending] = useState(liveProfile);
  const [apiError, setApiError] = useState("");
  const [notificationCount] = useState(() =>
    countEnabledNotifications(readNotificationSettings(window.localStorage)),
  );
  const [showSavedToast, setShowSavedToast] = useState(
    () => Boolean((location.state as { profileSaved?: boolean } | null)?.profileSaved),
  );

  useEffect(() => {
    if (!showSavedToast) return;
    const timeoutId = window.setTimeout(() => setShowSavedToast(false), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [showSavedToast]);

  useEffect(() => {
    if (!liveProfile) return;
    const controller = new AbortController();
    const { signal } = controller;

    void Promise.allSettled([getMe(signal), getMyStats(signal)]).then(([account, activity]) => {
      if (signal.aborted) return;
      if (account.status === "fulfilled") {
        const user = account.value;
        setProfile({
          nickname: user.nickname?.trim() || user.name,
          email: user.email,
          introduction: user.bio ?? "",
          avatar: profileAvatarId(user.characterId),
        });
      }
      if (activity.status === "fulfilled") {
        const nextStats = activity.value;
        setStats({
          savedPlaceCount: nextStats.savedPlaceCount,
          savedCourseCount: nextStats.savedCourseCount,
          visitedTripCount: nextStats.completedTripCount,
        });
      }
      if (account.status === "rejected") setApiError("프로필 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      else if (activity.status === "rejected") setApiError("저장 및 여행 수를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      else setApiError("");
      setApiPending(false);
    });

    return () => controller.abort();
  }, [liveProfile]);

  return (
    <S.Page>
      {apiPending && <p role="status">프로필 정보를 불러오고 있어요.</p>}
      {apiError && <p role="alert">{apiError}</p>}
      <S.ProfileSection>
        <S.Avatar>
          {profile && <img src={profileCharacter(profile.avatar).image} alt="" />}
        </S.Avatar>
        <S.ProfileText>
          <strong>{profile?.nickname && <><b>{profile.nickname}</b><span>님</span></>}</strong>
          <small>{profile?.email.split("@")[0]}</small>
        </S.ProfileText>
        <S.EditButton to={routes.profileEdit} aria-label="프로필 수정">수정</S.EditButton>
      </S.ProfileSection>

      <S.Stats aria-label="저장 및 여행 요약">
        <S.StatLink to={`${routes.savedItems}?tab=places`}>
          <img src={locationIcon} alt="" />
          <strong>{stats?.savedPlaceCount ?? "—"}</strong>
          <span>저장한 장소</span>
        </S.StatLink>
        <S.StatLink to={`${routes.savedItems}?tab=courses`}>
          <img src={courseIcon} alt="" />
          <strong>{stats?.savedCourseCount ?? "—"}</strong>
          <span>저장한 코스</span>
        </S.StatLink>
        <S.StatLink to={`${routes.myTrips}?tab=past`}>
          <img src={airplaneIcon} alt="" />
          <strong>{stats?.visitedTripCount ?? "—"}</strong>
          <span>다녀온 여행</span>
        </S.StatLink>
      </S.Stats>

      <S.GoogleLink to={routes.googleMapsSettings}>
        <S.GoogleLogo>
          <img src={googleMapsLogo} alt="Google Maps" />
        </S.GoogleLogo>
        <span>
          <strong>{imported.count ? "Google Maps 저장 장소" : "Google Maps 장소 가져오기"}</strong>
          <small>{imported.count ? "저장 장소 " + imported.count + "곳을 불러왔어요" : "공개 목록 링크 또는 Takeout 파일"}</small>
        </span>
        <b data-imported={imported.count > 0}>
          {imported.count > 0 && <i aria-hidden="true" />}
          {imported.count ? "관리" : "가져오기"}
        </b>
      </S.GoogleLink>

      <S.Band />
      <S.MenuSection>
        <h2>설정</h2>
        <S.MenuLink to={routes.notificationSettings}>
          <img src={bellIcon} alt="" />
          <span>알림 설정</span>
          <small>{notificationCount}개 켜짐</small>
          <S.MenuChevron src={chevronIcon} alt="" />
        </S.MenuLink>
        <S.MenuLink to={routes.accountSettings}>
          <img src={profileIcon} alt="" />
          <span>계정 관리</span>
          <small>{liveProfile ? "Google 계정" : "데모"}</small>
          <S.MenuChevron src={chevronIcon} alt="" />
        </S.MenuLink>
      </S.MenuSection>

      <S.Band />
      <S.MenuSection>
        <h2>고객 지원</h2>
        <S.MenuLink to={routes.notices}>
          <img src={noticeIcon} alt="" />
          <span>공지사항</span>
          <S.MenuChevron src={chevronIcon} alt="" />
        </S.MenuLink>
        <S.MenuLink to={routes.faq}>
          <img src={faqIcon} alt="" />
          <span>자주 묻는 질문</span>
          <S.MenuChevron src={chevronIcon} alt="" />
        </S.MenuLink>
        <S.MenuLink to={routes.feedback}>
          <img src={feedbackIcon} alt="" />
          <span>도틀로에 의견 보내기</span>
          <S.MenuChevron src={chevronIcon} alt="" />
        </S.MenuLink>
      </S.MenuSection>

      {showSavedToast && <S.Toast role="status"><img src={checkIcon} alt="" />프로필을 저장했어요</S.Toast>}
    </S.Page>
  );
}

export default MyPage;
