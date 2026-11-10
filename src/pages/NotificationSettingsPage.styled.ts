import styled from "styled-components";

export const Page = styled.div`
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 34px;
  color: #1a1a1a;
  background: #ffffff;
  font-family: "Noto Sans KR", Arial, sans-serif;

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font: inherit;
  }
`;

export const Header = styled.header`
  height: 54px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;

  a {
    width: 22px;
    height: 40px;
    display: grid;
    place-items: center;
  }

  img {
    width: 10px;
    height: 18px;
  }

  h1 {
    margin: 0;
    font-size: 17px;
    line-height: 24px;
    font-weight: 700;
  }
`;

export const MasterSection = styled.section`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 23px 20px 27px;
  border-bottom: 8px solid #f3f5fa;
`;

export const SettingText = styled.span`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }

  small {
    overflow: hidden;
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Group = styled.section<{ $disabled: boolean }>`
  padding: 16px 20px 4px;
  border-bottom: 8px solid #f3f5fa;

  h2 {
    margin: 0 0 4px;
    color: #8a8a8e;
    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }

  > div {
    opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  }
`;

export const SettingRow = styled.div`
  min-height: 69px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Toggle = styled.button`
  position: relative;
  width: 48px;
  height: 28px;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: #dfe1e8;
  cursor: pointer;
  transition: background 0.18s ease;

  &[aria-checked="true"] {
    background: #090738;
  }

  span {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(9, 7, 56, 0.18);
    transition: transform 0.18s ease;
  }

  &[aria-checked="true"] span {
    transform: translateX(20px);
  }
`;

export const HomeIndicator = styled.div`
  position: fixed;
  right: 0;
  bottom: 8px;
  left: 0;
  width: 134px;
  height: 5px;
  margin: 0 auto;
  border-radius: 3px;
  background: #000000;
`;
