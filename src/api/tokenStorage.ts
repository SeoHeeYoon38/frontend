export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = "dotlo:auth:access-token";
const REFRESH_TOKEN_KEY = "dotlo:auth:refresh-token";

let memoryTokens: AuthTokens | null = null;

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getAuthTokens(): AuthTokens | null {
  const accessToken = readStorage(ACCESS_TOKEN_KEY) ?? memoryTokens?.accessToken;
  const refreshToken = readStorage(REFRESH_TOKEN_KEY) ?? memoryTokens?.refreshToken;
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function getAccessToken() {
  return getAuthTokens()?.accessToken ?? null;
}

export function saveAuthTokens(tokens: AuthTokens) {
  memoryTokens = tokens;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
    // 저장소를 막은 브라우저에서도 현재 탭에서는 로그인을 유지합니다.
  }
}

export function clearAuthTokens() {
  memoryTokens = null;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // 이미 메모리 토큰은 제거했으므로 별도 처리가 필요하지 않습니다.
  }
}

export function hasAuthSession() {
  return Boolean(getAuthTokens());
}

