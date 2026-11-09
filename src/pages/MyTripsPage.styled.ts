import styled from "styled-components";
import { Link } from "react-router";

export const Page = styled.div`
  position: relative;
  min-height: 650px;
  background: #ffffff;
`;

export const Toast = styled.div`
  position: fixed;
  z-index: 30;
  top: calc(env(safe-area-inset-top) + 68px);
  left: 50%;
  width: calc(100% - 40px);
  max-width: 362px;
  min-height: 48px;
  display: grid;
  grid-template-columns: 24px 1fr 24px;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  color: #ffffff;
  background: #12103f;
  box-shadow: 0 9px 30px rgb(11 10 55 / 28%);
  transform: translateX(-50%);

  > span {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #12103f;
    background: #65dcea;
    font-size: 12px;
    font-weight: 700;
  }

  strong {
    font-size: 12px;
    line-height: 18px;
  }

  button {
    color: #ffffff !important;
    font-size: 20px !important;
    text-align: center !important;
    opacity: 0.72;
  }
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 20px 8px;

  input {
    min-width: 0;
    flex: 1;
    height: 42px;
    padding: 0 14px;
    border: 1px solid #dfe1e8;
    border-radius: 12px;
    color: #1a1a1a;
    background: #f7f7fa;
    outline: none;
  }

  input:focus {
    border-color: #090738;
  }

  button {
    flex: 0 0 auto;
    color: #5c5c63 !important;
    font-size: 14px !important;
  }
`;

export const Tabs = styled.div`
  display: flex;
  gap: 24px;
  min-height: 49px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e6ec;

  button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #8a8a8e !important;
    font-size: 16px !important;
    line-height: 24px !important;
    font-weight: 500 !important;
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
    color: #1a1a1a !important;
    font-weight: 700 !important;
  }

  button[aria-pressed="true"]::after {
    background: #090738;
  }

  b {
    color: #0079c2;
    font-weight: 700;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 8px;
  padding: 20px 20px 28px;
`;

export const TripCard = styled(Link)`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding-left: 2px;

  > img {
    width: calc(100% + 2px);
    height: 132px;
    margin-left: -2px;
    margin-bottom: 6px;
    border-radius: 12px;
    object-fit: cover;
  }

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

  > span {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #5c5c63;
    font-size: 12px;
    line-height: 17px;
  }

  > span img {
    width: 14px;
    height: 14px;
  }

  small {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
  }

  small b {
    color: #0079c2;
    font-weight: 700;
  }
`;

export const Empty = styled.p`
  margin: 72px 20px;
  color: #8a8a8e;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
`;

export const Overlay = styled.div`
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(9, 7, 56, 0.42);
`;

export const CreateSheet = styled.section`
  width: min(100%, 402px);
  padding: 8px 20px max(38px, env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;

  h2 {
    margin: 23px 0;
    font-size: 20px;
    line-height: 28px;
  }

  > a {
    min-height: 84px;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;
    padding: 12px 14px;
    border-radius: 20px;
    background: #f5f5fa;
  }

  > a > img {
    width: 56px;
    height: 56px;
    flex: 0 0 auto;
    border-radius: 16px;
    object-fit: cover;
  }

  > a > span:not(:first-child) {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
  }

  small {
    color: #8a8a8e;
    font-size: 11px;
    line-height: 17px;
  }

  > a > b {
    color: #b4b5bd;
    font-size: 28px;
    font-weight: 400;
  }
`;

export const Handle = styled.span`
  display: block;
  width: 36px;
  height: 5px;
  margin: 0 auto;
  border-radius: 999px;
  background: #d4d5dc;
`;

export const PenIcon = styled.span`
  display: grid !important;
  place-items: center;
  width: 56px;
  height: 56px;
  flex: 0 0 auto !important;
  border: 1px solid #e1e2e8;
  border-radius: 16px;
  color: #090738;
  background: #ffffff;
  font-size: 25px;
  font-weight: 700;

  img {
    width: 24px;
    height: 24px;
  }
`;
