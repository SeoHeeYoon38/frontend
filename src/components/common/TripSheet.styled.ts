import styled from "styled-components";
export const Sheet = styled.dialog<{ $minHeight: number; $course: boolean }>`
  min-height: min(${({ $minHeight }) => $minHeight}px, calc(100dvh - 24px));
  position: fixed;
  inset: auto 0 0;
  max-width: 402px;
  width: 100%;
  max-height: ${({ $course }) => ($course ? "calc(100dvh - clamp(80px,17.2dvh,150px))" : "calc(100dvh - 56px)")};
  height: ${({ $course }) => ($course ? "min(724px,calc(100dvh - clamp(80px,17.2dvh,150px)))" : "auto")};
  border: 0;
  border-radius: 24px 24px 0 0;
  margin: 0 auto;
  padding: 0 20px;
  overscroll-behavior: contain;
  &[open] {
    display: flex;
    flex-direction: column;
  }
  > * {
    flex-shrink: 0;
  }
  background: white;
  color: #1a1a1a;
  font-family: "Noto Sans KR", Arial, sans-serif;
  overflow: hidden;
  &::backdrop {
    background: rgba(10, 10, 26, 0.45);
  }
  :where(&) :where(button) {
    font: inherit;
    cursor: pointer;
    border: 0;
    padding: 0;
    background: none;
    color: inherit;
    text-align: left;
  }
  :where(input, select) {
    font: inherit;
  }
  &:focus-visible {
    outline: none;
  }
  :where(button, input, select):focus-visible {
    outline: 3px solid #7a6fe0;
    outline-offset: 3px;
  }
`;
export const Grabber = styled.div`
  z-index: 3;
  pointer-events: none;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 5px;
  background: #d9d9de;
  border-radius: 3px;
`;
export const SheetHeader = styled.div<{
  $course: boolean;
  $compact: boolean;
  $basic?: "people" | "dates";
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: ${({ $course, $compact, $basic }) => ($course ? "34px 0 10px" : $compact ? "44px 0 8px" : $basic === "people" ? "36px 0 20px" : "44px 0 24px")};
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  h2 {
    margin: 0;
    font-size: ${({ $course, $basic }) => ($course ? "22px" : $basic ? "26px" : "24px")};
    line-height: 1.4;
  }
  button {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
`;
export const SheetBody = styled.div<{ $course: boolean; $gap?: number }>`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: clip;
  overscroll-behavior: contain;
  scrollbar-width: none;
  > * {
    flex-shrink: 0;
  }
  display: flex;
  flex-direction: column;
  gap: ${({ $course, $gap }) => $gap ?? ($course ? 12 : 20)}px;
`;
export const SheetFooter = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: white;
  padding: 24px 0 max(36px, env(safe-area-inset-bottom));
  margin-top: auto;
`;
