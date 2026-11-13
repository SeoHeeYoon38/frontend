import { resolveApiMode } from "./mode";

export type { ApiMode } from "./mode";

const configuredMode = import.meta.env.VITE_API_MODE;

export const apiMode = resolveApiMode(configuredMode, import.meta.env.PROD);

export const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://api.dotlo.cloud" : "http://localhost:8080")
).replace(/\/$/, "");

export const googleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  redirectUri:
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    `${window.location.origin}/auth/callback/google`,
};

export function isApiEnabled() {
  return apiMode !== "mock";
}

