import { Navigate, Outlet, ScrollRestoration, useLocation } from "react-router";
import { apiMode } from "./api/config";
import { hasAuthSession } from "./api/tokenStorage";
import { routes } from "./config/routes";
import { GlobalStyle } from "./styles/GlobalStyle";
import { allowDemoAuthentication, authRedirectPath } from "./utils/authNavigation";

function App() {
  const location = useLocation();
  const hasSession = hasAuthSession();
  const demoAuthentication = allowDemoAuthentication(import.meta.env.DEV, apiMode);
  const loginRedirect = authRedirectPath(location.pathname, demoAuthentication);

  if (!hasSession && loginRedirect) {
    return <Navigate to={loginRedirect} replace />;
  }

  if (hasSession && location.pathname === routes.login) {
    return <Navigate to={routes.home} replace />;
  }

  return (
    <>
      <GlobalStyle />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
export default App;
