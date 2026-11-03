import styled from "styled-components";
export const Filters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
`;
export const Region = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  p {
    margin: 0;
    color: #8a8a8e;
    font-size: 13px;
    font-weight: 500;
  }
  button {
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    font-size: 28px;
    font-weight: 700;
  }
`;
export const Cities = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 2px 0;
`;
export const City = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
  span {
    font-size: 12px;
    font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
    color: ${({ $selected }) => ($selected ? "#1a1a1a" : "#8a8a8e")};
  }
`;
export const CityPhoto = styled.img<{ $selected: boolean }>`
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 50%;
  border: 0;
  outline: ${({ $selected }) => ($selected ? "2.5px solid #090738" : "none")};
  outline-offset: -2.5px;
`;
export const SearchCircle = styled.div<{ $selected: boolean }>`
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f4f5fa;
  border: 2.5px solid
    ${({ $selected }) => ($selected ? "#090738" : "transparent")};
`;
export const Interests = styled.div`
  display: flex;
  gap: 22px;
  border-bottom: 1px solid #eeeef2;
  button {
    font-size: 15px;
    color: #9a9aa6;
    font-weight: 500;
    padding: 10px 0;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  button[aria-pressed="true"] {
    font-weight: 700;
    color: #1a1a1a;
    border-bottom-color: #1a1a1a;
  }
`;
