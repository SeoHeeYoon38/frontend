import styled from "styled-components";
export const Nav = styled.nav`
  position: fixed;
  z-index: 5;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(100%, 402px);
  display: flex;
  background: white;
  border-top: 1px solid #ececef;
  padding: 7px 0 max(14px, env(safe-area-inset-bottom));
  > * {
    display: flex;
    flex: 1;
    align-items: center;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    line-height: 20px;
    color: #8a8a8e;
  }
  > [aria-current="page"] {
    color: #1a1a1a;
    font-weight: 700;
  }
  img {
    width: 30px;
    height: 30px;
    opacity: 0.58;
  }
  > [aria-current="page"] img {
    opacity: 1;
    filter: brightness(0);
  }
`;
