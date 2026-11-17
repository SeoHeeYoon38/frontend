import { createGlobalStyle } from "styled-components";
import PretendardVariable from "../assets/fonts/PretendardVariable.woff2";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "Pretendard";
    src: url(${PretendardVariable}) format("woff2-variations");
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

`;
