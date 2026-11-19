import styled from "styled-components";

const navy = "#090738";
const subtle = "#f3f5fa";
const tertiary = "#8a8a8e";

const screenBase = `
  position: relative;
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  color: #1a1a1a;
  background: #ffffff;
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;

  button {
    margin: 0;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    cursor: pointer;
  }
`;

export const LoginShell = styled.main`
  ${screenBase}
`;

export const LoginScreen = styled.div`
  position: absolute;
  inset: 0;
  background: #ffffff;
`;

export const LoginHero = styled.section`
  position: absolute;
  top: clamp(96px, calc(50% - 187px), 250px);
  right: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h1 {
    margin: 20px 0 0;
    font-size: 22px;
    line-height: 30px;
    letter-spacing: -0.11px;
  }

  p {
    margin: 8px 0 0;
    color: #5c5c63;
    font-size: 14px;
    line-height: 20px;
  }

  @media (max-height: 760px) {
    top: 108px;
  }
`;

export const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

export const SymbolCrop = styled.div`
  position: relative;
  width: 73.644px;
  height: 64px;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 342.528px;
    height: 64px;
    max-width: none;
  }
`;

export const WordmarkCrop = styled.div`
  position: relative;
  width: 132px;
  height: 34.495px;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: -52.615px;
    width: 184.615px;
    height: 34.495px;
    max-width: none;
  }
`;

export const LoginButtons = styled.div`
  position: absolute;
  right: 20px;
  bottom: max(46px, calc(env(safe-area-inset-bottom) + 22px));
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ProviderButton = styled.button`
  position: relative;
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #e4e6ec !important;
  border-radius: 14px;
  color: #1a1a1a !important;
  background: #ffffff !important;
  font-size: 16px !important;
  line-height: 22px !important;
  font-weight: 700 !important;

  img {
    width: 20px;
    height: 20px;
  }
`;

export const RecentLogin = styled.span`
  position: absolute;
  top: -10px;
  right: 14px;
  padding: 2px 8px;
  border-radius: 14px;
  color: #fff;
  background: ${navy};
  font-size: 11px;
  line-height: 17px;
`;

export const GuestButton = styled.button`
  height: 36px;
  color: #5c5c63 !important;
  text-align: center !important;
  font-size: 14px !important;
  line-height: 20px !important;
  font-weight: 500 !important;
`;

export const Dim = styled.button`
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  background: rgba(10, 10, 26, 0.45) !important;
`;

export const TermsSheet = styled.section`
  position: absolute;
  z-index: 3;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 35px 24px max(34px, calc(env(safe-area-inset-bottom) + 18px));
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  --sheet-handle-color: #d1d1d6;

  > h2 {
    margin: 0 0 28px;
    font-size: 22px;
    line-height: 30px;
    letter-spacing: -0.11px;
  }

  @media (max-height: 760px) {
    max-height: calc(100dvh - 28px);
    overflow-y: auto;
  }
`;

export const AllAgreement = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0 18px !important;
  text-align: left;

  > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  strong { font-size: 17px; line-height: 24px; }
  small { color: ${tertiary}; font-size: 13px; line-height: 18px; }
`;

export const Check = styled.span<{ $checked: boolean; $large?: boolean }>`
  width: ${({ $large }) => ($large ? "26px" : "20px")};
  height: ${({ $large }) => ($large ? "26px" : "20px")};
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: ${({ $checked }) => ($checked ? "0" : "1.5px solid #d1d1d6")};
  border-radius: 50%;

  img { width: 100%; height: 100%; }
`;

export const TermDivider = styled.div`
  height: 1px;
  background: #eeeff3;
`;

