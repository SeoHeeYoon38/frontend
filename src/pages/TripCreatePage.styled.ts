import styled from "styled-components";

export const LoadWarning = styled.p`
  margin: 0 20px 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff4d6;
  color: #6f5200;
  font-size: 13px;
  line-height: 1.5;
`;

export const Generation = styled.div`
  > * {
    flex-shrink: 0;
  }
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: clip;
  scrollbar-width: none;
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 70px 0 48px;
  @media (max-height: 600px) {
    padding-top: 24px;
  }
`;

export const GenerationCopy = styled.div`
  margin-top: 32px;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: keep-all;

  h1 {
    font-size: 22px;
    line-height: 30px;
    letter-spacing: -0.11px;
    margin: 0;
  }
`;
export const GenerationIllustration = styled.img`
  flex-shrink: 0;
  width: 160px;
  height: 160px;
  object-fit: contain;
`;
export const GenerationSteps = styled.ol`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  padding: 0;
  margin: 32px 0 0;
  width: 263px;
  text-align: left;

  li {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 46px;
    gap: 18px;
    color: #090738;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
  }

  li[data-status="current"] {
    font-weight: 700;
  }

  li[data-status="waiting"] {
    color: #b4b5bd;
    font-weight: 400;
  }

  li:not(:last-child)::after {
    content: "";
    position: absolute;
    z-index: -1;
    left: 10px;
    top: 27px;
    width: 2px;
    height: 38px;
    background: #00e1ff;
  }

  li[data-status="current"]::after,
  li[data-status="waiting"]::after {
    left: 9px;
    width: 0;
    border-left: 2px dashed #c9ccd6;
    background: transparent;
  }

  li > span {
    position: relative;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
  }

  li > span > img:not(.halo) {
    position: relative;
    z-index: 1;
  }

  .halo {
    position: absolute;
    inset: -1px;
  }
`;

export const GenerationGlow = styled.img`
  position: absolute;
  z-index: -1;
  pointer-events: none;
  left: calc(50% - 130px);
  top: 50px;
  width: 260px;
  height: 260px;
`;
