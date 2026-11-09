import { createGlobalStyle } from "styled-components";
import NotoSansRegular from "../assets/fonts/NotoSansKR-Regular.woff2";
import NotoSansMedium from "../assets/fonts/NotoSansKR-Medium.woff2";
import NotoSansBold from "../assets/fonts/NotoSansKR-Bold.woff2";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "Noto Sans KR";
    src: url(${NotoSansRegular}) format("woff2");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Noto Sans KR";
    src: url(${NotoSansMedium}) format("woff2");
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Noto Sans KR";
    src: url(${NotoSansBold}) format("woff2");
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Noto Sans KR", Arial, sans-serif;
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