export const TermList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 10px 0 24px;
  padding: 0;
  list-style: none;

  li {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  li > button:first-child {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    text-align: left;
  }

  li > button:last-child:not(:first-child) {
    color: ${tertiary};
    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }

  span[data-optional="true"] { color: ${tertiary}; }
  span:not([data-optional]) { color: #5c5c63; }
  b { color: #5c5c63; font-size: 15px; line-height: 22px; font-weight: 400; }
`;

export const TermsSubmit = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 16px;
  color: #ffffff !important;
  background: ${navy} !important;
  text-align: center !important;
  font-size: 16px !important;
  font-weight: 700 !important;

  &:disabled { background: #d1d1d6 !important; cursor: default; }
`;

export const FlowScreen = styled.main`
  ${screenBase}
`;

export const FlowBody = styled.section`
  position: absolute;
  top: max(36px, calc(env(safe-area-inset-top) + 28px));
  right: 20px;
  left: 20px;

  > h1 {
    margin: 20px 0 0;
    font-size: 24px;
    line-height: 32px;
    letter-spacing: -0.24px;
  }
`;

export const Progress = styled.div<{ $complete?: boolean }>`
  display: flex;
  gap: 4px;

  i {
    width: 28px;
    height: 4px;
    border-radius: 2px;
    background: #00e1ff;
  }

  i:last-child { background: ${({ $complete }) => ($complete ? "#00e1ff" : "#e4e6ec")}; }
`;

export const Avatar = styled.button`
  position: relative;
  display: block;
  width: 96px;
  height: 96px;
  && { margin: 52px auto 32px; }

  .ring { position: absolute; inset: 0; width: 96px; height: 96px; }
  .photo { position: absolute; top: 8px; left: 8px; width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }

  @media (max-height: 760px) {
    && { margin-top: 24px; margin-bottom: 20px; }
  }
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #5c5c63;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
`;

export const NicknameField = styled.div<{ $valid: boolean }>`
  height: 58px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 16px;
  border: 1.5px solid ${({ $valid }) => ($valid ? navy : "#e5484d")};
  border-radius: 14px;

  input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    color: #1a1a1a;
    background: transparent;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  small { color: ${tertiary}; font-size: 12px; line-height: 17px; }
  button, button img { width: 20px; height: 20px; }
`;

export const ValidText = styled.p<{ $error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0 0;
  color: ${({ $error }) => ($error ? "#c0363b" : "#0079c2")};
  font-size: 12px;
  line-height: 17px;

  img { width: 14px; height: 14px; }
`;

export const Description = styled.p`
  margin: 6px 0 28px;
  color: ${tertiary};
  font-size: 14px;
  line-height: 20px;
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 8px;

  button {
    padding: 11px 16px;
    border-radius: 99px;
    color: #5c5c63;
    background: ${subtle};
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }

  button[aria-pressed="true"] {
    color: #ffffff;
    background: ${navy};
    font-weight: 700;
  }
`;

export const SelectionCount = styled.p`
  margin: 14px 0 0;
  color: #0079c2;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
`;

export const SkipButton = styled.button`
  position: absolute;
  z-index: 1;
  top: max(4px, env(safe-area-inset-top));
  right: 20px;
  padding: 10px 0 !important;
  color: ${tertiary} !important;
  font-size: 14px !important;
  line-height: 20px !important;
  font-weight: 500 !important;
`;

export const BottomButton = styled.button`
  position: absolute;
  right: 20px;
  bottom: max(46px, calc(env(safe-area-inset-bottom) + 22px));
  left: 20px;
  height: 56px;
  border-radius: 16px !important;
  color: #ffffff !important;
  background: ${navy} !important;
  text-align: center !important;
  font-size: 16px !important;
  line-height: 22px !important;
  font-weight: 700 !important;

  &:disabled { background: #d1d1d6 !important; cursor: default; }
`;

export const CompleteScreen = styled.main`
  ${screenBase}
  background: linear-gradient(180deg, #efedff 0%, #e6faff 55%, #ffffff 100%);
`;

export const FeatureScreen = styled.main`
  ${screenBase}
  min-height: max(620px, 100dvh);
`;

export const FeatureSkip = styled.button`
  position: absolute;
  top: max(env(safe-area-inset-top), 6.3%);
  right: 20px;
  min-height: 32px;
  color: ${tertiary} !important;
  font-size: 14px !important;
`;

export const FeatureIllustration = styled.div<{ $last: boolean }>`
  position: absolute;
  top: 39.1%;
  left: 20px;
  right: 20px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  img {
    width: min(100%, ${({ $last }) => ($last ? "328px" : "241px")});
    max-height: min(28dvh, 241px);
    object-fit: contain;
  }
`;

export const FeatureDescription = styled.section`
  position: absolute;
  top: 64.07%;
  left: 16px;
  right: 16px;
  text-align: center;
  h1 { margin: 28px 0 0; font-size: 24px; line-height: 32px; white-space: pre-line; }
  p { margin: 10px 0 0; color: #5c5c63; font-size: 14px; line-height: 20px; }
  @media (max-height: 700px) { top: 58%; }
`;

export const FeatureDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  span { width: 6px; height: 6px; border-radius: 6px; background: #caccd2; }
  [data-active="true"] { width: 18px; background: ${navy}; }
`;

export const CompleteContent = styled.section`
  position: absolute;
  top: calc(50% - 51px);
  left: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  > img { width: 180px; height: 180px; object-fit: contain; }
  h1 { margin: 28px 0 0; font-size: 26px; line-height: 35px; letter-spacing: -0.26px; }
  p { margin: 12px 0 0; color: #5c5c63; font-size: 15px; line-height: 22px; }
`;
