import styled from "styled-components";

export const PageShell = styled.div`
  min-height: 100dvh;
  color: #1a1a1a;
  background: #eef0f4;
`;

export const Page = styled.main`
  position: relative;
  width: min(100%, 402px);
  min-height: 100dvh;
  margin: 0 auto;
  overflow-x: hidden;
  background: #fff;
  box-shadow: 0 0 30px rgb(28 28 56 / 8%);

  button { border: 0; cursor: pointer; }
`;

export const Hero = styled.header`
  position: relative;
  height: 358px;
  overflow: hidden;
  color: #fff;

  > img { width: 100%; height: 100%; object-fit: cover; }
`;

export const HeroScrim = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(5 5 15 / 52%) 0%, rgb(5 5 15 / 5%) 32%, rgb(5 5 15 / 30%) 60%, rgb(5 5 15 / 84%) 100%);
`;

export const Navigation = styled.nav`
  position: absolute;
  z-index: 5;
  top: env(safe-area-inset-top);
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: 24px 1fr 24px;
  gap: 14px;
  align-items: center;
  padding: 10px 20px;

  button { width: 24px; height: 24px; padding: 0; background: transparent; }
  button img { display: block; width: 24px; height: 24px; }
  strong { font-size: 14px; line-height: 20px; text-shadow: 0 1px 4px rgb(0 0 0 / 25%); }
