import styled from "styled-components";

const navy = "#090738";
const muted = "#8a8a8e";
const border = "#e4e6ec";

export const Shell = styled.div`
  position: relative;
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  color: #171722;
  background: #ffffff;
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;

  :where(&) :where(button) {
    margin: 0;
    padding: 0;
    border: 0;
    color: inherit;
    background: none;
    font: inherit;
    cursor: pointer;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

export const PlainScreen = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
`;

export const PlanScreen = styled(PlainScreen)`
  background: #ffffff;
`;

export const SearchScreen = styled(PlainScreen)``;

export const SearchOverlay = styled.div`
  position: absolute;
  z-index: 30;
  inset: 0;
`;

export const SearchBackdrop = styled.button`
  position: absolute;
  inset: 0;
  width: 100%;
  background: rgb(5 5 15 / 48%) !important;
`;

export const SearchSheet = styled.section<{ $compact?: boolean }>`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: ${({ $compact }) => $compact ? "min(502px, calc(100% - 110px))" : "min(716px, calc(100% - 110px))"};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  background: #ffffff;

  > div:last-child button:disabled {
    color: #ffffff;
    background: #e4e6ec;
  }
`;

export const SearchHandle = styled.div`
  width: 36px;
  height: 5px;
  flex: 0 0 auto;
  margin: 9px auto 0;
  border-radius: 99px;
  background: #d1d1d6;
`;

export const PlainHeader = styled.header`
  position: relative;
  height: 48px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 10px;

  h1 {
    position: absolute;
    left: 52px;
    margin: 0;
    color: #1a1a1a;
    font-size: 16px;
    line-height: 22px;
    font-weight: 700;
    white-space: nowrap;
  }
`;

export const BackButton = styled.button`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;

  > img {
    display: block;
    width: 8.11667px;
    height: 14.5333px;
  }

  &:hover {
    background: rgb(255 255 255 / 15%);
  }
`;

export const InfoScroll = styled.main`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 28px 20px 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const InfoIntro = styled.section`
  position: relative;
  padding: 8px 2px 35px;
  border-bottom: 1px solid ${border};

  > p {
    margin: 0 0 11px;
    color: ${muted};
    font-size: 14px;
  }

  h2 {
    margin: 0;
    color: #31313a;
    font-size: 23px;
    line-height: 1.65;
    font-weight: 500;
    letter-spacing: -0.7px;
  }

  h2 strong {
    color: ${navy};
    font-weight: 700;
    box-shadow: inset 0 -9px 0 #dff8fb;
  }

  button {
    position: absolute;
    right: 0;
    bottom: 13px;
    padding: 6px 9px;
    border-radius: 8px;
    color: #676975;
    background: #f3f3f7;
    font-size: 12px;
  }
`;

export const InfoSection = styled.section`
  padding-top: 30px;

  h3 {
    margin: 0;
    font-size: 17px;
    line-height: 25px;
  }

  > p {
    margin: 7px 0 18px;
    color: ${muted};
    font-size: 12px;
    line-height: 18px;
  }
`;

export const OptionalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  button {
    min-height: 128px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px 12px;
    border: 1px solid ${border};
    border-radius: 16px;
    background: #fbfbfd;
  }

  span {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    margin-bottom: 17px;
    border-radius: 11px;
    color: ${navy};
    background: #ebeaff;
    font-size: 17px;

    img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
  }

  strong {
    font-size: 14px;
    line-height: 21px;
  }

  small {
    margin-top: 2px;
    color: ${muted};
    font-size: 10px;
  }
`;

export const BottomAction = styled.div<{ $floating?: boolean }>`
  position: ${({ $floating }) => ($floating ? "absolute" : "relative")};
  z-index: 12;
  right: ${({ $floating }) => ($floating ? "0" : "auto")};
  bottom: ${({ $floating }) => ($floating ? "0" : "auto")};
  left: ${({ $floating }) => ($floating ? "0" : "auto")};
  flex: 0 0 auto;
  padding: 16px 20px 34px;
  border-top: 1px solid ${border};
  background: #ffffff;

  button {
    width: 100%;
    height: 56px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    color: #ffffff;
    background: ${navy};
    font-size: 16px;
    font-weight: 700;
    text-align: center;
  }

  button:disabled {
    color: #a6a7af;
    background: #e7e7ec;
    cursor: not-allowed;
  }
`;

export const Hero = styled.section`
  position: relative;
  height: 358px;
  flex: 0 0 auto;
  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const HeroScrim = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(5 5 15 / 55%) 0%, rgb(5 5 15 / 40%) 40%, transparent 60%),
    linear-gradient(180deg, transparent 36%, rgb(5 5 15 / 30%) 57%, rgb(5 5 15 / 82%) 100%);
`;

