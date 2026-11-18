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

export const MapTabs = styled.div`
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

export const MapPin = styled.button<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #00d7f2;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 140, 178, 0.28);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
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
`;

export const MapTravel = styled.p`
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 6px 0 10px 40px;
  color: #5c5c63;
  font-size: 12px;
  img { width: 14px; height: 14px; }
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
`;

export const PlaceScreen = styled(FullScreen)`
  position: relative;
  padding-bottom: 96px;
`;

export const PlaceHero = styled.header`
  position: relative;
  height: 362px;
  color: #fff;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
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

export const GalleryIndicator = styled.div`
  position: absolute;
  z-index: 2;
  right: 18px;
  bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
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
  }

  span {
    color: #8a8a8e;
  }

  b {
    color: #27ae60;
    font-size: 12px;
  }
`;

export const LocationMap = styled.img`
  width: 100%;
  height: 210px;
  object-fit: cover;
  border-radius: 16px;
`;

export const AiButton = styled.button`
  position: fixed;
  z-index: 4;
  right: max(20px, calc((100vw - 402px) / 2 + 20px));
  bottom: 24px;
  height: 52px;
  padding: 0 22px;
  border: 0;
  border-radius: 26px;
  background: #00e1ff;
  color: #090738;
  box-shadow: 0 8px 24px rgba(0, 139, 176, 0.28);
  font-size: 15px;
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
  p { width: 100%; margin: 0; padding: 12px 14px; border-radius: 4px 16px 16px; background: #fff; box-shadow: 0 2px 12px rgba(89, 82, 178, 0.06); font-size: 14px; line-height: 20px; font-weight: 400; }
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

