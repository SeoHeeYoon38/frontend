import styled from "styled-components";

export const FullScreen = styled.main`
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
  color: #1a1a1a;
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;
`;

export const MapScreen = styled(FullScreen)`
  position: relative;
  height: 100dvh;
`;

export const MapHeader = styled.header`
  height: 100px;
  padding: 8px 20px 12px;
  background: #fff;

  > div:first-child {
    display: grid;
    grid-template-columns: 28px 1fr 28px;
    align-items: center;
    min-height: 38px;
  }

  h1 {
    margin: 0;
    text-align: center;
    font-size: 17px;
  }

  &[data-public-course] {
    position: relative;
    z-index: 1;
    padding-top: 0;
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    > div:first-child { min-height: 44px; }
    > div:first-child > button { width: 44px; height: 44px; margin-left: -14px; }
    h1 { line-height: 24px; letter-spacing: -.085px; }
  }

  button {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 0;
    padding: 0;
    background: none;
    cursor: pointer;

    img {
      width: 10px;
      height: 18px;
    }
  }
`;

export const MapTabs = styled.div<{ $publicCourse: boolean }>`
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #e4e6ec;
  overflow-x: auto;
  scrollbar-width: none;

  button {
    display: flex;
    align-items: center;
    gap: 5px;
    width: auto;
    flex-shrink: 0;
    min-height: 45px;
    padding: 0 0 1px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #8a8a8e;
    font-size: 15px;
    white-space: nowrap;
  }

  button[aria-pressed="true"] {
    border-bottom-color: #1a1a1a;
    color: #1a1a1a;
    font-weight: 700;
  }
  button small { color: #8a8a8e; font-size: 12px; font-weight: 400; }
  ${({ $publicCourse }) => $publicCourse && `
    gap: 8px;
    border-bottom: 0;
    align-items: flex-start;
    padding-top: 10px;
    min-height: 56px;
    button { min-height: 34px; padding: 7px 14px; border: 1px solid #e4e6ec; border-radius: 16px; color: #5c5c63; font-size: 13px; line-height: 18px; font-weight: 500; }
    button strong { font-weight: inherit; }
    button[aria-pressed="true"] { min-height: 32px; border: 0; background: #090738; color: #fff; font-weight: 700; }
  `}
`;

export const MapCanvas = styled.div<{ $selected: boolean; $showCourseList: boolean }>`
  position: absolute;
  top: 100px;
  right: 0;
  bottom: ${({ $showCourseList }) => $showCourseList ? "min(328px, 42dvh)" : "0"};
  left: 0;
  overflow: hidden;
  background: #e7edf0;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  > .course-map {
    height: 100%;
    border-radius: 0;
  }

  ${({ $selected }) => $selected ? ".course-map__controls { bottom: 194px; }" : ""}

  > p {
    margin: 20px;
  }
`;

export const SampleMapLayer = styled.div`
  position: absolute;
  top: -100px;
  left: 0;
  width: 100%;
  aspect-ratio: 402 / 874;
  max-height: 100dvh;
  > img, > svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
`;

export const SampleMapControls = styled.div<{ $selected: boolean; $showList: boolean }>`
  position: absolute;
  inset: auto 16px ${({ $selected, $showList }) => $selected ? "220px" : $showList ? "14px" : "24px"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  > a, > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 0;
    border-radius: 999px;
    background: #fff;
    color: #1a1a1a;
    box-shadow: 0 2px 10px rgb(9 7 56 / 16%);
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    pointer-events: auto;
  }
  > a {
    min-height: ${({ $selected }) => $selected ? 40 : 36}px;
    padding: ${({ $selected }) => $selected ? "0 14px 0 12px" : "0 12px 0 10px"};
    font-size: ${({ $selected }) => $selected ? 13 : 12}px;
    transform: translateY(${({ $showList }) => $showList ? 4 : 0}px);
  }
  > a img { width: ${({ $selected }) => $selected ? 16 : 14}px; height: auto; object-fit: contain; }
  > button { width: 40px; height: 40px; padding: 10px; }
  > button img { width: 20px; height: 20px; }
`;

export const MapPin = styled.button<{ $x: number; $y: number; $overview: boolean }>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  transform: translate(-50%, -50%);
  display: grid;
  place-content: center;
  width: ${({ $overview }) => $overview ? 24 : 26}px;
  height: ${({ $overview }) => $overview ? 24 : 26}px;
  padding: 0;
  border: 2.5px solid #fff;
  border-radius: 50%;
  background: #00e1ff;
  color: ${({ $overview }) => $overview ? "#fff" : "#090738"};
  box-shadow: 0 2px 6px ${({ $overview }) => $overview ? "rgb(0 140 178 / 25%)" : "rgb(9 7 56 / 22%)"};
  font-size: ${({ $overview }) => $overview ? 13 : 12}px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  &[aria-pressed="true"] { width: 34px; height: 34px; background: #090738; color: #fff; font-size: 14px; }
`;

export const DaySheet = styled.section`
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 0;
  height: min(348px, 44dvh);
  max-height: calc(100% - 100px);
  overflow-y: auto;
  padding: 28px 20px 32px;
  border-radius: 24px 24px 0 0;
  background: #fff;
  box-shadow: 0 -6px 24px rgba(16, 16, 40, 0.14);
  scrollbar-width: none;

  --sheet-handle-top: 10px;
  --sheet-handle-width: 38px;
  --sheet-handle-height: 4px;
  --sheet-handle-color: #d1d1d6;

  h2 {
    margin: 0 0 4px;
    font-size: 20px;
  }

  > p {
    margin: 0 0 16px;
    color: #8a8a8e;
    font-size: 12px;
  }
  > p span::before { content: " · "; }
  &[data-public-course] {
    height: min(341px, 44dvh);
    padding-bottom: 40px;
    box-shadow: 0 -6px 24px rgb(9 7 56 / 14%);
    --sheet-handle-width: 36px;
    --sheet-handle-color: #d9dae2;
    h2 { font-size: 18px; line-height: 25px; letter-spacing: -.09px; }
    > p { display: flex; align-items: center; gap: 8px; color: #5c5c63; font-weight: 500; line-height: 17px; }
    > p span { display: inline-flex; align-items: center; gap: 8px; }
    > p span::before { content: ""; width: 1px; height: 10px; background: #d1d1d6; }
    > section > div { position: relative; }
    > section > div:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 12px;
      top: 46px;
      bottom: 0;
      width: 2px;
      background: #d1d1d6;
      pointer-events: none;
    }
  }
`;

export const MapTravel = styled.p`
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 6px 0 10px 40px;
  color: #5c5c63;
  font-size: 12px;
  img { width: 14px; height: 14px; }
  strong { font-weight: inherit; }
  strong + span::before { content: "· "; }
  [data-public-course] & {
    margin: 0 0 0 38px;
    padding: 10px 0 10px 4px;
    line-height: 17px;
    strong { font-weight: 700; }
    span { display: inline-flex; align-items: center; gap: 6px; color: #8a8a8e; font-weight: 500; }
    strong + span::before { content: ""; width: 1px; height: 10px; background: #d1d1d6; }
  }
`;

export const MapPlaceRow = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 0;
  margin-bottom: 8px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;

  .map-place-card {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 82px;
    padding: 11px 12px;
    border: 1px solid #e4e6ec;
    border-radius: 16px;
  }

  b:first-child {
    display: grid;
    width: 26px;
    height: 26px;
    place-items: center;
    border-radius: 50%;
    background: #00e1ff;
    color: #090738;
    font-size: 12px;
  }

  img {
    width: 58px;
    height: 58px;
    border-radius: 12px;
    object-fit: cover;
  }

  strong,
  small {
    display: block;
  }

  strong {
    font-size: 15px;
  }

  small {
    margin-top: 5px;
    color: #8a8a8e;
    font-size: 12px;
  }
  [data-public-course] & {
    align-items: start;
    gap: 12px;
    margin-bottom: 0;
    > b { margin-top: 20px; }
    .map-place-card { padding: 12px; }
    img, .place-photo--thumbnail { width: 56px; height: 56px; }
    strong { line-height: 22px; }
    small { margin-top: 4px; line-height: 17px; font-weight: 500; }
  }
`;

export const MapSelection = styled.section`
  position: absolute;
  z-index: 2;
  inset: auto 24px max(28px, env(safe-area-inset-bottom));
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 6px 24px rgb(16 16 40 / 18%);

  > div { display: flex; align-items: center; gap: 12px; }
  strong b { display: inline-grid; width: 18px; height: 18px; margin-right: 2px; place-items: center; border-radius: 50%; background: #00d7f2; color: #090738; font-size: 12px; }
  img { width: 64px; height: 64px; object-fit: cover; border-radius: 14px; }
  small { display: block; margin-top: 4px; color: #8a8a8e; }
  button {
    min-height: 48px;
    border: 0;
    border-radius: 12px;
    background: #090738;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
  }
  &[data-public-course] {
    bottom: max(34px, env(safe-area-inset-bottom));
    box-shadow: 0 6px 24px rgb(9 7 56 / 14%);
    .map-selection-info { display: grid; gap: 4px; }
    strong { display: flex; align-items: center; gap: 6px; font-size: 16px; line-height: 22px; }
    strong b { margin: 0; flex-shrink: 0; background: #090738; color: #fff; font-size: 10px; line-height: 14px; }
    small { margin: 0; font-size: 13px; line-height: 18px; }
    .map-selection-travel { color: #5c5c63; font-size: 12px; line-height: 17px; font-weight: 500; }
    img, .place-photo--thumbnail { width: 64px; height: 64px; border-radius: 12px; }
    button { font-size: 15px; line-height: 22px; }
  }
`;

export const PlaceScreen = styled(FullScreen)`
  position: relative;
  padding-bottom: 96px;
`;

export const PlaceHero = styled.header`
  position: relative;
  height: 362px;
  color: #fff;
  .place-gallery__count { top: auto; bottom: 16px; }
  .place-gallery__navigation { opacity: 0; }
  .place-gallery__navigation button { pointer-events: none; }
  .place-gallery__navigation:focus-within { opacity: 1; }
  @media (hover: hover) {
    &:hover .place-gallery__navigation { opacity: 1; }
    &:hover .place-gallery__navigation button { pointer-events: auto; }
  }

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 150px;
    background: linear-gradient(rgba(10, 10, 26, 0.55), transparent);
  }
`;

export const PlaceNavigation = styled.div`
  position: absolute;
  z-index: 3;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 8px 20px;

  button {
    border: 0;
    color: #fff;
    background: transparent;
    cursor: pointer;

    img {
      display: block;
      max-width: 20px;
      max-height: 20px;
    }
  }

`;

export const PlaceBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 20px 40px;

  section h2 {
    margin: 0 0 14px;
    font-size: 18px;
  }

  section p {
    margin: 0;
    color: #5c5c63;
    font-size: 14px;
    line-height: 22px;
  }
`;

export const PlaceTitle = styled.section`
  > span {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 7px;
    color: #5c5c63;
    background: #f3f5fa;
    font-size: 11px;
  }

  h1 {
    margin: 10px 0 2px;
    font-size: 26px;
    line-height: 35px;
  }

  > small {
    color: #8a8a8e;
    font-size: 14px;
  }

  > p {
    margin-top: 12px !important;
    color: #1a1a1a !important;
    font-weight: 700;

    span {
      color: #8a8a8e;
      font-weight: 400;
    }
  }
`;

export const InfoRows = styled.div`
  display: flex;
  flex-direction: column;

  div {
    display: grid;
    grid-template-columns: 76px 1fr auto;
    gap: 0;
    padding: 14px 0;
    border-bottom: 1px solid #e4e6ec;
    font-size: 13px;
    align-items: start;
  }
  strong { font-weight: 500; line-height: 20px; }
  strong b, strong small { display: block; margin-top: 6px; }
  strong small { font-size: 12px; color: #8a8a8e; }
  a, button { padding: 0; border: 0; color: #5c5c63; background: none; font: inherit; text-decoration: none; cursor: pointer; }

  span {
    color: #8a8a8e;
  }

  b {
    color: #27ae60;
    font-size: 12px;
  }
`;

export const LocationPreview = styled.div`
  position: relative;
  > a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border-radius: 18px;
    background: #fff;
    color: #19191b;
    font-size: 13px;
    font-weight: 600;
    line-height: 17px;
    text-decoration: none;
  }
  > img + a, > iframe + a {
    position: absolute;
    right: 8px;
    bottom: 9px;
  }
  > iframe + a { bottom: 24px; }
`;
export const LocationMap = styled.img`
  display: block;
  width: 100%;
  height: 168px;
  object-fit: cover;
  border-radius: 16px;
`;
export const EmbeddedMap = styled.iframe`
  display: block;
  width: 100%;
  height: 168px;
  border: 0;
  border-radius: 16px;
`;
export const MapLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: #090738;
  font-size: 14px;
  font-weight: 600;
`;
export const NearbyPlaces = styled.ul`
  display: flex;
  gap: 10px;
  overflow: auto;
  margin: 0 -20px 0 0;
  padding: 0 20px 0 0;
  list-style: none;
  li { flex: 0 0 140px; }
  img { display: block; width: 140px; height: 100px; border-radius: 12px; object-fit: cover; }
  strong { display: block; margin: 8px 0 4px; font-size: 15px; line-height: 20px; }
  small { font-size: 12px; color: #8a8a8e; }
`;
export const Reviews = styled.section`
  display: grid;
  gap: 14px;
  header { display: flex; align-items: center; gap: 8px; }
  header h2 { margin: 0; }
  small { color: #8a8a8e; font-size: 12px; }
  aside, article { padding: 16px; border-radius: 16px; }
  aside { background: #f3f5fa; }
  aside strong, article strong { font-size: 14px; }
  aside ul { margin: 8px 0 0; padding-left: 18px; font-size: 13px; line-height: 21px; }
  article { border: 1px solid #e4e6ec; }
  article small { display: block; margin: 3px 0 8px; }
  > a { justify-content: center; height: 48px; border: 1px solid #e4e6ec; border-radius: 12px; }
`;

export const AiButton = styled.button`
  position: fixed;
  z-index: 4;
  right: max(20px, calc((100vw - 402px) / 2 + 20px));
  bottom: max(34px, env(safe-area-inset-bottom));
  height: 44px;
  padding: 0 16px;
  border: 0;
  border-radius: 26px;
  background: #00e1ff;
  color: #090738;
  box-shadow: 0 8px 24px rgba(0, 139, 176, 0.28);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  img { width: 16px; height: 16px; margin-right: 8px; vertical-align: -3px; }
`;

export const AiScreen = styled(FullScreen)`
  position: relative;
  height: 100dvh;
  background: linear-gradient(180deg, #f3f1ff 0%, #eefbff 45%, #ffffff 85%);
`;

export const AiHeader = styled.header`
  height: 60px; display: flex; align-items: center; gap: 10px; padding: 0 20px; background: #fff;
  > button { width: 18px; height: 36px; display: grid; place-items: center; margin-right: 2px; border: 0; background: none; }
  > button img { width: 10px; height: 18px; }
  > img { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; }
  > span { display: flex; flex-direction: column; }
  strong { font-size: 15px; line-height: 22px; }
  small { color: #8a8a8e; font-size: 12px; line-height: 17px; }
`;

export const AiMessages = styled.section`
  display: flex; flex-direction: column; gap: 20px; max-height: calc(100dvh - 192px); overflow-y: auto; padding: 24px 20px 160px;
`;

export const AiMessage = styled.article`
  display: flex; align-items: flex-start; gap: 10px;
  > img { width: 32px; height: 32px; flex: 0 0 auto; object-fit: contain; }
  > div { min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
  small { color: #8a8a8e; font-size: 12px; line-height: 17px; }
  p { width: 100%; margin: 0; padding: 12px 14px; border-radius: 4px 16px 16px; background: #fff; box-shadow: 0 2px 12px rgba(89, 82, 178, 0.06); font-size: 14px; line-height: 20px; font-weight: 400; white-space: pre-line; }
  button { padding: 5px 10px; border: 1px solid #e4e6ec; border-radius: 99px; background: #fff; color: #5c5c63; font-size: 11px; line-height: 15px; }
`;

export const UserMessage = styled.p`
  align-self: flex-end; max-width: 80%; margin: 0; padding: 10px 14px; border-radius: 16px 4px 16px 16px; background: #090738; color: #fff; font-size: 14px; line-height: 20px;
`;

export const AiComposer = styled.footer`
  position: absolute; right: 0; bottom: 0; left: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 0 34px; border-top: 1px solid #eeeff3; background: #fff;
  form { position: relative; display: flex; margin: 0 20px; }
  input { width: 100%; height: 48px; padding: 6px 50px 6px 18px; border: 0; border-radius: 99px; outline: 0; background: #f3f5fa; font: inherit; font-size: 14px; }
  form button { position: absolute; top: 6px; right: 6px; width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 50%; background: #090738; }
  form button img { width: 16px; height: 16px; }
`;

export const AiSuggestions = styled.div`
  display: flex; gap: 8px; overflow-x: auto; padding: 0 20px; scrollbar-width: none;
  button { flex: 0 0 auto; padding: 8px 14px; border: 0; border-radius: 99px; background: #f3f5fa; color: #5c5c63; font-size: 13px; line-height: 18px; }
`;

