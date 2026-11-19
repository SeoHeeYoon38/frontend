import { Footer, Step, Title } from "./Trip.styled";
import styled from "styled-components";
import selectedCheck from "../../assets/icons/status-selected-check.svg";
export const ConnectVisual = styled.div`
  position: relative;
  width: calc(100% + 40px);
  height: 340px;
  flex-shrink: 0;
  margin: 0 -20px;
  overflow: clip;
  > img:first-child {
    position: absolute;
    left: calc(50% - 190px);
    top: 20px;
  }
  > img:nth-child(2) {
    position: absolute;
    left: calc(50% - 100px);
    top: 40px;
  }
`;
export const MapsBox = styled.div`
  position: absolute;
  left: calc(50% - 60px);
  top: 110px;
  width: 120px;
  height: 120px;
  border-radius: 34px;
  box-shadow: 0 10px 28px #0a08381f;
  background: white;
  display: grid;
  place-items: center;
  img {
    width: 68px;
    height: 68px;
    object-fit: contain;
  }
`;
export const FloatingChip = styled.div<{ $position: number }>`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border-radius: 99px;
  padding: 7px 12px 7px 10px;
  box-shadow: 0 6px 16px #0a08381a;
  font-size: 12px;
  font-weight: 700;
  left: ${({ $position }) => ($position === 0 ? "calc(50% - 143px)" : $position === 1 ? "calc(50% + 61px)" : "calc(50% + 4px)")};
  top: ${({ $position }) => ($position === 0 ? "76px" : $position === 1 ? "89px" : "252px")};
  transform: rotate(
    ${({ $position }) => ($position === 0 ? "4deg" : $position === 1 ? "-5deg" : "3deg")}
  );
`;
export const CenterState = styled.div`
  min-height: 300px;
  flex: 1;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  h2 {
    font-size: 22px;
    line-height: 1.4;
    margin: 0;
  }
  p {
    font-size: 14px;
    color: #8a8a8e;
    margin: 0;
  }
`;
export const LoadingCharacter = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
`;
export const PlaceTabs = styled.div`
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #eeeef2;
  button {
    padding: 0 0 12px;
    color: #9a9aa6;
    font-size: 15px;
    font-weight: 500;
    border-bottom: 2px solid transparent;
  }
  button[aria-pressed="true"] {
    font-weight: 700;
    color: #1a1a1a;
    border-bottom-color: #1a1a1a;
  }
`;
export const Categories = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  button {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: 14px;
    background: #f4f4f7;
    padding: 8px 10px;
    font-size: 12px;
    color: #a8a8ae;
    font-weight: 700;
  }
  button[aria-pressed="true"] {
    background: #090738;
    color: white;
  }
`;
export const PlaceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;
export const PlaceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-wrap: wrap;
  min-height: 84px;
  padding: 12px 0;
  > img {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    object-fit: cover;
  }
  > label {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }
  label > div {
    flex: 1;
    min-width: 0;
  }
  strong {
    font-size: 15px;
  }
  small {
    font-size: 11px;
    background: #f4f4f7;
    border-radius: 6px;
    padding: 1px 6px;
    color: #8a8a8e;
    margin-left: 6px;
  }
  p {
    font-size: 12px;
    color: #8a8a8e;
    margin: 4px 0 0;
    line-height: 1.5;
  }
  input {
    flex-shrink: 0;
  }
`;
export const MatchButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d8;
  border-radius: 8px;
  background: white;
  color: #090738;
  text-align: left;
  cursor: pointer;
`;
export const PlaceSearchButton = styled(MatchButton)`
  width: auto;
  flex: 0 0 auto;
  white-space: nowrap;
`;

export const Checkbox = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  margin: 0;
  border: 1.5px solid #d0d0d8;
  border-radius: 6px;
  display: grid;
  place-content: center;
  cursor: pointer;
  &:checked {
    background: #090738;
    border-color: #090738;
    background-image: url("${selectedCheck}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 20px 20px;
  }
`;

export const PlacesLead = styled.header`
  display: grid;
  gap: 8px;

  h1 {
    margin: 0;
    color: #1a1a1a;
    font-size: 22px;
    line-height: 30px;
    letter-spacing: -0.11px;
  }

  p {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    color: #8a8a8e;
    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }

  img {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }
`;

export const PlacesSummary = styled.div`
  display: flex;
  min-height: 24px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #8a8a8e;
  font-size: 13px;
  line-height: 18px;

  b {
    color: #090738;
  }

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #5c5c63;
    font-weight: 700;
    cursor: pointer;
  }
