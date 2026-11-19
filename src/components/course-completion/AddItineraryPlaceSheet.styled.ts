import styled from "styled-components";
import TripSheet from "../common/TripSheet";
import { SheetBody, SheetFooter, SheetHeader } from "../common/TripSheet.styled";
import { Primary } from "../trip/Trip.styled";

export const Sheet = styled(TripSheet)<{ $searching: boolean }>`
  --sheet-handle-top: 10px;
  --sheet-handle-color: #d1d1d6;
  max-height: calc(100dvh - 24px);

  > ${SheetHeader} {
    padding: 37px 0 14px;
    h2 { font-size: 22px; line-height: 30px; letter-spacing: -0.11px; }
    button { position: absolute; right: -8px; width: 30px; height: 30px; }
  }

  > ${SheetBody} { margin-inline: -20px; padding-inline: 20px; overflow: hidden; }
  > ${SheetFooter} { padding: 14px 0 max(${({ $searching }) => $searching ? 28 : 24}px, env(safe-area-inset-bottom)); }
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
  &[data-query="true"] { padding-inline: 15.5px; }

  > input {
    flex: 1;
    min-width: 0;
    border: 0;
    padding: 0;
    outline: 0;
    background: none;
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }

  > input::placeholder { color: #8a8a8e; }
  > button { position: relative; display: grid; flex: 0 0 18px; height: 30px; place-items: center; }
  > button::after { content: ""; position: absolute; inset: 0 -6px; }
`;

export const Tabs = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  gap: 22px;
  margin: 0 -20px 12px;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #e4e6ec;

  > button {
    display: inline-flex;
    flex-shrink: 0;
    min-width: 26px;
    align-items: center;
    gap: 5px;
    padding: 6px 0 12px;
    color: #8a8a8e;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
    white-space: nowrap;
  }

  > button[data-saved] { min-width: 56px; }
  > button[data-saved][aria-pressed="true"] { min-width: 75px; }
  > button[aria-pressed="true"] { color: #1a1a1a; border-bottom: 2px solid #1a1a1a; font-weight: 700; }
  img { width: 14px; height: 14px; object-fit: contain; }
`;

export const Caption = styled.p`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
  margin: 0 0 4px;
  color: #8a8a8e;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;

  img { width: 14px; height: 14px; object-fit: contain; }
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
    min-height: 75px;
    padding: 10.5px 16.5px 10.5px 10.5px;
    border-color: #090738;
    box-shadow: inset 0 0 0 0.5px #090738;
    background: #f3f5fa;
  }

  &[data-scheduled="true"] {
    min-height: 72px;
    border: 0;
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
