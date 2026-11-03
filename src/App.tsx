import { Outlet, ScrollRestoration } from "react-router";
import { GlobalStyle } from "./styles/GlobalStyle";
function App() {
  return (
    <>
      <GlobalStyle />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
export default App;