`;

export const PlaceCopy = styled.div`
  flex: 1;
  min-width: 0;

  > div {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const PlaceThumb = styled.div`
  width: 60px;
  height: 60px;
  flex: 0 0 60px;
  overflow: hidden;
  border-radius: 14px;
  background: #f3f5fa;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
  }
`;

export const PlaceStatus = styled.span`
  padding: 1px 6px;
  border-radius: 6px;
  color: #8a8a8e;
  background: #f3f5fa;
  font-size: 11px;
  line-height: 15px;
  font-weight: 500;
  white-space: nowrap;
`;

export const InlineActions = styled.div`
  display: flex;
  flex-basis: 100%;
  gap: 8px;
  padding-left: 72px;

  button {
    width: auto;
    padding: 7px 10px;
    font-size: 12px;
    text-align: center;
  }
`;

export const SearchSection = styled.section`
  display: grid;
  gap: 10px;

  form {
    display: flex;
    gap: 8px;
  }

  form > label {
    flex: 1;
    min-width: 0;

    input {
      font-size: 13px;
    }
  }
`;
export const CourseCard = styled.div`
  border: 1px solid #e7e6ef;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  h3 {
    font-size: 15px;
    margin: 0;
  }
  p {
    font-size: 12px;
    color: #8a8a8e;
    margin: 0;
  }
  > p:last-of-type {
    color: #7b6fe9;
  }
  button {
    padding: 12px;
    background: #f5f5f9;
    border-radius: 12px;
    text-align: center;
    font-size: 13px;
    color: #090738;

    img {
      width: 14px;
      height: 14px;
      margin-left: 3px;
      vertical-align: -2px;
    }
  }
`;
export const CoursePath = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  img {
    width: 12px;
    height: 12px;
  }
`;
export const CoursePhotos = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 45px 45px;
  gap: 3px;
  border-radius: 14px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  img:first-child {
    grid-row: span 2;
  }
`;
export const RouteImage = styled.img`
  width: 100%;
  height: 176px;
  object-fit: cover;
  border-radius: 20px;
`;

export const ConnectStep = styled(Step)`
  gap: 20px;
  > header {
    padding-top: 9px;
    flex-shrink: 0;
  }
`;
export const PlacesTitle = styled(Title)`
  font-size: 22px;
`;
export const DetailMap = styled(RouteImage)<{ $expanded: boolean }>`
  height: ${({ $expanded }) => ($expanded ? "min(400px,50dvh)" : "auto")};
  aspect-ratio: 362 / 176;
`;

export const EmptyState = styled(CenterState)`
  gap: 0;
  min-height: 238px;
  padding: 12px 0 44px;
  h2 {
    font-size: 24px;
    line-height: 32px;
    letter-spacing: -0.24px;
    margin-top: 22px;
  }
  p {
    margin-top: 12px;
    line-height: 20px;
    font-weight: 500;
  }
`;
export const EmptyArt = styled.div`
  display: grid;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  background: #f3f5fa;
`;
export const CourseMap = styled.div`
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  > button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: white;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 2px 6px #0002;
  }
`;
export const CourseStop = styled.div`
  display: flex;
  gap: 12px;
  align-items: stretch;
  min-width: 0;
`;
export const StopRail = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 26px;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  &::after {
    content: "";
    position: absolute;
    top: 46px;
    bottom: 0;
    left: 12px;
    width: 2px;
    background: #d5d7e2;
  }
  span {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #00e1ff;
    color: #090738;
    font-size: 12px;
    font-weight: 700;
  }
  ${CourseStop}:last-child &::after {
    display: none;
  }
`;
export const StopContent = styled.div`
  flex: 1;
  min-width: 0;
`;
export const StopCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 82px;
  border: 1px solid #ecedf2;
  border-radius: 16px;
  padding: 12px;
  > img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 12px;
    flex-shrink: 0;
  }
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
    cursor: pointer;
  }
  label > div {
    flex: 1;
    min-width: 0;
  }
  strong {
    font-size: 15px;
    overflow-wrap: anywhere;
  }
  p {
    font-size: 12px;
    color: #8a8a8e;
    margin: 4px 0 0;
  }
  input {
    flex-shrink: 0;
  }
`;

export const StopMove = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px 4px;
  font-size: 12px;
  line-height: 18px;
  color: #8a8a8e;
  b {
    color: #555;
  }
`;

export const PlacesStep = styled(Step)<{ $empty: boolean }>`
  gap: ${({ $empty }) => ($empty ? "10px" : "14px")};
  > ${Footer} {
    position: sticky;
    bottom: 0;
    margin-top: auto;
  }
`;

export const LoadingState = styled(CenterState)`
  gap: 0;
  padding-bottom: 80px;
  > img:first-child {
    margin-bottom: 36px;
  }
  > p {
    margin-top: 8px;
  }
  > img:last-child {
    margin-top: 24px;
  }
`;

export const RecommendHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  strong {
    font-size: 14px;
    line-height: 20px;
  }
  p {
    margin-top: 4px;
  }
  b {
    color: #090738;
  }
  button {
    flex-shrink: 0;
    color: #090738;
    font-size: 12px;
    line-height: 20px;

    img {
      width: 12px;
      height: 12px;
      margin-left: 2px;
      vertical-align: -2px;
    }
  }
`;

export const SuggestedSection = styled.section`
  display: grid;
  gap: 12px;
  min-width: 0;

  > h2 { margin: 0; font-size: 16px; line-height: 22px; }
  > p { margin: 0; color: #8a8a8e; font-size: 14px; line-height: 20px; }
`;

export const SuggestedCarousel = styled.div`
  display: flex;
  gap: 12px;
  margin-right: -20px;
  padding-right: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
`;

export const SuggestedCourse = styled.button`
  position: relative;
  width: min(232px, 72%);
  flex: none;
  overflow: hidden;
  border: 1px solid #e4e6ec;
  border-radius: 18px;
  background: #fff;
  text-align: left;
  scroll-snap-align: start;
  padding: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &[data-selected="true"] { border-color: #090738; box-shadow: inset 0 0 0 .5px #090738; }

  > .suggested-cover {
    display: grid;
    gap: 3px;
    width: 100%;
    height: 168px;
    overflow: hidden;
    background: #f3f5fa;
  }
  .suggested-cover[data-count="2"], .suggested-cover[data-count="3"] { grid-template-columns: 148fr 81fr; }
  .suggested-cover[data-count="3"] { grid-template-rows: 1fr 1fr; }
  .suggested-cover[data-count="3"] > :first-child { grid-row: span 2; }
  .suggested-cover > * { width: 100%; height: 100%; min-height: 0; min-width: 0; border-radius: 0; object-fit: cover; }
  .suggested-check { position: absolute; top: 12px; right: 12px; width: 26px; height: 26px; }

  > .suggested-course-copy {
    display: grid;
    gap: 8px;
    width: 100%;
    min-height: 123px;
    align-content: start;
    padding: 12px 14px 14px;
  }

  strong { font-size: 15px; line-height: 22px; color: #1a1a1a; }
  .suggested-course-copy > span { display: flex; align-items: center; min-width: 0; gap: 4px; color: #5c5c63; font-size: 12px; line-height: 17px; }
  .suggested-route > span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .suggested-route > small { flex: none; font-size: inherit; color: #8a8a8e; }
  .suggested-course-copy img { flex: none; }
`;

export const RecommendedMap = styled(CourseMap)`
  height: 176px;
  & > .course-map { height: 100%; }
`;

export const SuggestedStops = styled.div`
  margin-top: 8px;
`;

export const SuggestedStopCard = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 82px;
  border: 1px solid #e4e6ec;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  .place-photo { flex: none; width: 56px; height: 56px; overflow: hidden; border-radius: 12px; }
  > span:nth-child(2) { min-width: 0; flex: 1; }
  strong { display: block; font-size: 15px; line-height: 22px; color: #1a1a1a; }
  small { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 12px; line-height: 17px; color: #8a8a8e; }
  small > b { color: #5c5c63; }
  small > i { width: 1px; height: 10px; background: #d1d1d6; }
`;

export const SuggestedStopMove = styled.div`
 height: 37px;
`;

export const SuggestedDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;

  span { width: 6px; height: 6px; border-radius: 999px; background: #d1d1d6; }
  [data-active="true"] { width: 18px; background: #090738; }
`;
