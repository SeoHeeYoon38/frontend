import styled from "styled-components";

export const Page = styled.div`
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  overflow-x: clip;
  color: #1a1a1a;
  background: #ffffff;
  font-family: "Noto Sans KR", Arial, sans-serif;

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    cursor: pointer;
  }

  :focus-visible {
    outline: 3px solid #7a6fe0;
    outline-offset: 3px;
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
    height: 38px;
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
    letter-spacing: -0.1px;
  }
`;

export const Tabs = styled.div`
  height: 45px;
  display: flex;
  align-items: stretch;
  gap: 24px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e6ec;

  button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #8a8a8e;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  button::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background: transparent;
  }

  button[aria-pressed="true"] {
    color: #1a1a1a;
    font-weight: 700;
  }

  button[aria-pressed="true"]::after {
    background: #090738;
  }

  b {
    color: #b4b5bd;
    font-weight: inherit;
  }

  button[aria-pressed="true"] b {
    color: #0079c2;
  }
`;

export const Content = styled.main`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 20px 24px;
`;

export const RegionFilters = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  button {
    flex: 0 0 auto;
    padding: 6px 14px;
    border-radius: 18px;
    color: #1a1a1a;
    background: #f3f5fa;
    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }

  button[aria-pressed="true"] {
    color: #ffffff;
    background: #090738;
  }
`;

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  strong {
    font-size: 14px;
    line-height: 20px;
    font-weight: 700;
  }

  span {
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
    font-weight: 500;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemRow = styled.article`
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 0;

  > img {
    flex: 0 0 auto;
    border-radius: 14px;
    object-fit: cover;
  }
`;

export const PlaceRow = styled(ItemRow)`
  > img {
    width: 56px;
    height: 56px;
  }
`;

export const CourseRow = styled(ItemRow)`
  min-height: 88px;

  > img {
    width: 72px;
    height: 72px;
  }
`;

export const ItemText = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  strong {
    max-width: 100%;
    overflow: hidden;
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
  }

  span i {
    width: 1px;
    height: 10px;
    background: #d1d1d6;
  }

  small {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #8a8a8e;
    font-size: 11px;
    line-height: 15px;
    font-weight: 500;
  }

  small[data-google="true"] {
    color: #0079c2;
  }

  small img {
    width: 12px;
    height: 12px;
    object-fit: contain;
  }

  em {
    color: #0079c2;
    font-size: 11px;
    line-height: 15px;
    font-style: normal;
    font-weight: 700;
  }
`;

export const BookmarkButton = styled.button`
  width: 34px;
  height: 44px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;

  svg {
    width: 22px;
    height: 22px;
  }
`;

export const Empty = styled.p`
  margin: 72px 0;
  color: #8a8a8e;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
`;
