import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

test("토큰 갱신과 로그아웃이 겹치면 새 refresh 토큰으로 서버 로그아웃을 재시도한다", async () => {
  const server = await createServer({ envDir: false, define: {
    "import.meta.env.VITE_API_MODE": JSON.stringify("live"),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://example.test"),
  }, server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousFetch = globalThis.fetch;
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "https://example.test" },
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    setTimeout, clearTimeout,
  } });
  const sent: string[] = [];
  try {
    const auth = await server.ssrLoadModule("/src/api/auth.ts");
    const tokens = await server.ssrLoadModule("/src/api/tokenStorage.ts");
    tokens.saveAuthTokens({ accessToken: "access-old", refreshToken: "refresh-old" });
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://example.test/api/auth/logout");
      const refreshToken = JSON.parse(String(init?.body)).refreshToken as string;
      sent.push(refreshToken);
      if (refreshToken === "refresh-old") {
        tokens.saveAuthTokens({ accessToken: "access-new", refreshToken: "refresh-new" });
        return new Response(JSON.stringify({ code: "INVALID_TOKEN" }), {
          status: 401, headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(null, { status: 204 });
    };

    await auth.logout();
    assert.deepEqual(sent, ["refresh-old", "refresh-new"]);
    assert.equal(tokens.getAuthTokens(), null);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});

test("진행 중인 토큰 재발급이 끝난 뒤 갱신된 토큰으로 로그아웃한다", async () => {
  const server = await createServer({ envDir: false, define: {
    "import.meta.env.VITE_API_MODE": JSON.stringify("live"),
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://example.test"),
  }, server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousFetch = globalThis.fetch;
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "https://example.test" },
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    setTimeout, clearTimeout,
  } });
  const sent: string[] = [];
  let notifyRefreshStarted!: () => void;
  let releaseRefresh!: () => void;
  const refreshStarted = new Promise<void>((resolve) => { notifyRefreshStarted = resolve; });
  const refreshReleased = new Promise<void>((resolve) => { releaseRefresh = resolve; });
  try {
    const auth = await server.ssrLoadModule("/src/api/auth.ts");
    const tokens = await server.ssrLoadModule("/src/api/tokenStorage.ts");
    tokens.saveAuthTokens({ accessToken: "access-old", refreshToken: "refresh-old" });
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (path.endsWith("/api/users/me")) {
        return new Response(JSON.stringify(init?.headers instanceof Headers &&
          init.headers.get("Authorization") === "Bearer access-old"
          ? { code: "INVALID_TOKEN" } : { id: 7 }), {
          status: init?.headers instanceof Headers &&
            init.headers.get("Authorization") === "Bearer access-old" ? 401 : 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (path.endsWith("/api/auth/refresh")) {
        sent.push(JSON.parse(String(init?.body)).refreshToken);
        notifyRefreshStarted();
        await refreshReleased;
        return new Response(JSON.stringify({ accessToken: "access-new", refreshToken: "refresh-new" }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }
      assert.equal(path, "https://example.test/api/auth/logout");
      sent.push(JSON.parse(String(init?.body)).refreshToken);
      return new Response(null, { status: 204 });
    };

    const meRequest = auth.getMe();
    await refreshStarted;
    const logoutRequest = auth.logout();
    releaseRefresh();
    await Promise.all([meRequest, logoutRequest]);
    assert.deepEqual(sent, ["refresh-old", "refresh-new"]);
    assert.equal(tokens.getAuthTokens(), null);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await server.close();
  }
});
