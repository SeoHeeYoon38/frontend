import { useEffect, useState } from "react";
import { checkNickname } from "../api/auth";

type Availability = "available" | "taken" | "error";

export default function useNicknameAvailability(nickname: string | undefined) {
  const [checked, setChecked] = useState<{ nickname: string; availability: Availability }>();

  useEffect(() => {
    if (!nickname) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void checkNickname(nickname, controller.signal).then(
        (result) => {
          if (controller.signal.aborted) return;
          const availability = result?.available === true ? "available" :
            result?.available === false ? "taken" : "error";
          setChecked({ nickname, availability });
        },
        () => {
          if (!controller.signal.aborted) setChecked({ nickname, availability: "error" });
        },
      );
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [nickname]);

  return {
    availability: nickname && checked?.nickname === nickname ? checked.availability : undefined,
    clear: () => setChecked(undefined),
    markTaken: (value: string) => setChecked({ nickname: value, availability: "taken" }),
  };
}
