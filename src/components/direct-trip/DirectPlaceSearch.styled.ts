import styled from "styled-components";

const navy = "#090738";
const muted = "#8a8a8e";
const border = "#e4e6ec";

export const Screen = styled.section`
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  color: #1a1a1a;
  background: #fff;
`;

export const Header = styled.header`
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;

  > button {
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    display: grid;
    place-items: center;
  }
  > button img { display: block; }
`;

export const SearchField = styled.label`
  flex: 1;
  min-width: 0;
  height: 46px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 14px;
  border: 1.5px solid ${navy};
  border-radius: 12px;
  background: #f3f5fa;

  > img { width: 18px; height: 18px; flex: 0 0 18px; }
  input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: none;
    color: ${navy};
    font: 400 15px/22px "Pretendard", sans-serif;
  }
  input::placeholder { color: ${muted}; }
  button { display: grid; place-items: center; flex: 0 0 18px; }
  button img { display: block; width: 18px; height: 18px; }
`;

export const TargetDay = styled.div`
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 20px;
  color: #5c5c63;
  font-size: 13px;

  button {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px 8px 5px 10px;
    border-radius: 14px;
    background: #ddf7ff;
    color: #0079c2;
    font-size: 12px;
    font-weight: 700;
  }
  button img { width: 12px; height: 12px; }
`;

export const Tabs = styled.div`
  flex: 0 0 47px;
  display: flex;
  gap: 22px;
  align-items: stretch;
  padding: 0 20px;
  border-bottom: 1px solid ${border};
  button {
    display: flex;
    align-items: center;
    gap: 5px;
    border-bottom: 2px solid transparent;
    color: ${muted};
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
  }
  button[aria-selected="true"] { color: #1a1a1a; border-bottom-color: ${navy}; font-weight: 700; }
  button img { width: 16px; height: 16px; object-fit: contain; }
`;

export const Scroll = styled.main`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px 25px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

export const Section = styled.section`
  margin-bottom: 24px;
  h2 {
    margin: 0 0 4px;
    font-size: 13px;
    line-height: 18px;
    font-weight: 700;
  }
`;

export const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  h2 { margin: 0; }
  button { color: ${muted}; font-size: 12px; }
`;

export const Recent = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 16px;
    background: #f3f5fa;
    color: #5c5c63;
    font-size: 13px;
  }
  img { width: 8.4px; height: 8.4px; }
`;

export const Categories = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  button {
    flex: 0 0 auto;
    padding: 8px 12px;
    border-radius: 16px;
    background: #f3f5fa;
    color: #5c5c63;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
  }
  button[aria-pressed="true"] { background: ${navy}; color: #fff; }
`;

export const PlaceRow = styled.button`
  width: 100%;
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  text-align: left;
  &:disabled { cursor: default; }
  &[aria-pressed="true"] strong { color: #0079c2; }
`;

export const Thumbnail = styled.span`
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  overflow: hidden;
  border-radius: 12px;
  background: #f3f5fa;
  > img { display: block; width: 52px; height: 52px; object-fit: cover; }
  .place-photo--thumbnail { width: 52px; height: 52px; border-radius: 12px; }
`;

export const PlaceInfo = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    line-height: 22px;
    font-weight: 700;
  }
  small {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    color: ${muted};
    font-size: 12px;
    line-height: 17px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  small img { width: 12px; height: 12px; object-fit: contain; }
  small i { width: 1px; height: 9px; flex: 0 0 1px; background: #d1d1d6; }
`;

export const SelectIndicator = styled.span<{ $checked: boolean }>`
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: grid;
  place-items: center;
  border: ${({ $checked }) => $checked ? "0" : "1.5px solid #d1d1d6"};
  border-radius: 50%;
  img { display: block; width: 24px; height: 24px; }
`;

export const EmptyResult = styled.div`
  min-height: 310px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  > span {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    margin-bottom: 24px;
    border-radius: 50%;
    background: #f3f5fa;
  }
  > span img { width: 28px; height: 28px; object-fit: contain; }
  h2 { margin: 0 0 10px; font-size: 17px; line-height: 24px; }
  p { margin: 0; color: ${muted}; font-size: 13px; line-height: 18px; }
  > button {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 30px;
    padding: 14px 20px;
    border-radius: 24px;
    background: ${navy};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }
  > button img { width: 18px; height: 18px; }
`;

export const State = styled.p`
  margin: 15px 0;
  color: ${muted};
  font-size: 13px;
  line-height: 18px;
`;

export const Error = styled.p`
  margin: 8px 0;
  color: #ba3131;
  font-size: 13px;
  line-height: 18px;
  button { margin-left: 5px; text-decoration: underline; }
`;

export const Footer = styled.footer`
  flex: 0 0 auto;
  display: grid;
  gap: 10px;
  padding: 12px 20px max(20px, env(safe-area-inset-bottom));
  border-top: 1px solid ${border};
  background: #fff;
  .primary {
    width: 100%;
    height: 56px;
    border-radius: 14px;
    background: ${navy};
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    text-align: center;
  }
  .primary:disabled { background: #e4e6ec; color: #b4b5bd; cursor: default; }
`;

export const SelectedPlaces = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 16px;
    background: #f3f5fa;
    font-size: 13px;
  }
  button img { width: 8.4px; height: 8.4px; }
`;

export const DayOverlay = styled.div`
  position: absolute;
  z-index: 40;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: rgb(9 7 56 / 45%);
`;

export const DaySheet = styled.section`
  width: 100%;
  max-height: 70%;
  overflow-y: auto;
  padding: 0 20px 30px;
  border-radius: 22px 22px 0 0;
  background: #fff;
  .grabber { display: block; width: 36px; height: 5px; margin: 9px auto 24px; border-radius: 3px; background: #d1d1d6; }
  header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  h2 { margin: 0; font-size: 17px; line-height: 24px; }
  header button { width: 24px; height: 24px; display: grid; place-items: center; }
  header button img { display: block; width: 24px; height: 24px; }
  .day-row {
    width: 100%;
    min-height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${border};
  }
  .day-row > span:first-child { display: grid; gap: 6px; text-align: left; }
  .day-row strong { font-size: 15px; }
  .day-row[aria-pressed="true"] strong { color: ${navy}; }
  .day-row em { color: ${muted}; font-size: 13px; font-style: normal; font-weight: 400; }
  .day-row small { color: ${muted}; font-size: 12px; }
`;

export const ImportBack = styled.button`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  margin: 8px 10px 0;
`;

export const ImportContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 20px 20px;
`;
