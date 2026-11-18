import styled from "styled-components";

export const Step = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: clip;
  overscroll-behavior: contain;
  scrollbar-width: none;
  > * {
    flex-shrink: 0;
  }
`;
export const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  line-height: 1.4;
  letter-spacing: -0.5px;
`;
export const Subtitle = styled.p`
  margin: 8px 0 0;
  color: #8a8a8e;
  font-size: 14px;
  line-height: 1.6;
`;
export const Footer = styled.div`
  width: 100%;
  flex-shrink: 0;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px 0 max(36px, env(safe-area-inset-bottom));
  background: linear-gradient(transparent, white 18%);
`;
export const Primary = styled.button`
  width: 100%;
  min-height: 56px;
  display: grid;
  place-items: center;
  padding: 12px 16px;
  border-radius: 16px;
  background: #090738;
  color: white;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  &:disabled {
    background: #ececf1;
    color: #a8a8ae;
    cursor: default;
  }
`;
export const TextButton = styled.button`
  color: #8a8a8e;
  font-size: 14px;
  text-align: center;
  min-height: 30px;
`;
export const Help = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #8a8a8e;
`;
export const ErrorText = styled.p`
  margin: 0;
  color: #ba3131;
  font-size: 13px;
  line-height: 1.6;
`;
export const Chips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
export const Chip = styled.button<{ $active?: boolean }>`
  border-radius: 18px;
  padding: 8px 12px;
  background: ${({ $active }) => ($active ? "#090738" : "#f3f4f7")};
  color: ${({ $active }) => ($active ? "white" : "#333")};
  font-size: 13px;
  line-height: 1.25;
`;
export const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: #f4f4f7;
  border-radius: 16px;
  padding: 4px;
  button {
    flex: 1;
    padding: 10px 8px;
    text-align: center;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    color: #8a8a8e;
  }
  button[aria-pressed="true"] {
    background: white;
    color: #1a1a1a;
    box-shadow: 0 1px 3px #0001;
  }
`;
export const Search = styled.label<{ $filled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f6f8;
  border-radius: 14px;
  border: 1.5px solid ${({ $filled }) => ($filled ? "#090738" : "transparent")};
  padding: 12.5px;
  input {
    width: 100%;
    min-width: 0;
    border: 0;
    background: none;
    outline: 0;
  }
  &:focus-within {
    outline: 2px solid #7a6fe0;
  }
`;
export const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 1px solid #e2e2e8;
  border-radius: 14px;
  background: white;
  min-width: 0;
`;
export const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  button {
    padding: 12px;
    border: 1px solid #e2e2e8;
    border-radius: 12px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  small {
    color: #8a8a8e;
  }
`;
export const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 17px;
  font-weight: 700;
`;
export const MonthArrows = styled.div`
  position: relative;
  display: flex;
  button {
    width: 28px;
    height: 24px;
    position: relative;
    z-index: 1;
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }
  img {
    position: absolute;
    inset: 0;
  }
`;
export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  row-gap: 8px;
  text-align: center;
`;
export const Weekday = styled.span`
  font-size: 12px;
  color: #8a8a8e;
  padding: 8px 0;
  &:first-child {
    color: #f04452;
  }
`;
export const CalendarDay = styled.button<{
  $range: boolean;
  $edge: boolean;
  $startEdge: boolean;
  $endEdge: boolean;
  $sunday: boolean;
}>`
  position: relative;
  min-height: 40px;
  display: grid;
  place-items: center;
  border: 0;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  color: ${({ $edge, $sunday }) => ($edge ? "white" : $sunday ? "#f04452" : "#1a1a1a")};
  background: ${({ $range, $startEdge, $endEdge }) => ($range ? "#ddf7ff" : $startEdge ? "linear-gradient(to right,transparent 50%,#ddf7ff 50%)" : $endEdge ? "linear-gradient(to right,#ddf7ff 50%,transparent 50%)" : "transparent")};
  &:disabled { color: #b4b5bd; cursor: default; }
  > img {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  span {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    position: relative;
    z-index: 1;
  }
`;
export const DateSummary = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eeeef2;
  padding-top: 16px;
  font-size: 14px;
  font-weight: 700;
  b {
    color: #0079c2;
  }
`;
export const PeopleBox = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 12px;
  background: #f2f3f8;
  border-radius: 20px;
  padding: 24px;
  > p:last-child:not(:first-child) {
    font-size: 12px;
    line-height: 17px;
  }
  > p {
    font-size: 14px;
    color: #8a8a8e;
    margin: 0;
  }
`;
export const Avatars = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 12px;
  > span {
    position: relative;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border: 3px solid #f6f6f9;
    border-radius: 50%;
    overflow: hidden;
    margin-right: -12px;
    background: white;
  }
  img {
    position: absolute;
    left: -6px;
    top: -4px;
    width: 60px;
    height: 60px;
    object-fit: cover;
  }
`;
export const Counter = styled.div<{ $fixed: boolean }>`
  display: flex;
  align-items: center;
  gap: 28px;
  color: #090738;
  strong {
    font-size: ${({ $fixed }) => ($fixed ? "24px" : "32px")};
    line-height: ${({ $fixed }) => ($fixed ? "34px" : "44px")};
    small {
      font-size: 16px;
      margin-left: 2px;
    }
  }
  button {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #090738;
    border: 1px solid #090738;
  }
  button:first-child {
    background: white;
    border-color: #e2e2e8;
  }
  button:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;
export const NightHeader = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ $columns }) => $columns},
    minmax(44px, 1fr)
  );
  gap: 0;
  text-align: center;
  span {
    font-size: 12px;
    color: #8a8a8e;
  }
  strong {
    display: block;
    font-size: 14px;
    color: #1a1a1a;
  }
`;
export const PlaceControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #8a8a8e;
  gap: 8px;
  b {
    color: #090738;
  }
  label {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-size: 12px;
  }
`;

export const CompanionChoices = styled(Chips)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  button {
    text-align: center;
    padding: 12px 0;
    font-size: 14px;
    font-weight: 700;
  }
`;

export const CompanionIllustration = styled.img`
  width: min(100%, 178px);
  height: 112px;
  object-fit: contain;
`;
export const ExtraPeople = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border: 3px solid #f6f6f9;
  border-radius: 50%;
  margin-right: -12px;
  background: #e5e4f6;
  color: #6b6bd9;
  font-size: 14px;
  font-weight: 700;
`;
export const PeopleLimit = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #ff4f5e;
`;

export const FlightResult = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 20px 20px;
  border-radius: 20px;
  background: #f6f6f9;
  > strong {
    font-size: 13px;
    line-height: 18px;
  }
`;
export const FlightTimes = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #090738;
  > div {
    display: flex;
    flex-direction: column;
  }
  > div:last-child {
    text-align: right;
  }
  small {
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
  }
  strong {
    font-size: 30px;
    line-height: 42px;
  }
`;
export const FlightLine = styled.span`
  position: relative;
  flex: 1;
  height: 2px;
  margin-top: 17px;
  background: #d8d7e8;
  &::before,
  &::after {
    content: "";
    position: absolute;
    top: -3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #090738;
  }
  &::before {
    left: 0;
  }
  &::after {
    right: 0;
  }
`;

export const CalendarHelp = styled(Help)`
  font-size: 14px;
  line-height: 20px;
`;
