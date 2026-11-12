import styled from "styled-components";

export const Page = styled.main`
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  color: #1a1a1a;
  background: #ffffff;
  font-family: "Pretendard", "Noto Sans KR", Arial, sans-serif;
`;

export const Header = styled.header`
  position: sticky;
  z-index: 4;
  top: 0;
  height: 52px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);

  h1 {
    margin: 0;
    font-size: 17px;
    line-height: 24px;
    font-weight: 700;
  }

  button {
    position: absolute;
    top: 4px;
    right: 9px;
    width: 44px;
    height: 44px;
    padding: 0;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

export const Document = styled.article<{ $withAction: boolean }>`
  padding: 8px 24px ${({ $withAction }) => ($withAction ? "140px" : "48px")};
`;

export const Required = styled.span`
  display: inline-flex;
  padding: 2px 6px;
  border-radius: 4px;
  background: #ecebf5;
  font-size: 12px;
  line-height: 17px;
  font-weight: 700;
`;

export const Lead = styled.p`
  margin: 20px 0 0;
  color: #5c5c63;
  font-size: 14px;
  line-height: 1.65;
  word-break: keep-all;
`;

export const Section = styled.section`
  padding-top: 32px;

  h2 {
    margin: 0 0 10px;
    font-size: 16px;
    line-height: 24px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #5c5c63;
    font-size: 14px;
    line-height: 1.65;
    word-break: keep-all;
  }

  p + p {
    margin-top: 10px;
  }
`;

export const BulletList = styled.ul`
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
  list-style: none;

  li {
    position: relative;
    padding-left: 16px;
    color: #5c5c63;
    font-size: 14px;
    line-height: 1.65;
    word-break: keep-all;
  }

  li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #8a8a8e;
    font-weight: 700;
  }

  & + p {
    margin-top: 10px;
  }
`;

export const ContactBox = styled.div`
  margin: 10px 0;
  padding: 14px 16px;
  border-radius: 8px;
  color: #5c5c63;
  background: #f5f6f8;
  font-size: 13px;
  line-height: 1.6;
`;

export const EffectiveDate = styled.p`
  margin: 32px 0 0;
  padding-top: 20px;
  border-top: 1px solid #eceef2;
  color: #8a8a8e;
  font-size: 12px;
  line-height: 17px;
`;

export const ActionBar = styled.footer`
  position: fixed;
  z-index: 5;
  right: 0;
  bottom: 0;
  left: 0;
  width: min(100%, 402px);
  margin: 0 auto;
  padding: 12px 24px max(34px, env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.04);

  button {
    width: 100%;
    min-height: 56px;
    border: 0;
    border-radius: 16px;
    color: #ffffff;
    background: #090738;
    font-size: 16px;
    line-height: 22px;
    font-weight: 700;
    cursor: pointer;
  }
`;
