import { apiBaseUrl, isApiEnabled } from "./config";
import {
  clearAuthTokens,
  getAccessToken,
  getAuthTokens,
  saveAuthTokens,
  type AuthTokens,
} from "./tokenStorage";

interface ApiErrorBody {
  status?: number;
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class ApiDisabledError extends Error {
  constructor() {
    super("현재는 목업 모드입니다.");
    this.name = "ApiDisabledError";
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: BodyInit | null;
  json?: unknown;
  retryAuth?: boolean;
  timeoutMs?: number;
}

let refreshRequest: Promise<AuthTokens> | null = null;

async function readResponse(response: Response) {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || undefined;
}

function apiError(response: Response, body: unknown) {
  const error = body && typeof body === "object" ? (body as ApiErrorBody) : {};
  return new ApiError(
    response.status,
    error.code ?? "API_ERROR",
    error.message ?? `요청을 처리하지 못했어요. (${response.status})`,
  );
}

async function refreshTokens(): Promise<AuthTokens> {
  if (refreshRequest) return refreshRequest;
  const current = getAuthTokens();
  if (!current) throw new ApiError(401, "LOGIN_REQUIRED", "로그인이 필요합니다.");

  refreshRequest = (async () => {
    const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });
    const body = await readResponse(response);
    if (!response.ok) {
      clearAuthTokens();
      throw apiError(response, body);
    }
    const tokens = body as AuthTokens;
    saveAuthTokens(tokens);
    return tokens;
  })().finally(() => {
    refreshRequest = null;
  });

  return refreshRequest;
}

export async function apiRequest<T>(
  path: string,
  {
    auth = true,
    headers,
    json,
    retryAuth = true,
    signal,
    timeoutMs = 30_000,
    ...init
  }: ApiRequestOptions = {},
): Promise<T> {
  if (!isApiEnabled()) throw new ApiDisabledError();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  const accessToken = getAccessToken();
  if (auth && accessToken) requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  if (json !== undefined) requestHeaders.set("Content-Type", "application/json");

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      body: json === undefined ? init.body : JSON.stringify(json),
      headers: requestHeaders,
      signal: controller.signal,
    });
    const body = await readResponse(response);

    if (response.status === 401 && auth && retryAuth && getAuthTokens()) {
      await refreshTokens();
      return apiRequest<T>(path, {
        ...init,
        auth,
        headers,
        json,
        retryAuth: false,
        signal,
        timeoutMs,
      });
    }
    if (!response.ok) throw apiError(response, body);
    return body as T;
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError" && !signal?.aborted) {
      throw new ApiError(408, "REQUEST_TIMEOUT", "서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.");
    }
    throw reason;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

