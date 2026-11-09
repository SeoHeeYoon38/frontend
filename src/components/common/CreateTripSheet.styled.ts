import styled from "styled-components";
import { Link } from "react-router";

export const Sheet = styled.dialog`
  position: fixed;
  inset: auto 0 0;
  width: min(100%, 402px);
  max-width: none;
  max-height: calc(100dvh - 24px);
  margin: 0 auto;
  padding: 0 20px;
  border: 0;
  border-radius: 24px 24px 0 0;
  background: #fff;
  color: #1a1a1a;
  overscroll-behavior: contain;

  &::backdrop {
    background: #0907386b;
  }

  h2 {
    margin: 0 0 20px;
    font-size: 22px;
    line-height: 30px;
    letter-spacing: -0.11px;
  }

  :focus-visible {
    outline: 3px solid #7a6fe0;
    outline-offset: 2px;
  }
`;

export const Handle = styled.button`
  display: flex;
  width: 64px;
  height: 37px;
  justify-content: center;
  margin: 0 auto;
  padding-top: 8px;
  border: 0;
  background: none;
  cursor: pointer;

  &::after {
    width: 36px;
    height: 5px;
    border-radius: 3px;
    background: #d1d1d6;
    content: "";
  }
`;

export const Options = styled.div`
  display: grid;
  gap: 10px;
`;

export const Option = styled(Link)`
  display: flex;
  min-height: 84px;
  align-items: center;
  gap: 14px;
  padding: 14px 16px 14px 14px;
  border-radius: 18px;
  background: #f3f5fa;
  color: inherit;
  text-decoration: none;

  > img {
    flex: 0 0 auto;
  }
`;

export const Thumbnail = styled.span<{ $variant: "ai" | "course" | "direct" }>`
  display: grid;
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border-radius: 16px;

  ${({ $variant }) => $variant === "direct" && `
    border: 1px solid #e4e6ec;
    background: #fff;
  `}

  ${({ $variant }) => $variant === "ai" && `
    background: linear-gradient(135deg, #f1eeff, #c9c3ff 71.43%);
  `}

  ${({ $variant }) => $variant === "course" && `
    background: linear-gradient(135deg, #e9faff, #a9e9fb 71.43%);
  `}

  img {
    ${({ $variant }) => $variant !== "direct" && `
      width: 54px;
      height: 54px;
      object-fit: cover;
      transform: translateY(6px);
    `}
  }
`;

export const OptionText = styled.span`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;

  strong {
    font-size: 16px;
    line-height: 22px;
  }

  small {
    color: #5c5c63;
    font-size: 13px;
    line-height: 18px;
  }
`;

export const HomeIndicator = styled.div`
  display: grid;
  height: max(54px, env(safe-area-inset-bottom));
  justify-items: center;
  align-items: end;
  padding-bottom: 13px;

  &::after {
    width: 134px;
    height: 5px;
    border-radius: 3px;
    background: #1a1a1a;
    content: "";
  }
`;
