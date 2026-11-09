import styled from "styled-components";
import { Link } from "react-router";

export const Page = styled.div`
  min-height: 650px;
  background: #ffffff;
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 20px 8px;

  input {
    min-width: 0;
    flex: 1;
    height: 42px;
    padding: 0 14px;
    border: 1px solid #dfe1e8;
    border-radius: 12px;
    color: #1a1a1a;
    background: #f7f7fa;
    outline: none;
  }

  input:focus {
    border-color: #090738;
  }

  button {
    flex: 0 0 auto;
    color: #5c5c63 !important;
    font-size: 14px !important;
  }
`;

export const Tabs = styled.div`
  display: flex;
  gap: 24px;
  min-height: 49px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e6ec;

  button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #8a8a8e !important;
    font-size: 16px !important;
    line-height: 24px !important;
    font-weight: 500 !important;
  }

  button::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background: transparent;
  }

  button[aria-pressed="true"] {
    color: #1a1a1a !important;
    font-weight: 700 !important;
  }

  button[aria-pressed="true"]::after {
    background: #090738;
  }

  b {
    color: #0079c2;
    font-weight: 700;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 8px;
  padding: 20px 20px 28px;
`;

export const TripCard = styled(Link)`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding-left: 2px;

  > img {
    width: calc(100% + 2px);
    height: 132px;
    margin-left: -2px;
    margin-bottom: 6px;
    border-radius: 12px;
    object-fit: cover;
  }

  strong {
    max-width: 100%;
    overflow: hidden;
    color: #1a1a1a;
    font-size: 15px;
    line-height: 22px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > span {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #5c5c63;
    font-size: 12px;
    line-height: 17px;
  }

  > span img {
    width: 14px;
    height: 14px;
  }

  small {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
  }

  small b {
    color: #0079c2;
    font-weight: 700;
  }
`;

export const Empty = styled.p`
  margin: 72px 20px;
  color: #8a8a8e;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
`;
