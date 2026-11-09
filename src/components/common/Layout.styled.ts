import styled from "styled-components";

export const Shell = styled.div<{ $courses: boolean; $trip?: boolean }>`
  width: 100%;
  max-width: 402px;
  display: flex;
  flex-direction: column;
  overflow-x: clip;
  min-height: 100dvh;
  height: ${({ $trip }) => ($trip ? "100dvh" : "auto")};
  margin: auto;
  background: ${({ $courses }) => ($courses ? "#ffffff" : "#fcfdff")};
  color: #1a1a1a;
  font-family: "Noto Sans KR", Arial, sans-serif;
  font-weight: 500;
  padding-bottom: ${({ $courses }) => ($courses ? "0" : "110px")};
  :where(&) :where(a) {
    color: inherit;
    text-decoration: none;
  }
  :where(&) :where(button) {
    font: inherit;
    border: 0;
    cursor: pointer;
    text-align: left;
    color: inherit;
    background: none;
    padding: 0;
  }
  :focus-visible {
    outline: 3px solid #7a6fe0;
    outline-offset: 4px;
  }
`;
export const Content = styled.main<{
  $courses: boolean;
  $trip?: boolean;
  $myTrips?: boolean;
  $my?: boolean;
}>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: ${({ $trip }) => ($trip ? "hidden" : "visible")};
  gap: ${({ $courses, $trip, $myTrips, $my }) =>
    $trip || $myTrips || $my ? "0" : $courses ? "36px" : "28px"};
  padding: ${({ $trip, $courses, $myTrips, $my }) =>
    $trip
      ? "24px 20px 0"
      : $myTrips || $my
        ? "0"
        : $courses
          ? "12px 20px 24px"
          : "16px 20px 24px"};
`;
