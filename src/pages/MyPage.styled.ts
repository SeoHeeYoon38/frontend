import { Link } from "react-router";
import styled, { css } from "styled-components";

export const Page = styled.div`
  min-height: 650px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0 24px;
  background: #ffffff;
`;

export const ProfileSection = styled.section`
  min-height: 96px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
`;

export const Avatar = styled.div`
  width: 64px;
  height: 64px;
  margin: 4px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: #ddf9fd;

  img {
    width: 54px;
    height: 54px;
    object-fit: contain;
  }
`;

export const ProfileText = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #1a1a1a;
    font-size: 22px;
    line-height: 30px;
    font-weight: 700;
  }

  strong b, small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  strong span { flex: none; font-weight: 500; }

  small {
    color: #8a8a8e;
    font-size: 13px;
    line-height: 18px;
  }
`;

export const EditButton = styled(Link)`
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 1px solid #e4e6ec;
  border-radius: 16px;
  color: #090738;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  text-decoration: none;
`;

export const Stats = styled.section`
  min-height: 126px;
  display: flex;
  align-items: center;
  padding: 20px;
`;

export const StatLink = styled(Link)`
  position: relative;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  & + &::before {
    content: "";
    position: absolute;
    top: calc(50% - 20px);
    left: 0;
    width: 1px;
    height: 40px;
    background: #f3f5fa;
  }

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }

  strong {
    margin-top: 8px;
    color: #1a1a1a;
    font-size: 20px;
    line-height: 27px;
    font-weight: 700;
  }

  span {
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
    font-weight: 500;
  }
`;

export const GoogleLink = styled(Link)`
  min-height: 73px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;

  > span {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  > span strong {
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
    font-weight: 700;
  }

  > span small {
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
  }

  > b {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #5c5c63;
    font-size: 11px;
    line-height: 15px;
    white-space: nowrap;
  }

  > b i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00e1ff;
  }

  > b[data-imported="false"] {
    padding: 8px 14px;
    border-radius: 16px;
    color: #fff;
    background: #090738;
    font-size: 13px;
    line-height: 18px;
  }
`;

export const GoogleLogo = styled.span`
  width: 40px;
  height: 40px;
  flex: 0 0 auto !important;
  display: grid !important;
  place-items: center;
  border: 1px solid #e4e6ec;
  border-radius: 12px;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

export const Band = styled.div`
  height: 8px;
  background: #f3f5fa;
`;

export const MenuSection = styled.section`
  display: flex;
  flex-direction: column;
  padding: 8px 20px 0;

  h2 {
    margin: 0 0 8px;
    color: #8a8a8e;
    font-size: 13px;
    line-height: 18px;
    font-weight: 700;
  }
`;

const menuRow = css`
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;

  > img,
  > span:first-child {
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
    object-fit: contain;
  }

  > span:not(:first-child) {
    min-width: 0;
    flex: 1;
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }

  > small {
    color: #8a8a8e;
    font-size: 13px;
    line-height: 18px;
  }

`;

export const MenuButton = styled.button`
  ${menuRow}
`;

export const MenuLink = styled(Link)`
  ${menuRow}
  text-decoration: none;
`;

export const MenuChevron = styled.img`
  width: 16px !important;
  height: 16px !important;
  flex: 0 0 auto;
`;

export const Toast = styled.div`
  position: fixed;
  z-index: 8;
  right: 20px;
  bottom: 105px;
  left: 20px;
  width: min(calc(100% - 40px), 362px);
  margin: 0 auto;
  padding: 14px 16px;
  border-radius: 14px;
  color: #ffffff;
  background: rgba(23, 23, 26, 0.94);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;

  display: flex;
  align-items: center;
  gap: 8px;

  img {
    width: 18px;
    height: 18px;
  }
`;
