import { useState } from "react";
import bellIcon from "../assets/course-settings/bell.svg";
import locationIcon from "../assets/course-settings/pin.svg";
import courseIcon from "../assets/icons/my-route.svg";
import profileIcon from "../assets/icons/nav-profile.svg";
import airplaneIcon from "../assets/icons/transport-airplane.svg";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import { routes } from "../config/routes";
import { myProfile } from "../data/mocks/myData";
import * as S from "./MyPage.styled";

function MyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(myProfile.name);
  const [username, setUsername] = useState(myProfile.username);

  return (
    <S.Page>
      <S.ProfileSection>
        <S.Avatar>
          <img src={myProfile.avatar} alt="" />
        </S.Avatar>
        {isEditing ? (
          <S.ProfileInputs>
            <label>
              <span>이름</span>
              <input
                aria-label="이름"
                value={name}
                maxLength={12}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              <span>아이디</span>
              <input
                aria-label="아이디"
                value={username}
                maxLength={24}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
          </S.ProfileInputs>
        ) : (
          <S.ProfileText>
            <strong>
              {name} <span>님</span>
            </strong>
            <small>{username}</small>
          </S.ProfileText>
        )}
        <S.EditButton type="button" onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? "저장" : "수정"}
        </S.EditButton>
      </S.ProfileSection>

      <S.Stats aria-label="저장 및 여행 요약">
        <S.StatLink to={`${routes.savedItems}?tab=places`}>
          <img src={locationIcon} alt="" />
          <strong>{myProfile.savedPlaceCount}</strong>
          <span>저장한 장소</span>
        </S.StatLink>
        <S.StatLink to={`${routes.savedItems}?tab=courses`}>
          <img src={courseIcon} alt="" />
          <strong>{myProfile.savedCourseCount}</strong>
          <span>저장한 코스</span>
        </S.StatLink>
        <S.StatLink to={`${routes.myTrips}?tab=past`}>
          <img src={airplaneIcon} alt="" />
          <strong>{myProfile.visitedTripCount}</strong>
          <span>다녀온 여행</span>
        </S.StatLink>
      </S.Stats>

      <S.GoogleLink to={`${routes.savedItems}?tab=places`}>
        <S.GoogleLogo>
          <img src={googleMapsLogo} alt="Google Maps" />
        </S.GoogleLogo>
        <span>
          <strong>Google Maps 연동 중</strong>
          <small>저장 장소 {myProfile.googlePlaceCount}곳을 불러왔어요</small>
        </span>
        <b>
          <i /> 연동됨
        </b>
      </S.GoogleLink>

      <S.Band />
      <S.MenuSection>
        <h2>설정</h2>
        <S.MenuButton type="button">
          <img src={bellIcon} alt="" />
          <span>알림 설정</span>
          <small>5개 켜짐</small>
          <b>›</b>
        </S.MenuButton>
        <S.MenuButton type="button">
          <img src={profileIcon} alt="" />
          <span>계정 관리</span>
          <small>카카오</small>
          <b>›</b>
        </S.MenuButton>
      </S.MenuSection>

      <S.Band />
      <S.MenuSection>
        <h2>고객 지원</h2>
        <S.MenuButton type="button">
          <S.TextIcon aria-hidden="true">⚐</S.TextIcon>
          <span>공지사항</span>
          <b>›</b>
        </S.MenuButton>
        <S.MenuButton type="button">
          <S.TextIcon aria-hidden="true">⌕</S.TextIcon>
          <span>자주 묻는 질문</span>
          <b>›</b>
        </S.MenuButton>
        <S.MenuButton type="button">
          <S.TextIcon aria-hidden="true">✎</S.TextIcon>
          <span>도틀로에 의견 보내기</span>
          <b>›</b>
        </S.MenuButton>
      </S.MenuSection>
    </S.Page>
  );
}

export default MyPage;
