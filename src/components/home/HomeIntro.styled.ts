import styled from "styled-components";

type Variant = { $variant: "ai" | "course" };

export const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;
export const Action = styled.button<Variant>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 186px;
  padding: 16px;
  border-radius: 18px;
  overflow: hidden;
  background: ${({ $variant }) => ($variant === "ai" ? "linear-gradient(133deg,#f1eeff 0%,#c9c3ff 71.43%)" : "linear-gradient(133deg,#e9faff 0%,#a9e9fb 71.43%)")};
  box-shadow: 0 6px 16px
    ${({ $variant }) => ($variant === "ai" ? "#7a6fe02e" : "#2bb3e02e")};
  strong {
    font-size: 16px;
    line-height: 1.3;
    position: relative;
    z-index: 1;
  }
  span {
    font-size: 11px;
    line-height: 1.4;
    color: #555;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 360px) {
    padding: 12px;
  }
`;
export const Glow = styled.img<Variant>`
  position: absolute;
  width: 96px;
  height: 96px;
  bottom: ${({ $variant }) => ($variant === "ai" ? "-7px" : "-22.5px")};
  right: ${({ $variant }) => ($variant === "ai" ? "8px" : "-18.5px")};
`;
export const Character = styled.img<Variant>`
  position: absolute;
  object-fit: cover;
  width: ${({ $variant }) => ($variant === "ai" ? "112px" : "107px")};
  height: ${({ $variant }) => ($variant === "ai" ? "112px" : "107px")};
  right: ${({ $variant }) => ($variant === "ai" ? "0" : "-24px")};
  bottom: ${({ $variant }) => ($variant === "ai" ? "-23px" : "-28px")};
  transform: ${({ $variant }) => ($variant === "course" ? "scaleX(-1)" : "none")};
`;
export const Card = styled.div`
  position: relative;
  display: block;
  height: 220px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 24px -4px #0d0a332e;
  color: white;
`;
export const Badge = styled.span`
  position: absolute;
  left: 16px;
  top: 16px;
  padding: 5px 10px;
  border-radius: 99px;
  background: #0a0a1f66;
  backdrop-filter: blur(6px);
  font-size: 12px;
  b {
    margin-left: 6px;
  }
`;
export const Avatars = styled.div`
  position: absolute;
  right: 16px;
  top: 18px;
  display: flex;
  img {
    width: 20px;
    height: 20px;
    border: 1.5px solid white;
    border-radius: 50%;
    background: #efefff;
    margin-left: -5px;
    object-fit: cover;
  }
`;
export const Title = styled.div`
  position: absolute;
  bottom: 15px;
  left: 18px;
  right: 62px;
  h2 {
    margin: 0;
    font-size: 26px;
    letter-spacing: -0.26px;
  }
  p {
    font-size: 12px;
    color: #ffffffd1;
    margin: 4px 0 0;
  }
`;
export const Arrow = styled.img`
  position: absolute;
  width: 36px;
  height: 36px;
  right: 16px;
  bottom: 16px;
`;
export const Greeting = styled.h1`
  margin: 0;
  font-size: 22px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: -0.7px;
  @media (max-width: 360px) {
    font-size: 20px;
  }
`;

export const Create = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export const ManualAction = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f5f6f8;
  text-align: left;
  overflow: hidden;
  > img {
    flex-shrink: 0;
  }
  &[aria-disabled="true"] {
    cursor: default;
  }
`;
export const ManualIcon = styled.span`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
`;
export const ManualText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  strong {
    font-size: 14px;
    line-height: 19px;
  }
  > span {
    font-size: 12px;
    line-height: 16px;
    color: #8a8a8e;
  }
`;
