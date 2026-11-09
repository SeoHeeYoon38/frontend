import styled from "styled-components";

export const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 120px;
  background: #f4f4f7;
  button {
    flex: 1;
    height: 40px;
    text-align: center;
    border-radius: 35px;
    font-size: 14px;
    color: #8a8a8e;
  }
  button[aria-pressed="true"] {
    background: white;
    color: #1a1a1a;
    font-weight: 700;
    box-shadow: 0 1px 2px #00000014;
  }
`;
export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
`;

export const Empty = styled.div`
  display: flex;
  min-height: 129px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 7px 0;
  text-align: center;

  p {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
  }

  p + p {
    margin-top: 11px;
    color: #5c5c63;
    font-size: 13px;
    line-height: 18px;
  }
`;

export const CreateButton = styled.button`
  display: flex;
  width: 138px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #dedede;
  border-radius: 35px;
  background: #fff;
  box-shadow: 0 1px 2px #00000014;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
`;
export const TripRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  border-radius: 12px;
  cursor: pointer;
  h3 {
    margin: 5px 0 0;
    font-size: 15px;
  }
  p {
    display: flex;
    gap: 5px;
    font-size: 12px;
    color: #8a8a8e;
    margin: 5px 0 0;
    align-items: center;
  }
  p img {
    width: 14px;
    height: 14px;
  }
`;
export const Photo = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
`;
export const Meta = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  span {
    background: #eef0ff;
    color: #6b6bcc;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 6px;
  }
  b {
    font-size: 12px;
    color: #2e2e70;
  }
`;