export const HeroHeader = styled.header`
  position: absolute;
  z-index: 5;
  top: 0;
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 6px;
  height: 46px;
  padding: 0 20px;
  color: #ffffff;

  > ${BackButton} {
    width: 22px;
    height: 22px;
  }

  small {
    font-size: 14px;
    font-weight: 700;
  }

  > button:last-child {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    justify-self: end;
    border-radius: 0;
    background: transparent;
  }

  > button:last-child img {
    width: 24px;
    filter: brightness(0) invert(1);
  }
`;

export const HeroTitle = styled.div`
  position: absolute;
  right: 20px;
  top: 241px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #ffffff;

  > span {
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px 4px 8px;
    border-radius: 99px;
    background: rgb(255 255 255 / 22%);
    backdrop-filter: blur(6px);
    font-size: 11px;
    line-height: 15px;
    font-weight: 700;
  }

  > span img {
    width: 12px;
    height: 12px;
    filter: brightness(0) invert(1);
  }

  h1 {
    margin: 0;
    font-size: 26px;
    line-height: 35px;
    letter-spacing: -0.26px;
  }

  p {
    margin: 4px 0 0;
    font-size: 14px;
    line-height: 20px;
  }
`;

export const HeroInvite = styled.button`
  position: absolute;
  right: 20px;
  bottom: 23px;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px !important;
  border: 1px solid #ffffff !important;
  border-radius: 999px;
  color: #ffffff !important;
  background: rgb(5 5 15 / 24%) !important;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  img { width: 16px; height: 16px; }
`;

export const PlanScroll = styled.main`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 20px 130px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  > * { flex-shrink: 0; }
`;

export const ItineraryOverview = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 17px;
    line-height: 24px;
    font-weight: 700;
  }
`;

export const Facts = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px 8px;
  border-radius: 16px;
  background: #f3f5fa;

  > div {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  img { width: 24px; height: 24px; margin-bottom: 8px; }
  strong { color: #1a1a1a; font-size: 15px; line-height: 22px; text-align: center; overflow-wrap: anywhere; }
  span { color: #8a8a8e; font-size: 12px; line-height: 17px; }
`;

export const TripSummary = styled.section`
  display: grid;
  grid-template-columns: 1fr 1px 1fr 1px 1fr;
  align-items: center;
  margin: 14px 16px 12px;
  padding: 15px 10px;
  border: 1px solid #ececf1;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgb(17 16 63 / 5%);

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }

  span {
    color: ${muted};
    font-size: 10px;
  }

  strong {
    font-size: 13px;
  }

  i {
    width: 1px;
    height: 24px;
    background: ${border};
  }
`;

export const DayTabs = styled.nav`
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid ${border};
  background: #ffffff;

  button {
    position: relative;
    min-height: 40px;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 5px;
    padding: 6px 0 11px;
    border-radius: 0;
    color: ${muted};
  }

  button[aria-pressed="true"] {
    color: #1a1a1a;
    border-bottom: 2px solid #1a1a1a;
    font-weight: 700;
  }

  strong {
    font-size: 15px;
    line-height: 22px;
  }

  span {
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
  }
`;

export const EmptyPlan = styled.section`
  min-height: 238px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 36px 24px;
  border-radius: 20px;
  background: #f3f5fa;
  text-align: center;

  > span {
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #ffffff;
  }

  > span img {
    width: 28px;
    height: 28px;
  }

  h2 {
    margin: 14px 0 0;
    color: #1a1a1a;
    font-size: 16px;
    line-height: 22px;
  }

  p {
    margin: 0;
    color: ${muted};
    margin-top: 6px;
    font-size: 13px;
    line-height: 18px;
  }

  button {
    height: 44px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    padding: 0 20px;
    border: 0;
    border-radius: 12px;
    color: #ffffff;
    background: ${navy};
    font-size: 14px;
    font-weight: 700;
  }

  button img {
    width: 16px;
    filter: brightness(0) invert(1);
  }
`;

export const FilledPlan = styled.section`
  margin: 0;
  padding: 0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const RouteMap = styled.div`
  position: relative;
  height: 218px;
  margin: 0 16px;
  overflow: hidden;
  border-radius: 18px;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    position: absolute;
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border: 3px solid #ffffff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    color: #ffffff;
    background: ${navy};
    box-shadow: 0 2px 8px rgb(0 0 0 / 25%);
    font-size: 11px;
    font-style: normal;
  }

  span::first-letter {
    transform: rotate(45deg);
  }
