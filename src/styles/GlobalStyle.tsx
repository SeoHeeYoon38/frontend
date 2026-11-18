import { createGlobalStyle } from "styled-components";
import PretendardVariable from "../assets/fonts/PretendardVariable.woff2";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "Pretendard";
    src: url(${PretendardVariable}) format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: #1a1a1a;
  background: #ffffff;
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;
  font-synthesis: none;
}

html,
body {
  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

button,
input,
textarea,
select {
  font: inherit;
}

.auth-gate {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: #ffffff;
  text-align: center;
}

.auth-gate img {
  width: min(200px, 55vw);
  height: auto;
}

.auth-gate--error p {
  margin: 0;
  color: #5c5c63;
  font-size: 15px;
}

.auth-gate--error button {
  min-width: 180px;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  background: #090738;
  color: #ffffff;
  font-weight: 700;
}

`;
