import styled from "styled-components";
import { Link } from "react-router";
export const Header = styled.header`
  height: 92px;
  padding: 38px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
export const Logo = styled(Link)`
  position: relative;
  width: 91px;
  height: 22px;
  overflow: hidden;
  img {
    position: absolute;
    height: 100%;
    width: 130.72%;
    max-width: none;
    left: -30.72%;
  }
`;
export const NotificationButton = styled.button`
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  margin-right: -8px;
  img {
    width: 28px;
    height: 28px;
  }
`;
export const CourseHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 50px 20px 10px;
  min-height: 92px;
  h1 {
    margin: 0;
    flex: 1;
    font-size: 14px;
    line-height: 19px;
    font-weight: 700;
  }
  a {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
  }
  button {
    display: grid;
    place-items: center;
    width: 20px;
    height: 22px;
  }
`;

export const TripHeader = styled.header`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 58px 20px 9px;
  min-height: 95px;
  @media (max-height: 600px) {
    padding-top: 16px;
    min-height: 53px;
  }
  button {
    display: grid;
    place-items: center;
    min-width: 28px;
    min-height: 28px;
  }
  span {
    font-size: 14px;
    color: #7b6fe9;
  }
`;
export const Progress = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 6px;
  padding: 0 20px;
  span {
    height: 6px;
    flex: 1;
    border-radius: 8px;
    background: #dde5e8;
  }
  span[data-filled="true"] {
    background: linear-gradient(90deg, #a5a5ff73, #6b6bd9);
  }
`;
