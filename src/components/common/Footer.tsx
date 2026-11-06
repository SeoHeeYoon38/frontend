import { Link } from "react-router";
import home from "../../assets/icons/nav-home.svg";
import trips from "../../assets/icons/nav-saved-courses.svg";
import profile from "../../assets/icons/nav-profile.svg";
import { routes } from "../../config/routes";
import * as S from "./Footer.styled";
function Footer() {
  return (
    <S.Nav aria-label="하단 메뉴">
      <Link to={routes.home} aria-current="page">
        <img src={home} alt="" />홈
      </Link>
      <Link to={routes.courses}>
        <img src={trips} alt="" />
        저장 코스
      </Link>
      <button type="button">
        <img src={profile} alt="" />
        마이
      </button>
    </S.Nav>
  );
}
export default Footer;
