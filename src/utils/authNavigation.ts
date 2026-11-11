import { routes } from "../config/routes.ts";

const publicRoutePatterns = [
  /^\/login\/?$/,
  /^\/auth\/callback\/google\/?$/,
  /^\/invite\/[^/]+\/?$/,
  /^\/my\/account\/policies\/[^/]+\/?$/,
];

const onboardingRoutePattern = /^\/onboarding\/(profile|preferences|complete)\/?$/;

export function isPublicRoute(pathname: string, allowOnboarding = false) {
  return (
    publicRoutePatterns.some((pattern) => pattern.test(pathname)) ||
    (allowOnboarding && onboardingRoutePattern.test(pathname))
  );
}

export function authRedirectPath(pathname: string, allowOnboarding = false) {
  if (isPublicRoute(pathname, allowOnboarding)) return null;
  return routes.login;
}

export function allowDemoAuthentication(isDevelopment: boolean, apiMode: string) {
  return isDevelopment || apiMode === "mock";
}
