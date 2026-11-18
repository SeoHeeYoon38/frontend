import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { loginWithGoogleCode, validateOAuthState } from "../api/auth";
import { routes } from "../config/routes";
import { shouldCompleteSignup } from "../utils/authFlow";
import { takePendingLoginPath } from "../utils/navigation";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const code = params.get("code");
  const state = params.get("state");
  const cancelled = params.has("error");
  const exchange = useRef<{ code: string | null; state: string | null; request: ReturnType<typeof loginWithGoogleCode> } | null>(null);

  useEffect(() => {
    if (cancelled) {
      navigate(routes.login, { replace: true, state: { loginError: "Google 로그인이 취소되었어요." } });
      return;
    }
    let attempt = exchange.current;
    if (!attempt || attempt.code !== code || attempt.state !== state) {
      // StrictMode에서 effect가 다시 실행돼도 같은 인증 코드 교환을 사용한다.
      const request = Promise.resolve().then(() => {
        if (!code || !validateOAuthState(state)) {
          throw new Error("로그인 정보를 확인하지 못했어요. 다시 시도해 주세요.");
        }
        return loginWithGoogleCode(code);
      });
      attempt = { code, state, request };
      exchange.current = attempt;
    }
    let active = true;
    void attempt.request
      .then((response) => {
        if (active) {
          navigate(
            shouldCompleteSignup(response.signupCompleted)
              ? routes.onboardingTerms
              : takePendingLoginPath(sessionStorage) ?? routes.home,
            { replace: true },
          );
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          navigate(routes.login, {
            replace: true,
            state: {
              loginError: reason instanceof Error ? reason.message : "로그인을 완료하지 못했어요. 다시 시도해 주세요.",
            },
          });
        }
      });
    return () => { active = false; };
  }, [cancelled, code, state, navigate]);

  return null;
}

export default AuthCallbackPage;

