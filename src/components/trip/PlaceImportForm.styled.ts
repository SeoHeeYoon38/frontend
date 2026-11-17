import styled from "styled-components";

export const Flow = styled.section`
  display: flex; min-height: 100%; flex: 1; flex-direction: column; gap: 20px; color: #1a1a1a;
  min-width: 0;
`;

export const Heading = styled.header`
  h1 { margin: 0; font-size: 22px; line-height: 30px; letter-spacing: -0.4px; }
  p { display: flex; align-items: center; gap: 6px; margin: 7px 0 0; color: #8a8a8e; font-size: 13px; line-height: 20px; }
  p img { width: 14px; height: 18px; object-fit: contain; }
`;

export const MethodList = styled.div`display: flex; flex-direction: column; gap: 12px;`;

export const MethodCard = styled.button`
  width: 100%; min-height: 126px; display: flex; align-items: center; gap: 12px; padding: 18px 14px;
  border: 1px solid #e5e5ea; border-radius: 18px; background: #fff; text-align: left; box-shadow: 0 1px 2px rgb(10 8 56 / 3%);
  > img { width: 14px; height: 14px; flex: 0 0 auto; }
`;

export const MethodIcon = styled.span<{ $tone: "blue" | "purple" }>`
  width: 44px; height: 44px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 50%;
  background: ${({ $tone }) => $tone === "blue" ? "#e8f7ff" : "#f0eeff"};
  img { width: 24px; height: 24px; }
`;

export const MethodContent = styled.span`
  min-width: 0; flex: 1;
  strong { display: block; font-size: 15px; line-height: 22px; }
  p { margin: 5px 0 10px; color: #6b6b70; font-size: 12px; line-height: 18px; word-break: keep-all; }
`;

export const Badges = styled.span`
  display: flex; flex-wrap: wrap; gap: 4px;
  b, span { padding: 3px 7px; border-radius: 999px; background: #f4f4f7; color: #8a8a8e; font-size: 10px; line-height: 14px; font-weight: 500; }
  b { background: #e9f8ff; color: #0079c2; font-weight: 700; }
`;

export const InfoBox = styled.div`
  display: flex; align-items: flex-start; gap: 8px; padding: 14px; border-radius: 12px; background: #f6f6f8;
  img { width: 16px; height: 16px; margin-top: 1px; }
  p { margin: 0; color: #77777d; font-size: 11px; line-height: 17px; word-break: keep-all; }
`;

export const SkipButton = styled.button`
  min-height: 40px; margin-top: auto; color: #8a8a8e; font-size: 14px; text-align: center;
`;

export const MethodSkipButton = styled.button`
  width: 100%; min-height: 54px; margin-top: auto; border-radius: 14px;
  color: #8a8a8e; background: #f3f5fa; font-size: 15px; font-weight: 700;
`;

export const GuideList = styled.ol`
  display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none;
`;

export const GuideStep = styled.li`
  display: grid; gap: 10px; padding: 16px; border: 1px solid #e0e3eb; border-radius: 16px;
  &:first-child { border-color: #090738; }
  > div { display: flex; align-items: flex-start; gap: 12px; }
  b { width: 28px; height: 28px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 50%; background: #daf5fc; color: #0079c2; font-size: 13px; }
  &:first-child b { background: #090738; color: #fff; }
  strong { display: block; font-size: 16px; line-height: 22px; }
  small { display: block; color: #6b6b70; font-size: 12px; line-height: 18px; }
`;

export const GuideChecks = styled.section`
  display: grid; gap: 8px; padding: 14px; border-radius: 12px; background: #f1f3f9;
  p { display: flex; gap: 8px; margin: 0; align-items: flex-start; font-size: 13px; line-height: 19px; }
  img { width: 14px; height: 14px; flex: 0 0 auto; }
`;

export const ExternalLink = styled.a`
  min-height: 42px; display: grid; place-items: center; border-radius: 12px; background: #daf5fc;
  color: #0079c2; font-size: 13px; font-weight: 700; text-decoration: none;
`;

