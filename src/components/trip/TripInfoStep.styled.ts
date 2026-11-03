import styled from "styled-components";
import { Step, Title } from "./Trip.styled";
export const InfoStep = styled(Step)<{ $complete: boolean }>`
  gap: ${({ $complete }) => ($complete ? "6px" : "16px")};
  padding-bottom: 7px;
`;
export const Sentence = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
export const SentenceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 20px;
  font-weight: 700;
`;
export const FieldButton = styled.button<{ $filled: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  padding: 12px 14px;
  background: ${({ $filled }) => ($filled ? "#efefff" : "#f4f4f7")};
  color: ${({ $filled }) => ($filled ? "#090738" : "#a8a8ae")};
  font-size: 16px;
  line-height: 20px;
  font-weight: 700;
  max-width: 100%;
`;
export const Optional = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  h2 {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 15px;
    margin: 0 0 0;
  }
  h2 span {
    font-size: 11px;
    background: #efefff;
    color: #6b6bcc;
    padding: 3px 8px;
    flex-shrink: 0;
    white-space: nowrap;
    border-radius: 99px;
  }
`;
export const OptionalRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f6f6f9;
  border-radius: 16px;
  width: 100%;
  text-align: left;
  > span:first-child {
    display: grid;
    place-items: center;
    background: white;
    padding: 9px;
    border-radius: 20px;
  }
  div {
    flex: 1;
    min-width: 0;
  }
  strong {
    display: block;
    font-size: 15px;
    line-height: 22px;
  }
  small {
    display: block;
    font-size: 11px;
    color: #8a8a8e;
    margin-top: 2px;
    line-height: 16px;
  }
`;

export const IntroTitle = styled(Title)<{ $complete: boolean }>`
  margin-top: ${({ $complete }) => ($complete ? "9px" : "0")};
  font-size: ${({ $complete }) => ($complete ? "26px" : "24px")};
`;
export const CompletedSentence = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: clamp(21px, 6.47vw, 26px);
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: -0.7px;
  > div {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    min-width: 0;
  }
`;
export const Highlight = styled.button<{ $tone: "city" | "dates" | "people" }>`
  font: inherit;
  font-weight: 700;
  color: #090738;
  text-align: left;
  padding: 0;
  max-width: 100%;
  border-radius: 3px;
  background: linear-gradient(
    transparent calc(100% - 15px),
    ${({ $tone }) => ($tone === "city" ? "#00e1ff59" : $tone === "dates" ? "#a5a5ff59" : "#ffe40080")}
      calc(100% - 15px),
    ${({ $tone }) => ($tone === "city" ? "#00e1ff59" : $tone === "dates" ? "#a5a5ff59" : "#ffe40080")}
      calc(100% - 4px),
    transparent calc(100% - 4px)
  );
`;
