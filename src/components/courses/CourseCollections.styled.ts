import styled from "styled-components";
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;
export const Heading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  h2 {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
  }
  button,
  span {
    font-size: 13px;
    font-weight: 500;
    color: #8a8a8e;
    white-space: nowrap;
  }
`;
export const Carousel = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  margin-right: -20px;
  padding-right: 20px;
`;
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
    rgba(10, 10, 31, 0) 45%,
    rgba(10, 10, 31, 0.75)
  );
`;
export const PopularCard = styled.article`
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  width: 220px;
  height: 292px;
  flex: 0 0 220px;
  scroll-snap-align: start;
  color: white;
  cursor: pointer;
`;
export const PopularText = styled.div`
  position: absolute;
  left: 16px;
  right: 12px;
  bottom: 14px;
  h3 {
    margin: 4px 0 6px;
    font-size: 18px;
    line-height: 1.4;
    white-space: pre-line;
  }
  p {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
  }
`;
export const Meta = styled.div`
  display: flex;
  gap: 7px;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  i {
    height: 10px;
    width: 1px;
    background: rgba(255, 255, 255, 0.5);
  }
`;
export const Theme = styled.article`
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  img {
    width: 140px;
    height: 140px;
    object-fit: cover;
    border-radius: 16px;
  }
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
  }
`;
export const ThemeCities = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #8a8a8e;
  white-space: nowrap;
  span + span {
    border-left: 1px solid #d1d1d9;
    padding-left: 7px;
  }
`;
export const TravelerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
export const TravelerRow = styled.article`
  display: flex;
  gap: 14px;
  align-items: center;
  border-radius: 14px;
  color: inherit;
  cursor: pointer;
  text-decoration: none;
`;
export const TravelerText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  h3 {
    font-size: 15px;
    line-height: 1.45;
    white-space: pre-line;
    margin: 0;
  }
`;
export const TravelerMeta = styled(Meta)`
  color: #6b6bcc;
  font-weight: 700;
  i {
    background: #d1d1d9;
  }
`;
export const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
  flex-wrap: wrap;
  img {
    width: 18px;
    height: 18px;
  }
  i {
    height: 9px;
    width: 1px;
    background: #d0d0d8;
  }
  small {
    font-size: 12px;
    color: #8a8a8e;
  }
`;
export const Thumbnail = styled.img`
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 14px;
  flex-shrink: 0;
`;
