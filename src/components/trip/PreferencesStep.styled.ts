import { Primary, Step } from "./Trip.styled";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

export const AnalysisStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  &::after {
    content: "";
    width: 14px;
    height: 14px;
    border: 2px solid #e2e1ee;
    border-top-color: #090738;
    border-radius: 50%;
    animation: ${rotate} 0.8s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) { &::after { animation: none; } }
`;
export const Prompt = styled.div<{ $active: boolean; $exceeded: boolean }>`
  position: relative;
  margin-top: 6px;
  min-height: ${({ $exceeded }) => ($exceeded ? "236px" : "132px")};
  border: 1.5px solid ${({ $active, $exceeded }) => ($exceeded ? "#ef4444" : $active ? "#090738" : "#e8eaf0")};
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 20px rgb(9 7 56 / 5%);
  padding: 14.5px 16.5px 38px;
  textarea {
    font: inherit;
    font-size: 15px;
    line-height: 1.55;
    background: none;
    border: 0;
    outline: 0;
    width: 100%;
    height: ${({ $exceeded }) => ($exceeded ? "178px" : "76px")};
    resize: none;
    min-height: 76px;
  }
  textarea::placeholder {
    color: #a8a8ae;
  }

  textarea:focus-visible { outline: none; }

  &:focus-within {
    border-color: ${({ $exceeded }) => $exceeded ? "#ef4444" : "#090738"};
  }
  span {
    position: absolute;
    bottom: 14px;
    right: 18px;
    font-size: 11px;
    color: #b5b5bd;
    b { font-weight: 500; color: ${({ $exceeded }) => ($exceeded ? "#ef4444" : "inherit")}; }
  }
`;

export const PromptError = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: -6px 4px 0;
  color: #e5484d;
  font-size: 13px;
  line-height: 18px;
  img { width: 16px; height: 16px; flex: none; }
`;

export const AiBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  margin-bottom: 8px;
  border-radius: 20px;
  color: #090738;
  background: #fff;
  font-size: 11px;
  font-weight: 700;
`;
export const Analysis = styled.div`
  border: 1px solid #e4e6ec;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 20px rgb(9 7 56 / 5%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #090738;
    font-size: 15px;
    font-weight: 700;
  }
  section {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  section > span {
    font-size: 13px;
    color: #5c5c63;
    width: 40px;
    flex-shrink: 0;
  }
`;
export const Preferences = styled(Step)`
  gap: 20px;
  header {
    min-width: 0;
  }
  > div:first-child p {
    line-height: 20px;
    margin-top: 4px;
  }
`;
export const ExampleTitle = styled.h2`
  color: #5c5c63;
  font-size: 14px;
  margin: 14px 0 12px;
`;

export const Examples = styled.div`
  display: grid;
  gap: 8px;
`;

export const Example = styled.button`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 10px 14px 10px 12px;
  border: 1px solid #e4e6ec;
  border-radius: 14px;
  background: #fff;
  text-align: left;
  color: #1a1a1a;
  font-size: 14px;

  span { display: grid; height: 32px; place-items: center; border-radius: 10px; background: #f1f2f8; }
`;
export const TasteNumber = styled.span`
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #090738;
  color: white;
  font-size: 10px;
`;

export const AnalysisChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 14px;
  background: #f3f5fa;
  color: #090738;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 700;

  button {
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    padding: 2px;
  }
`;

export const ChipChoice = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: 6px 10px;
  border: 1px dashed #c9ccd6;
  border-radius: 14px;
  color: #5c5c63;
  font-size: 13px;
  font-weight: 500;

  img { transform: rotate(-45deg); }
  select { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; }
  &:focus-within { outline: 2px solid #090738; outline-offset: 2px; }
`;

export const MakeCourse = styled(Primary)`
  &:disabled { background: #e4e6ec; color: #8a8a8e; }
`;
