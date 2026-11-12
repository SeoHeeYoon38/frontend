import styled from "styled-components";

export const Page = styled.div`
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  color: #1a1a1a;
  background: #ffffff;
  font-family: "Noto Sans KR", Arial, sans-serif;

  button,
  input {
    font: inherit;
  }

  button {
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
  }
`;

export const Header = styled.header`
  height: 54px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;

  button {
    width: 22px;
    height: 40px;
    display: grid;
    place-items: center;
  }

  img {
    width: 10px;
    height: 18px;
  }

  h1 {
    margin: 0;
    font-size: 17px;
    line-height: 24px;
    font-weight: 700;
  }
`;

export const Body = styled.main`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 20px 140px;
`;

export const AvatarButton = styled.button`
  position: relative;
  align-self: center;
  width: 96px;
  height: 112px;
  display: grid;
  place-items: center;
  padding-bottom: 16px !important;

  > img {
    width: 77px;
    height: 77px;
    padding: 7px;
    border-radius: 50%;
    object-fit: contain;
    background: #ddf9fd;
  }

  span {
    position: absolute;
    right: -2px;
    bottom: 14px;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: #090738;
  }

  span img {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }
`;

export const Field = styled.div<{ $tone?: "default" | "success" | "error" }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 8px;

  label {
    font-size: 13px;
    line-height: 18px;
    font-weight: 700;
  }

  small {
    color: ${({ $tone }) =>
      $tone === "error" ? "#e5484d" : $tone === "success" ? "#0079c2" : "#8a8a8e"};
    font-size: 12px;
    line-height: 17px;
  }
`;

export const ErrorNotice = styled.p`
  margin: 0;
  color: #e5484d;
  font-size: 13px;
  line-height: 19px;
  text-align: center;
`;

export const InputWrap = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 16px;
  border: 1px solid #e4e6ec;
  border-radius: 12px;
  background: #ffffff;

  &:focus-within {
    border: 1.5px solid #090738;
  }

  input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: none;
    color: #1a1a1a;
    background: transparent;
    font-size: 15px;
  }

  span {
    color: #8a8a8e;
    font-size: 12px;
    line-height: 17px;
  }
`;

export const DisabledInput = styled(InputWrap)`
  background: #f3f5fa;
  border-color: transparent;

  &:focus-within {
    border-color: transparent;
  }

  input {
    color: #8a8a8e;
  }

  > span {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 8px;
    color: #1a1a1a;
    background: #ffffff;
    font-size: 11px;
    font-weight: 700;
  }

  i {
    width: 12px;
    height: 12px;
    border: 3px solid #fee500;
    border-radius: 50%;
    background: #1a1a1a;
  }
`;

export const Cta = styled.footer`
  position: fixed;
  z-index: 3;
  right: 0;
  bottom: 0;
  left: 0;
  width: min(100%, 402px);
  margin: 0 auto;
  padding: 12px 20px 0;
  background: #ffffff;

  > button {
    width: 100%;
    min-height: 56px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: #ffffff;
    background: #090738;
    font-size: 16px;
    line-height: 22px;
    font-weight: 700;
  }

  > button:disabled {
    background: #e4e6ec;
    cursor: default;
  }
`;

export const HomeIndicator = styled.div`
  width: 134px;
  height: 5px;
  margin: 21px auto 8px;
  border-radius: 3px;
  background: #000000;
`;

export const Overlay = styled.div`
  position: fixed;
  z-index: 10;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
`;

export const Dialog = styled.div`
  width: min(calc(100% - 80px), 322px);
  padding: 28px 24px 20px;
  border-radius: 24px;
  background: #ffffff;
  text-align: center;

  > strong {
    font-size: 17px;
    line-height: 24px;
  }

  > p {
    margin: 8px 0 24px;
    color: #5c5c63;
    font-size: 14px;
    line-height: 20px;
  }

  > div {
    display: flex;
    gap: 8px;
  }

  button {
    min-height: 52px;
    flex: 1;
    border-radius: 14px;
    background: #f3f5fa;
    text-align: center;
    font-size: 15px;
    font-weight: 700;
  }

  button[data-danger] {
    color: #ffffff;
    background: #e5484d;
  }
`;

export const PhotoSheet = styled.div`
  align-self: flex-end;
  width: min(100%, 402px);
  display: flex;
  flex-direction: column;
  padding: 24px 20px max(20px, env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #ffffff;

  strong {
    margin-bottom: 12px;
    font-size: 18px;
    line-height: 25px;
  }

  button {
    min-height: 52px;
    border-bottom: 1px solid #f0f1f5;
    font-size: 15px;
    text-align: left;
  }

  button:last-child {
    margin-top: 10px;
    border: 0;
    border-radius: 14px;
    background: #f3f5fa;
    text-align: center;
    font-weight: 700;
  }
`;
