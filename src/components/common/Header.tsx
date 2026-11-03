import { Link } from "react-router";
import flowBack from "../../assets/icons/nav-back-trip.svg";
import logo from "../../assets/images/brand-dotlo-logo.png";
import back from "../../assets/icons/nav-back.svg";
import bookmark from "../../assets/icons/nav-bookmark.svg";
import bell from "../../assets/icons/nav-notification.svg";
import { routes } from "../../config/routes";
import * as S from "./Header.styled";
interface HeaderProps {
  variant?: "home" | "courses" | "trip";
  step?: number;
  onBack?: () => void;
  hideProgress?: boolean;
}
function Header({
  variant = "home",
  step = 1,
  onBack,
  hideProgress = false,
}: HeaderProps) {
  return (
    <>
      {variant === "trip" ? (
        <>
          <S.TripHeader>
            <button type="button" aria-label="이전 단계" onClick={onBack}>
              <img src={flowBack} alt="" />
            </button>
            {!hideProgress && <span>{step} / 3</span>}
          </S.TripHeader>
          {!hideProgress && (
            <S.Progress aria-label={`${step}/3 단계`}>
              {[1, 2, 3].map((value) => (
                <span key={value} data-filled={value <= step} />
              ))}
            </S.Progress>
          )}
        </>
      ) : variant === "courses" ? (
        <S.CourseHeader>
          <Link to={routes.home} aria-label="홈으로 돌아가기">
            <img src={back} alt="" />
          </Link>
          <h1>코스 둘러보기</h1>
          <button type="button" aria-label="보관함">
            <img src={bookmark} alt="" />
          </button>
        </S.CourseHeader>
      ) : (
        <S.Header>
          <S.Logo to={routes.home} aria-label="닷로 홈">
            <img src={logo} alt="Dotlo" />
          </S.Logo>
          <S.NotificationButton type="button" aria-label="알림">
            <img src={bell} alt="" />
          </S.NotificationButton>
        </S.Header>
      )}
    </>
  );
}
export default Header;
