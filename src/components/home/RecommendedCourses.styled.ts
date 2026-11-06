import styled from "styled-components";

export const CARD_WIDTH = 240;
export const CARD_GAP = 12;

export const Carousel = styled.div`
  position: relative;
  display: flex;
  gap: ${CARD_GAP}px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  margin-right: -20px;
  padding-right: 20px;
  &::-webkit-scrollbar {
    display: none;
  }
`;
export const Card = styled.div`
  flex: 0 0 ${CARD_WIDTH}px;
  height: 200px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  scroll-snap-align: start;
  color: white;
  background: black;
  cursor: pointer;
`;
export const Badges = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 4px;
  span {
    background: #ffffff38;
    padding: 5px 10px;
    border-radius: 99px;
    backdrop-filter: blur(7px);
    font-size: 12px;
  }
`;
export const Text = styled.div`
  position: absolute;
  left: 16px;
  right: 12px;
  bottom: 16px;
  h3 {
    margin: 0;
    white-space: pre-line;
    font-size: 20px;
    line-height: 1.35;
  }
  p {
    font-size: 13px;
    line-height: 1.5;
    color: #ffffffcc;
    margin: 6px 0 0;
  }
`;
export const Dots = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  padding-top: 4px;
`;
export const Dot = styled.span<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? "18px" : "6px")};
  height: 6px;
  border-radius: 99px;
  background: ${({ $active }) => ($active ? "linear-gradient(90deg,#c9c3ff,#8274e7)" : "#e1e4ed")};
`;