`;

export const HeroTitle = styled.div`
  position: absolute;
  right: 20px;
  bottom: 24px;
  left: 20px;

  > span { display: inline-block; margin-bottom: 10px; padding: 4px 9px; border-radius: 8px; color: #6b6bcc; background: #eef0ff; font-size: 11px; font-weight: 700; }
  h1 { margin: 0; font-size: 26px; line-height: 35px; }
  p { margin: 4px 0 0; font-size: 14px; line-height: 20px; }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 20px 32px;

  @media (max-width: 401px) {
    padding-right: 14px;
    padding-left: 14px;
  }
`;

export const RegisterBanner = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: #ddf7ff;

  > span { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 50%; background: #fff; }
  img { width: 20px; height: 20px; }
  strong { font-size: 13px; line-height: 18px; }
  button { padding: 8px 12px; border-radius: 99px; color: #fff; background: #090738; font-size: 13px; font-weight: 700; }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;

  > h2 { margin: 0; font-size: 17px; line-height: 24px; }
`;

export const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 16px 8px;
  border-radius: 16px;
  background: #f3f5fa;

  div { display: flex; flex-direction: column; gap: 4px; align-items: center; min-width: 0; }
  img { width: 24px; height: 24px; margin-bottom: 4px; }
  strong { font-size: 15px; line-height: 22px; white-space: nowrap; }
  span { color: #8a8a8e; font-size: 12px; line-height: 17px; }
`;

export const DayTabs = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-end;
  border-bottom: 1px solid #e4e6ec;

  button { display: flex; gap: 5px; align-items: baseline; padding: 6px 0 11px; border-bottom: 2px solid transparent; color: #8a8a8e; background: transparent; }
  button[aria-selected="true"] { border-color: #1a1a1a; color: #1a1a1a; }
  strong { font-size: 15px; line-height: 22px; }
  span { color: #a1a1a6; font-size: 12px; line-height: 17px; }

  @media (max-width: 401px) {
    gap: 0;
    justify-content: space-between;
  }
`;

export const RouteMap = styled.div`
  position: relative;
  height: 264px;
  overflow: hidden;
  border-radius: 16px;
  background: #e8f2ef;

  > img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 66%; }
  > i { position: absolute; display: grid; width: 24px; height: 24px; place-items: center; transform: translate(-50%, -50%); border: 2px solid #fff; border-radius: 50%; color: #090738; background: #00e1ff; box-shadow: 0 2px 6px rgb(0 140 178 / 25%); font-size: 12px; font-style: normal; font-weight: 700; }
`;

export const DayHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 { margin: 0; font-size: 16px; line-height: 23px; }
  span { color: #8a8a8e; font-size: 12px; }
`;

export const PlaceList = styled.div`display: flex; flex-direction: column;`;

export const PlaceRow = styled.div`
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 12px;
`;

export const Rail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;

  b { display: grid; width: 26px; height: 26px; flex: 0 0 26px; place-items: center; border-radius: 50%; color: #090738; background: #00e1ff; font-size: 12px; }
  i { width: 2px; flex: 1; background: #d1d1d6; }
`;

export const PlaceCard = styled.article`
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 84px;
  padding: 12px;
  border: 1px solid #e4e6ec;
  border-radius: 16px;

  > img { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }
  strong, small { display: block; }
  strong { font-size: 15px; line-height: 22px; }
  small { margin-top: 4px; color: #8a8a8e; font-size: 12px; }
`;

export const TravelTime = styled.p`
  margin: 0;
  padding: 10px 4px;
  color: #5c5c63;
  font-size: 12px;
  font-weight: 700;
  span { margin-left: 7px; padding-left: 7px; border-left: 1px solid #d1d1d6; color: #8a8a8e; font-weight: 400; }
`;

export const BottomAction = styled.div`
  display: flex;
  gap: 10px;
  position: sticky;
  z-index: 5;
  bottom: 0;
  padding: 12px 20px max(34px, env(safe-area-inset-bottom));
  border-top: 1px solid #e4e6ec;
  background: #fff;

  button { width: 100%; height: 56px; border-radius: 16px; color: #fff; background: #090738; font-size: 16px; font-weight: 700; }
`;

export const Toast = styled.div`
  pointer-events: none;
  position: fixed;
  z-index: 20;
  left: 50%;
  bottom: 116px;
  display: flex;
  gap: 10px;
  align-items: center;
  width: min(calc(100% - 40px), 362px);
  padding: 15px 18px;
  transform: translateX(-50%);
  border-radius: 16px;
  color: #fff;
  background: rgb(24 24 26 / 94%);
  font-size: 14px;
  b { color: #00e1ff; }
`;

export const Overlay = styled.div`
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(9 7 56 / 42%);
`;

export const Sheet = styled.section`
  width: min(100%, 402px);
  max-height: min(86dvh, 760px);
  overflow-y: auto;
  padding: 8px 20px max(28px, env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #fff;
`;

export const Handle = styled.span`
  display: block;
  width: 44px;
  height: 4px;
  margin: 0 auto 16px;
  border-radius: 99px;
  background: #d9d9de;
`;

export const SheetHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  h2 { margin: 0; font-size: 22px; line-height: 31px; }
  p { margin: 5px 0 0; color: #8a8a8e; font-size: 13px; line-height: 19px; }
  > button { width: 32px; height: 32px; padding: 0; color: #5c5c63; background: transparent; font-size: 28px; line-height: 1; }
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 28px;
`;

export const InfoRow = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #eeeef2;
  > span { display: block; margin-bottom: 7px; color: #8a8a8e; font-size: 12px; line-height: 17px; }
  > div { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
  strong { font-size: 15px; line-height: 22px; }
  button { flex: 0 0 auto; padding: 6px 10px; border-radius: 99px; color: #090738; background: #f0f1f5; font-size: 12px; font-weight: 700; }
`;

export const PrimaryButton = styled.button`
  width: 100%;
  min-height: 56px;
  margin-top: 24px;
  border-radius: 16px;
  color: #fff;
  background: #090738;
  font-size: 16px;
  font-weight: 700;
  &:disabled { color: #a8a8ae; background: #ececf1; cursor: default; }
`;

export const CompanionChoices = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 28px;
  button { padding: 12px 0; border-radius: 18px; color: #333; background: #f3f4f7; font-size: 14px; font-weight: 700; }
  button[aria-pressed="true"] { color: #fff; background: #090738; }
`;

export const PeopleCounter = styled.div`
  display: grid;
  grid-template-columns: 44px auto 44px;
  gap: 28px;
  align-items: center;
  justify-content: center;
  padding: 28px 24px 20px;
  border-radius: 20px;
  background: #f6f6f9;

  button { display: grid; width: 44px; height: 44px; padding: 0; place-items: center; border: 1px solid #090738; border-radius: 50%; background: #090738; }
  button:first-of-type { border-color: #e2e2e8; background: #fff; }
  button:disabled { opacity: 0.35; cursor: default; }
  button img { width: 20px; height: 20px; }
  strong { color: #090738; font-size: 32px; line-height: 44px; }
  strong small { margin-left: 2px; font-size: 16px; }
  p { grid-column: 1 / -1; margin: 0; color: #8a8a8e; font-size: 12px; text-align: center; }
`;

