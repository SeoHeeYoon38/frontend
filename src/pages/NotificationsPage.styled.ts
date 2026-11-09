import styled from "styled-components";

export const Shell = styled.div`
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  overflow-x: hidden;
  background: #fff;
  color: #1a1a1a;
  font-family: "Noto Sans KR", Arial, sans-serif;

  button {
    border: 0;
    color: inherit;
    background: none;
    font: inherit;
    cursor: pointer;
  }
`;

export const Navigation = styled.header`
  height: 42px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;

  button {
    display: grid;
    width: 22px;
    height: 22px;
    padding: 0;
    place-items: center;
  }

  img {
    width: 22px;
    height: 22px;
  }

  h1 {
    margin: 0;
    font-size: 15px;
    line-height: 22px;
    font-weight: 700;
  }
`;

export const Filters = styled.nav`
  display: flex;
  gap: 8px;
  padding: 8px 20px 12px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  button {
    flex: 0 0 auto;
    padding: 7px 14px;
    border-radius: 99px;
    background: #f3f5fa;
    color: #5c5c63;
    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }

  button[aria-pressed="true"] {
    background: #090738;
    color: #fff;
    font-weight: 700;
  }
`;

export const Body = styled.main`
  padding-bottom: 30px;
`;

export const Group = styled.section`
  h2 {
    margin: 0;
    padding: 16px 20px 6px;
    color: #8a8a8e;
    font-size: 13px;
    line-height: 18px;
    font-weight: 700;
  }
`;

export const Item = styled.article<{ $unread: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 68px;
  padding: 14px 20px;
  background: ${({ $unread }) => ($unread ? "#f3f5fa" : "#fff")};
`;

export const Icon = styled.span`
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 20px;
  background: #f3f5fa;
  place-items: center;

  img {
    width: 22px;
    height: 22px;
  }
`;

export const Text = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
    color: #5c5c63;
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    white-space: pre-line;
  }
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8a8a8e;
  font-size: 12px;
  line-height: 17px;

  strong {
    color: #5c5c63;
    font-weight: 500;
  }

  i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #14d9f4;
  }
`;

export const Thumbnail = styled.img`
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  border-radius: 10px;
  object-fit: cover;
`;

export const InvitationActions = styled.div`
  display: flex;
  gap: 6px;
  padding-top: 6px;

  button {
    padding: 7px 14px;
    border: 1px solid #e4e6ec;
    border-radius: 8px;
    background: #fff;
    color: #5c5c63;
    font-size: 12px;
    line-height: 17px;
    font-weight: 700;
  }

  button:first-child {
    border-color: #090738;
    background: #090738;
    color: #fff;
  }

  span {
    color: #5c5c63;
    font-size: 12px;
    line-height: 32px;
    font-weight: 700;
  }
`;

export const Empty = styled.div`
  display: grid;
  min-height: 420px;
  padding: 48px 20px;
  color: #8a8a8e;
  text-align: center;
  place-items: center;
  font-size: 14px;
`;

export const HomeIndicator = styled.div`
  position: sticky;
  bottom: 0;
  display: grid;
  height: 30px;
  background: #fff;
  place-items: center;

  &::after {
    width: 134px;
    height: 5px;
    border-radius: 3px;
    background: #1a1a1a;
    content: "";
  }
`;
