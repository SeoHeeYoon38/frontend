import styled from "styled-components";

export const Bar = styled.div<{
  $overlay: boolean;
  $tone: "dark" | "light";
}>`
  position: ${({ $overlay }) => ($overlay ? "absolute" : "relative")};
  z-index: 4;
  top: ${({ $overlay }) => ($overlay ? "0" : "auto")};
  right: ${({ $overlay }) => ($overlay ? "0" : "auto")};
  left: ${({ $overlay }) => ($overlay ? "0" : "auto")};
  height: calc(50px + env(safe-area-inset-top));
  padding: calc(env(safe-area-inset-top) + 15px) 16px 9px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  color: ${({ $tone }) => ($tone === "light" ? "#ffffff" : "#12133f")};
  background: transparent;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.25px;
  text-shadow: ${({ $tone }) =>
    $tone === "light" ? "0 1px 4px rgba(0, 0, 0, 0.25)" : "none"};

  img {
    display: block;
    width: 67px;
    height: 12px;
    filter: ${({ $tone }) => ($tone === "dark" ? "invert(1)" : "none")};
  }
`;
