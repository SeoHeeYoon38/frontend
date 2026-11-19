import { Link } from "react-router";
import styled from "styled-components";

export const Page = styled.div`
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  overflow-x: clip;
  color: #1a1a1a;
  background: #ffffff;
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;

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
  height: 48px;
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
    width: 8.11667px;
    height: 14.5333px;
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
  margin-top: 4px;
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

  [data-favorites="true"] & {
    button { font-size: 14px; }
    button[aria-pressed="true"] b { color: #090738; }
  }
`;

export const Content = styled.main`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 20px 24px;
  [data-favorites="true"] & { padding-top: 8px; }
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
    display: flex;
    align-items: center;
    gap: 2px;
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
    font-weight: 500;
  }

  span img {
    width: 14px;
    height: 14px;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  [data-favorites="true"] & {
    gap: 0;
    > article { align-items: flex-start; padding: 16px 0; }
    > article:not(:last-child) { border-bottom: 1px solid #e4e6ec; }
    > article[data-kind="course"] > :is(img, span) { width: 96px; height: 96px; }
    > article[data-kind="place"] > :is(img, span) { width: 80px; height: 80px; }
    > article[data-kind="place"] { align-items: center; }
  }
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

  > .place-photo {
    flex: 0 0 auto;
    overflow: hidden;
    border-radius: 14px;
  }
`;

export const PlaceRow = styled(ItemRow)`
  > img, > .place-photo, > span:not(.place-photo) {
    width: 56px;
    height: 56px;
  }
`;

export const CourseRow = styled(ItemRow)`
  min-height: 88px;

  > img, > span {
    width: 72px;
    height: 72px;
  }

  a {
    display: block;
    max-width: 100%;
  }

  a strong { display: block; }
`;

export const ImageFallback = styled.span`
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #f3f5fa;

  img {
    width: 22px;
    height: 22px;
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

  [data-favorites="true"] & {
    gap: 4px;
    strong { white-space: pre-line; overflow-wrap: anywhere; }
    em { color: #6b6bd9; font-weight: 500; }
  }
`;

export const BookmarkButton = styled.button`
  width: 34px;
  height: 44px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;

  img {
    width: 22px;
    height: 22px;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }
  [data-favorites="true"] & {
    width: 28px;
    height: 28px;
    img { width: 18px; height: 18px; }
  }
`;

export const Empty = styled.p`
  margin: 72px 0;
  color: #8a8a8e;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
`;

export const BrowseLink = styled(Link)`
  display: block;
  width: fit-content;
  margin: 6px auto 0;
  color: #090738 !important;
  font-weight: 700;
`;