`;

export const ScheduleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 0;

  > div {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
  }

  strong {
    color: #1a1a1a;
    font-size: 16px;
    line-height: 22px;
  }

  span {
    color: #8a8a8e;
    font-size: 13px;
    line-height: 18px;
  }
  strong + span { margin-left: auto; }
  span + span { display: inline-flex; align-items: center; gap: 8px; }
  span + span::before { content: ""; width: 1px; height: 10px; background: #d1d1d6; }

  button {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #1a1a1a;
    background: transparent;
    font-size: 13px;
    font-weight: 700;
  }

  button img {
    width: 28px;
    height: 28px;
  }
`;

export const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;

  > li {
    position: relative;
    padding-left: 38px;
  }

  > li:focus-visible { outline: 2px solid #090738; outline-offset: 3px; }

  > li:not(:only-child)::before {
    content: "";
    position: absolute;
    left: 12px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #d1d1d6;
  }
  > li:last-child:not(:first-child)::before { height: 26px; }
  > li:last-child:not(:first-child) { padding-bottom: 4px; }
  > li + li > span:first-child { top: 26px; }
`;

export const TimelineNumber = styled.span`
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: ${navy};
  background: #00e1ff;
  font-size: 12px;
  font-weight: 700;
`;

export const TimelineCard = styled.article`
  min-height: 86px;
  display: grid;
  grid-template-columns: 24px 60px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 12px;
  padding: 12px 8px 12px 12px;
  border: 1px solid ${border};
  border-radius: 12px;
  background: #ffffff;

  .direct-place-handle {
    position: relative;
    display: block;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .direct-place-handle img { width: 24px; height: 24px; }
  .direct-place-handle select {
    position: absolute;
    inset: 0;
    width: 24px;
    height: 24px;
    opacity: 0;
    cursor: pointer;
  }
  .direct-place-handle:focus-within { outline: 2px solid ${navy}; border-radius: 4px; }

  .direct-place-thumb {
    width: 60px;
    height: 60px;
    overflow: hidden;
    border-radius: 10px;
    background: #f3f5fa;
  }
  .direct-place-thumb > img { width: 100%; height: 100%; object-fit: cover; }
  .direct-place-thumb .place-photo { width: 60px; height: 60px; border-radius: 10px; }

  .direct-place-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .direct-place-copy strong {
    max-width: 100%;
    overflow: hidden;
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .direct-place-copy span {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #5c5c63;
    font-size: 12px;
    line-height: 17px;
    font-weight: 700;
  }
  .direct-place-copy span img { width: 16px; height: 16px; }
  .direct-place-remove {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
  }
  .direct-place-remove img { width: 24px; height: 24px; }
`;

export const AddPlaceButton = styled.button`
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  color: #1a1a1a;
  background: #f3f5fa !important;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;

  img { width: 18px; height: 18px; filter: brightness(0); }
`;

export const AddedToast = styled.div`
  position: absolute;
  z-index: 13;
  right: 20px;
  bottom: 116px;
  left: 20px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #ffffff;
  background: #242426;
  font-size: 13px;
  line-height: 18px;

  img { width: 20px; height: 20px; }
`;

export const TravelRow = styled.div`
  min-height: 47px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0 10px 4px;
  color: ${muted};
  font-size: 12px;
  line-height: 17px;

  .direct-leg-mode {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 99px;
    color: #5c5c63;
    background: #f3f5fa;
    font-size: inherit;
    line-height: inherit;
    font-weight: 700;
  }
  img { width: 16px; height: 16px; }
`;

export const SearchHeader = styled.header`
  min-height: 72px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 20px 0;

  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 22px;
    line-height: 30px;
    font-weight: 700;
  }

  > button {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
  }

  > button img {
    width: 24px;
    height: 24px;
  }
`;

export const SheetSearchField = styled.label`
  height: 48px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 20px 18px;
  padding: 0 14px;
  border: 1.5px solid transparent;
  border-radius: 14px;
  background: #f3f5fa;

  &[data-active="true"] {
    border-color: ${navy};
  }

  > img {
    width: 20px;
    height: 20px;
  }

  input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    color: #1a1a1a;
    background: transparent;
    font-size: 15px;
    line-height: 22px;
  }

  input::placeholder {
    color: #8a8a8e;
  }

  button {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    color: #ffffff;
    background: #b8b9c1;
    font-size: 15px;
    text-align: center;

    img {
      width: 11px;
      height: 11px;
      filter: brightness(0) invert(1);
    }
  }
`;

export const SearchContext = styled.div`
  height: 43px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;

  span {
    padding: 5px 8px 5px 10px;
    border-radius: 14px;
    color: #0079c2;
    background: #ddf7ff;
    font-size: 12px;
    line-height: 17px;
    font-weight: 700;
  }

  strong {
    color: #5c5c63;
    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }
`;

export const SearchTabs = styled.nav`
  height: 47px;
  flex: 0 0 auto;
  display: flex;
  gap: 23px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 20px;
  border-bottom: 1px solid ${border};
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  button {
    position: relative;
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    color: ${muted};
    font-size: 15px;
    line-height: 22px;
  }

  button[aria-pressed="true"] {
    color: ${navy};
    font-weight: 700;
  }

  button[aria-pressed="true"]::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background: ${navy};
  }

  b {
    color: #0088c9;
  }

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
`;

export const SearchScroll = styled.main`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 20px 116px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const RecentSearches = styled.section`
  margin-bottom: 24px;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  h2 {
    margin: 0;
    font-size: 13px;
  }

  header button {
    color: ${muted};
    font-size: 12px;
  }

  > div {
    display: flex;
    gap: 7px;
    overflow-x: auto;
  }

  button {
    flex: 0 0 auto;
    padding: 8px 12px;
    border: 1px solid ${border};
    border-radius: 999px;
    color: #5e5f69;
    background: #ffffff;
    font-size: 11px;
  }
`;

