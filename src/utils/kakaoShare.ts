export interface KakaoShare {
  sendDefault(template: {
    objectType: "text";
    text: string;
    link: { webUrl: string; mobileWebUrl: string };
    buttonTitle: string;
  }): void | Promise<unknown>;
}

declare global {
  interface Window {
    Kakao?: {
      init(key: string): void;
      isInitialized(): boolean;
      Share: KakaoShare;
    };
  }
}

let pendingShare: Promise<KakaoShare> | undefined;

export function prepareKakaoShare() {
  const key = import.meta.env.VITE_KAKAO_JS_KEY?.trim();
  if (!key) return;
  if (pendingShare) return pendingShare;

  pendingShare = new Promise<KakaoShare>((resolve, reject) => {
    const script = document.createElement("script");
    const initialize = () => {
      try {
        const sdk = window.Kakao;
        if (!sdk?.Share) throw new Error("카카오톡 공유를 준비하지 못했어요.");
        if (!sdk.isInitialized()) sdk.init(key);
        resolve(sdk.Share);
      } catch (reason) {
        script.remove();
        reject(reason);
      }
    };
    if (window.Kakao) {
      initialize();
      return;
    }

    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.5/kakao.min.js";
    script.integrity = "sha384-v6JKY3z4FUkWq21oZDHZe74YvuPk/WUrVLrDHTBojHXClOSa3iXy7sCXPY1jkFbj";
    script.crossOrigin = "anonymous";
    script.onload = initialize;
    script.onerror = () => {
      script.remove();
      reject(new Error("카카오톡 공유를 불러오지 못했어요."));
    };
    document.head.append(script);
  }).catch((reason: unknown) => {
    pendingShare = undefined;
    throw reason;
  });

  return pendingShare;
}
