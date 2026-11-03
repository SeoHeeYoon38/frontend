import styled from "styled-components";
export const Sheet = styled.dialog<{ $trip: boolean }>`
  position: fixed;
  left: 50%;
  bottom: 0;
  top: auto;
  transform: translateX(-50%);
  margin: 0;
  width: min(100%, 402px);
  max-width: 402px;
  max-height: calc(100dvh - 24px);
  height: ${({ $trip }) => ($trip ? "810px" : "818px")};
  border: 0;
  border-radius: 24px 24px 0 0;
  padding: 44px 20px 0;
  background: white;
  color: #1a1a1a;
  font-family: "Noto Sans KR", Arial, sans-serif;
  overflow-y: auto;
  scrollbar-width: none;
  &[open] {
    display: flex;
    flex-direction: column;
  }
  > * {
    flex-shrink: 0;
  }
  &::backdrop {
    background: rgba(10, 10, 26, 0.45);
  }
  :where(button) {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }
  :focus-visible {
    outline: 3px solid #7a6fe0;
    outline-offset: 3px;
  }
`;
export const Grabber = styled.div`
  position: absolute;
  left: 50%;
  top: 8px;
  transform: translateX(-50%);
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: #d9d9de;
`;
export const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  h2 {
    font-size: 24px;
    line-height: 34px;
    margin: 0;
    font-weight: 700;
  }
  button {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
  }
`;
export const Description = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #8a8a8e;
  margin: 2px 0 20px;
`;
export const Search = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 50px;
  background: #f4f4f7;
  border-radius: 14px;
  img {
    flex-shrink: 0;
  }
  input {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    background: none;
    font-size: 14px;
    color: #1a1a1a;
  }
  input::placeholder {
    color: #a8a8ae;
  }
  &:focus-within {
    outline: 2px solid #7a6fe0;
  }
`;
export const Section = styled.section`
  margin-top: 24px;
  & + & { margin-top: 16px; }
  h3 {
    font-size: 16px;
    line-height: 22px;
    font-weight: 700;
    margin: 0 0 12px;
  }
`;
export const Recent = styled.div`
  display: flex;
  gap: 8px;
  button {
    border: 1px solid #e2e2e8;
    border-radius: 999px;
    padding: 8px 14px;
    font-size: 13px;
    line-height: 16px;
    color: #555;
  }
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;
export const Destination = styled.button<{ $selected: boolean }>`
  position: relative;
  height: 124px;
  overflow: hidden;
  border-radius: 18px;
  outline: ${({ $selected }) => ($selected ? "3px solid #090738" : "none")};
  outline-offset: -3px;
`;
export const Photo = styled.img`
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
    rgba(10, 10, 31, 0.34),
    rgba(10, 10, 31, 0.04) 28%,
    rgba(10, 10, 31, 0.12) 42%,
    rgba(10, 10, 31, 0.58) 75%,
    rgba(10, 10, 31, 0.74)
  );
`;
export const CityName = styled.div`
  position: absolute;
  left: 14px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  strong {
    font-size: 18px;
    color: white;
  }
  span {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
`;
export const Check = styled.img`
  position: absolute;
  right: 8px;
  top: 8px;
`;
export const Footer = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  padding: 26px 0 36px;
  margin-top: auto;
  button {
    width: 100%;
    height: 56px;
    border-radius: 16px;
    background: #090738;
    color: white;
    text-align: center;
    font-weight: 700;
    font-size: 16px;
  }
`;