export const DropZone = styled.label`
  min-height: 234px; display: flex; align-items: center; justify-content: center; flex-direction: column;
  border: 1.5px dashed #d9d9df; border-radius: 18px; cursor: pointer;
  strong { margin-top: 12px; font-size: 15px; } span { margin-top: 4px; color: #a0a0a5; font-size: 11px; }
  > b { display: flex; align-items: center; gap: 5px; margin-top: 13px; padding: 7px 12px; border: 1px solid #dedee5; border-radius: 8px; font-size: 11px; }
  > b img { width: 14px; height: 14px; }
`;

export const EmptyIcon = styled.span`
  width: 80px; height: 80px; display: grid; place-items: center; border-radius: 50%; background: #f4f4f7;
  img { width: 68px; height: 68px; }
`;

export const SelectedFile = styled.div<{ $error: boolean }>`
  display: flex; align-items: center; gap: 10px; padding: 13px; border: 1px solid ${({ $error }) => $error ? "#e5484d" : "#e4e4e9"}; border-radius: 14px;
  > div { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 2px; }
  strong { overflow: hidden; font-size: 12px; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
  span { color: #8a8a8e; font-size: 10px; } button { flex: 0 0 auto; color: #6b6b70; font-size: 11px; }
  button img { width: 18px; height: 18px; }
`;

export const FileIcon = styled.span<{ $error: boolean }>`
  width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px;
  background: ${({ $error }) => $error ? "#fff0f0" : "#e8f7ff"}; img { width: 22px; height: 22px; }
`;

export const SupportBox = styled.div`
  display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 14px; background: #f6f6f8;
  > strong { margin-bottom: 2px; font-size: 12px; }
  p { display: flex; align-items: flex-start; gap: 7px; margin: 0; color: #6f6f75; font-size: 10px; line-height: 16px; }
  p img { width: 14px; height: 14px; flex: 0 0 auto; }
`;

export const ErrorBox = styled.div`
  display: flex; align-items: flex-start; gap: 8px; padding: 12px; border: 1px solid #ffd1d1; border-radius: 12px; background: #fff5f5;
  img { width: 16px; height: 16px; flex: 0 0 auto; }
  p { margin: 0; color: #ba3131; font-size: 12px; line-height: 18px; } small { color: #8a6363; font-size: 10px; }
`;

export const FormFooter = styled.div`
  display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding-top: 12px;
  flex-shrink: 0;
`;

export const PrimaryButton = styled.button`
  width: 100%; min-height: 54px; border-radius: 14px; background: #090738; color: #fff; font-size: 15px; font-weight: 700;
  padding: 12px 16px;
  line-height: 1.5;
  text-align: center;
  white-space: normal;
  overflow-wrap: anywhere;
  &:disabled { background: #ececf1; color: #a8a8ae; cursor: default; }
`;

export const GuideLink = styled.button`
  min-height: 36px; display: flex; align-items: center; justify-content: center; gap: 2px; color: #0079c2; font-size: 11px;
  img { width: 13px; height: 13px; }
`;

export const LinkForm = styled.form`
  display: flex; min-height: 320px; flex: 1; flex-direction: column; gap: 10px;
  label { font-size: 13px; font-weight: 700; }
`;

export const LinkInput = styled.div`
  display: flex; gap: 8px; align-items: center; padding: 8px; border-radius: 12px; background: #f1f3f9;
  &:focus-within { outline: 1px solid #090738; }
  input { flex: 1; min-width: 0; padding: 8px; border: 0; background: transparent; font-size: 13px; }
  button { flex-shrink: 0; min-height: 36px; padding: 6px 10px; border: 1px solid #e0e3eb; border-radius: 8px; background: #fff; font-size: 13px; }
`;

export const LinkGuide = styled.section`
  padding: 16px; border: 1px solid #e0e3eb; border-radius: 16px;
  strong { font-size: 14px; }
  ol { display: grid; gap: 8px; margin: 12px 0; padding-inline-start: 24px; font-size: 12px; line-height: 18px; color: #5c5c63; }
`;
