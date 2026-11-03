import styled from "styled-components";
export const Cover = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const Scrim = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    #0a0a1f57 0%,
    #0a0a1f0a 28%,
    #0a0a1f1f 42%,
    #0a0a1f94 75%,
    #0a0a1fbd 100%
  );
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-margin-top: 24px;
`;
export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
  button {
    display: flex;
    align-items: center;
    color: #8a8a8e;
    font-size: 12px;
    min-height: 28px;
  }
  img {
    width: 16px;
    height: 16px;
  }
`;
