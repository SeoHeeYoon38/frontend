import { NavLink } from "react-router";
import home from "../../assets/icons/nav-home.svg";
import trips from "../../assets/icons/nav-saved-courses.svg";
import profile from "../../assets/icons/nav-profile.svg";
import { routes } from "../../config/routes";
import * as S from "./Footer.styled";
function Footer() {
  return (
    <S.Nav aria-label="하단 메뉴">
      <NavLink to={routes.home} end>
        <img src={home} alt="" />홈
      </NavLink>
      <NavLink to={routes.myTrips}>
        <img src={trips} alt="" />
        마이트립
      </NavLink>
      <NavLink to={routes.my}>
        <img src={profile} alt="" />
        마이
      </NavLink>
    </S.Nav>
  );
}
export default Footer;
