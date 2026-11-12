import { apiRequest, queryString } from "./client";
import { googleOAuthConfig } from "./config";
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
  type AuthTokens,
} from "./tokenStorage";

export interface LoginResponse extends AuthTokens {
  newUser: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  nickname: string | null;
  bio: string | null;
  characterId: number | null;
  createdAt: string;
}

export interface ProfileUpdateInput {
  nickname: string;
  bio: string | null;
  characterId: number;
}

export interface NicknameCheckResponse {
  available: boolean;
}

export function canStartGoogleLogin() {
  return Boolean(googleOAuthConfig.clientId && googleOAuthConfig.redirectUri);
}

export function googleAuthorizationUrl() {
  if (!canStartGoogleLogin()) {
    throw new Error("Google 로그인 환경 변수가 설정되지 않았어요.");
  }
  const state = crypto.randomUUID();
  sessionStorage.setItem("dotlo:oauth:state", state);
  const query = new URLSearchParams({
    client_id: googleOAuthConfig.clientId,
    redirect_uri: googleOAuthConfig.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

export function validateOAuthState(state: string | null) {
  const saved = sessionStorage.getItem("dotlo:oauth:state");
  sessionStorage.removeItem("dotlo:oauth:state");
  return Boolean(state && saved && state === saved);
}

export async function loginWithGoogleCode(code: string) {
  const response = await apiRequest<LoginResponse>("/api/auth/google", {
    method: "POST",
    auth: false,
    json: { code },
  });
  saveAuthTokens(response);
  return response;
}

export async function logout() {
  const tokens = getAuthTokens();
  try {
    if (tokens) {
      await apiRequest<void>("/api/auth/logout", {
        method: "POST",
        auth: false,
        json: { refreshToken: tokens.refreshToken },
      });
    }
  } finally {
    clearAuthTokens();
  }
}

export function getMe(signal?: AbortSignal) {
  return apiRequest<UserResponse>("/api/users/me", { signal });
}

export function checkNickname(nickname: string, signal?: AbortSignal) {
  return apiRequest<NicknameCheckResponse>(
    `/api/users/nickname/check${queryString({ nickname })}`,
    { signal },
  );
}

export function updateMyProfile(
  input: ProfileUpdateInput,
  signal?: AbortSignal,
) {
  return apiRequest<UserResponse>("/api/users/me", {
    method: "PATCH",
    json: input,
    signal,
  });
}