export const ResultHeading = styled.h2`
  margin: 0 0 5px;
  color: ${muted};
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
`;

export const PlaceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li + li {
    margin-top: 8px;
  }

  button {
    width: 100%;
    min-height: 74px;
    display: grid;
    grid-template-columns: 52px 1fr 24px;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border: 1px solid ${border} !important;
    border-radius: 14px;
    text-align: left;
  }

  button[aria-pressed="true"] {
    border-color: ${navy} !important;
    background: #f3f5fa;
  }

  button:disabled {
    opacity: 0.58;
  }

  button > img {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    object-fit: cover;
  }

  button > span {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  small {
    color: #0088c9;
    font-size: 9px;
  }

  strong {
    max-width: 100%;
    overflow: hidden;
    color: #1a1a1a;
    font-size: 14px;
    line-height: 21px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    max-width: 100%;
    overflow: hidden;
    color: ${muted};
    font-size: 12px;
    line-height: 17px;
    font-style: normal;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  i {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border: 1.5px solid #e4e6ec;
    border-radius: 50%;
    color: #ffffff;
    font-size: 10px;
    font-style: normal;
  }

  button[aria-pressed="true"] i {
    border-color: ${navy};
    background: ${navy};
  }

  i img {
    width: 23px;
    height: 23px;
  }

  button:disabled i {
    width: auto;
    padding: 0 5px;
    border: 0;
    border-radius: 6px;
    color: #777986;
    background: #ededf1;
    font-size: 8px;
  }
`;

export const GoogleConnect = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 59px;
  text-align: center;

  h2 {
    margin: 24px 0 0;
    color: #1a1a1a;
    font-size: 17px;
    line-height: 24px;
  }

  p {
    margin: 8px 0 0;
    color: ${muted};
    font-size: 13px;
    line-height: 18px;
  }

  button {
    height: 44px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 28px;
    padding: 0 18px;
    border-radius: 22px;
    color: #ffffff;
    background: ${navy};
    font-size: 14px;
    line-height: 20px;
    font-weight: 700;
  }

  button img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
`;

export const NoResults = styled(GoogleConnect)`
  padding-top: 29px;
`;

export const StateIcon = styled.span`
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f3f5fa;

  img {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }

  ${NoResults} & img {
    width: 28px;
    height: 28px;
    filter: brightness(0) saturate(100%) invert(6%) sepia(49%) saturate(2397%) hue-rotate(220deg) brightness(74%);
  }
`;

export const ConfirmOverlay = styled.div`
  position: absolute;
  z-index: 50;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgb(0 0 0 / 50%);
`;

export const ConfirmDialog = styled.section`
  width: 100%;
  max-width: 322px;
  padding: 28px 24px 20px;
  border-radius: 24px;
  background: #ffffff;
  text-align: center;

  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 17px;
    line-height: 24px;
  }

  p {
    margin: 8px 0 24px;
    color: #5c5c63;
    font-size: 14px;
    line-height: 20px;
  }

  div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  button {
    height: 52px;
    border-radius: 14px;
    background: #f3f5fa;
    font-size: 15px;
    line-height: 22px;
    font-weight: 700;
    text-align: center;
  }

  button:last-child {
    color: #ffffff;
    background: ${navy};
  }
`;

