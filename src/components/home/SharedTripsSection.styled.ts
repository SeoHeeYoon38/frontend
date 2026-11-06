import styled from "styled-components";

export const Card = styled.div`
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  align-items: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0000000d;
  cursor: pointer;
  @media (max-width: 360px) {
    gap: 8px;
    padding: 10px;
  }
`;
export const Info = styled.div`
  flex: 1;
  min-width: 0;
  b {
    color: #2e2e70;
    font-size: 14px;
  }
  h3 {
    font-size: 18px;
    margin: 6px 0 0;
  }
  p {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #8a8a8e;
    margin: 8px 0 0;
    flex-wrap: wrap;
  }
  p > img {
    width: 16px;
    height: 16px;
  }
`;
export const Avatar = styled.img`
  && {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #efefff;
    object-fit: cover;
  }
`;
export const Photo = styled.img`
  width: 96px;
  height: 96px;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 14px;
  @media (max-width: 360px) {
    width: 80px;
    height: 80px;
  }
`;
