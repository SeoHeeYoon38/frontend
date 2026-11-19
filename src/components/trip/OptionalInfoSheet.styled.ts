import styled from "styled-components";
import TripSheet from "../common/TripSheet";
import { SheetHeader } from "../common/TripSheet.styled";
import { FlightLine as BaseFlightLine, FlightResult as BaseFlightResult, Results, Tabs as BaseTabs } from "./Trip.styled";

export const StaySheet = styled(TripSheet)`
  ${SheetHeader} {
    padding: 44px 0 17px;
    h2 { letter-spacing: -0.24px; line-height: 32px; }
    > button { margin-right: -6px; }
  }
`;

export const Field = styled.label`
  display: grid;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
`;

export const Search = styled.span<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 14px;
  box-shadow: ${({ $selected }) => $selected ? "inset 0 0 0 1.5px #090738" : "none"};
  border-radius: 14px;
  background: #f3f5fa;

  &:focus-within { box-shadow: inset 0 0 0 1.5px #090738; }
  img { flex: none; }
  input {
    min-width: 0;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    font-size: 15px;
    font-weight: ${({ $selected }) => $selected ? 700 : 500};
    color: #1a1a1a;
  }
  input:focus-visible { outline: none; }
  input::placeholder { color: #8a8a8e; font-weight: 400; }
`;

export const Tabs = styled(BaseTabs)`
  min-height: 44px;
  border-radius: 14px;
  background: #f3f5fa;
  button { padding: 8px; }
`;

export const DateSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;

  fieldset { border: 0; min-width: 0; margin: 0; padding: 0; }
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 18px;
  font-size: 13px;
  line-height: 18px;
  b, > strong, button { font-weight: 700; }
  b, button:last-child:not(:first-child) { color: #090738; }
  button.select-all { color: #0079c2; }
`;

export const Weeks = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  row-gap: 6px;
  max-height: 207px;
  overflow: auto;
  scrollbar-width: thin;
`;

export const WeekDay = styled.button<{ $connectedBefore: boolean; $connectedAfter: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  min-width: 0;
  min-height: 62px;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;

  > span { color: #8a8a8e; font-size: 12px; line-height: 14px; }
  &:nth-child(7n+1) > span { color: #e5484d; }
  > strong {
    position: relative;
    isolation: isolate;
    display: grid;
    place-items: center;
    width: 100%;
    height: 40px;
    font-size: 15px;
    font-weight: 500;
    background: ${({ $connectedBefore, $connectedAfter }) => $connectedBefore || $connectedAfter
      ? `linear-gradient(to right, ${$connectedBefore ? "#ddf7ff" : "transparent"} 0 50%, ${$connectedAfter ? "#ddf7ff" : "transparent"} 50% 100%)`
      : "transparent"};
  }
  img { position: absolute; z-index: -1; }
  b { font-weight: inherit; }
  img + b { color: white; font-weight: 700; }
  &:disabled { cursor: default; color: #b4b5bd; }
  &:focus-visible { outline-offset: -2px; }
`;

export const FlightResult = styled(BaseFlightResult)`
  background: #f3f5fa;
`;

export const FlightLine = styled(BaseFlightLine)`
  display: grid;
  place-items: center;
  grid-template: 1fr / 1fr;
  background: #ddf7ff;
  img { position: absolute; }
`;

export const PlaceField = styled.div`
  display: grid;
  gap: 10px;
`;

export const Matches = styled(Results)`
  max-height: 190px;
  overflow-y: auto;
  scrollbar-width: thin;
  button { background: #fff; }
`;

export const StaySummary = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  line-height: 18px;
  span { color: #8a8a8e; }
`;

export const StayList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid #ededf1;
  }
  li > div { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  strong { overflow-wrap: anywhere; font-size: 15px; line-height: 22px; }
  small, button { color: #8a8a8e; font-size: 12px; line-height: 17px; }
  button { padding: 8px 0 8px 12px; flex: none; }
`;

export const AddStay = styled.button`
  align-self: flex-start;
  color: #0079c2;
  min-height: 32px;
  font-size: 13px;
  font-weight: 700;
`;
