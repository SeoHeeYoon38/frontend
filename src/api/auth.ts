import { ApiError, apiRequest, queryString, waitForPendingTokenRefresh } from "./client";
import { googleOAuthConfig } from "./config";
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
  type AuthTokens,
} from "./tokenStorage";
import type { MyStatsResponse } from "./types";

export interface LoginResponse extends AuthTokens {
  newUser: boolean;
  signupCompleted: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  nickname: string | null;
  bio: string | null;
  characterId: number | null;
  signupCompleted: boolean;
  createdAt: string;
}

export interface SignupInput {
  agreements: {
    terms: boolean;
    privacy: boolean;
    age14: boolean;
    location: boolean;
  };
  nickname: string;
  characterId: number;
}

export interface ProfileUpdateInput {
  nickname: string;
  bio: string | null;
  characterId: number;
}

export interface NicknameCheckResponse {
  available: boolean;
}

export const SIGNUP_COMPLETED_EVENT = "dotlo:signup-completed";
const RECENT_LOGIN_KEY = "dotlo:recent-login";

export function hasRecentGoogleLogin() {
  try {
    return localStorage.getItem(RECENT_LOGIN_KEY) === "google";
  } catch {
    return false;
  }
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
  try {
    localStorage.setItem(RECENT_LOGIN_KEY, "google");
  } catch {
    // 로그인 세션은 브라우저 저장소에 접근할 수 없어도 유지돼요.
  }
  return response;
}

export async function logout() {
  try {
    // 다른 요청의 401 갱신이 끝나야 서버에 현재 유효한 refresh 토큰을 보낼 수 있습니다.
    await waitForPendingTokenRefresh().catch(() => undefined);
    const tokens = getAuthTokens();
    if (!tokens) return;
    const revoke = (refreshToken: string) => apiRequest<void>("/api/auth/logout", {
      method: "POST",
      auth: false,
      json: { refreshToken },
    });
    try {
      await revoke(tokens.refreshToken);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401 && reason.code === "INVALID_TOKEN") {
        await waitForPendingTokenRefresh().catch(() => undefined);
        const newer = getAuthTokens();
        if (newer && newer.refreshToken !== tokens.refreshToken) {
          await revoke(newer.refreshToken);
          return;
        }
      }
      throw reason;
    }
  } finally {
    clearAuthTokens();
  }
}

export function getMe(signal?: AbortSignal) {
  return apiRequest<UserResponse>("/api/users/me", { signal });
}

export function getMyStats(signal?: AbortSignal) {
  return apiRequest<MyStatsResponse>("/api/users/me/stats", { signal });
}

interface WithdrawalTrip {
  tripId: number;
  city: string;
  startDate: string;
  endDate: string;
  newOwnerName: string | null;
}

export interface WithdrawalPreview {
  deletedTrips: WithdrawalTrip[];
  transferredTrips: WithdrawalTrip[];
  leftTrips: WithdrawalTrip[];
}

export function getWithdrawalPreview(signal?: AbortSignal) {
  return apiRequest<WithdrawalPreview>("/api/users/me/withdrawal", { signal });
}

export function withdrawAccount() {
  return apiRequest<void>("/api/users/me", { method: "DELETE", retryAuth: false });
}

export async function completeSignup(input: SignupInput, signal?: AbortSignal) {
  await apiRequest<void>("/api/users/me/signup", {
    method: "POST",
    json: input,
    signal,
  });
  window.dispatchEvent(new Event(SIGNUP_COMPLETED_EVENT));
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

