import styled from "styled-components";
import TripSheet from "../common/TripSheet";
import { SheetBody, SheetFooter, SheetHeader } from "../common/TripSheet.styled";
import { Primary } from "../trip/Trip.styled";

export const Sheet = styled(TripSheet)`
  --sheet-handle-top: 10px;
  --sheet-handle-color: #d1d1d6;

  > ${SheetHeader} {
    padding: 37px 0 14px;
    h2 { font-size: 22px; line-height: 30px; letter-spacing: -0.11px; }
    button { position: absolute; right: -7px; width: 30px; height: 30px; }
  }

  > ${SheetBody} { overflow: hidden; }
  > ${SheetFooter} { padding: 14px 0 max(24px, env(safe-area-inset-bottom)); }
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
`;

export const Search = styled.div`
  display: flex;
  min-height: 48px;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 0 14px;
  border-radius: 14px;
  background: #f3f5fa;

  &:focus-within, &[data-query="true"] { box-shadow: inset 0 0 0 1.5px #090738; }

  > input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: none;
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }

  > input::placeholder { color: #8a8a8e; }
  > button { display: grid; flex: 0 0 24px; height: 30px; place-items: center; }
`;

export const Tabs = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: stretch;
  gap: 22px;
  margin: 0 -20px 12px;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #e4e6ec;

  > button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
    padding: 6px 0 12px;
    border-bottom: 2px solid transparent;
    color: #8a8a8e;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
    white-space: nowrap;
  }

  > button[aria-pressed="true"] { color: #1a1a1a; border-bottom-color: #1a1a1a; font-weight: 700; }
  img { width: 12px; height: 12px; object-fit: contain; }
`;

export const Caption = styled.p`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  color: #8a8a8e;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;

  img { width: 12px; height: 12px; object-fit: contain; }
  b { color: #0079c2; }
`;

export const Results = styled.div`
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
  scrollbar-width: none;
  overscroll-behavior: contain;

  > p { margin: 12px 0; color: #5c5c63; font-size: 13px; line-height: 18px; }
`;

export const Row = styled.div`
  display: flex;
  width: 100%;
  min-height: 74px;
  flex: none;
  align-items: center;
  gap: 14px;
  padding: 10px 16px 10px 10px;
  border: 1px solid #e4e6ec;
  border-radius: 14px;
  text-align: left;

  &[aria-pressed="true"] {
    border-color: #090738;
    box-shadow: inset 0 0 0 0.5px #090738;
    background: #f3f5fa;
  }

  &[data-scheduled="true"] {
    border-color: transparent;
    background: #f3f5fa;
    opacity: 0.5;
  }

  > .picker-photo {
    display: block;
    flex: 0 0 52px;
    width: 52px;
    height: 52px;
    overflow: hidden;
    border-radius: 12px;
    background: #f3f5fa;
  }

  .picker-photo > .place-photo { width: 100%; height: 100%; border-radius: inherit; }

  > img { flex: 0 0 auto; }
`;

export const Copy = styled.span`
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 4px;

  > strong { overflow-wrap: anywhere; font-size: 15px; line-height: 22px; }
  > small {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 6px;
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
    font-weight: 500;
  }
  > small i { width: 1px; height: 9px; flex: none; background: #d1d1d6; }
  > small span:last-child { color: #5c5c63; overflow-wrap: anywhere; }
`;

export const Save = styled(Primary)`
  &:disabled { color: #fff; background: #e3e5eb; }
`;
