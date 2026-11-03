import { useEffect, useId, useRef, type ReactNode } from "react";
import close from "../../assets/icons/action-close.svg";
import * as S from "./TripSheet.styled";
interface TripSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  minHeight?: number;
  variant?: "default" | "course" | "people" | "dates";
  contentGap?: number;
  compactHeader?: boolean;
}
function TripSheet({
  title,
  onClose,
  children,
  footer,
  minHeight = 0,
  variant = "default",
  contentGap,
  compactHeader = false,
}: TripSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    dialog
      ?.querySelector<HTMLButtonElement>("[data-close]")
      ?.focus({ preventScroll: true });
    return () => dialog?.close();
  }, []);
  return (
    <S.Sheet
      $minHeight={minHeight}
      $course={variant === "course"}
      ref={ref}
      aria-labelledby={id}
      onCancel={onClose}
    >
      <S.Grabber />
      <S.SheetHeader
        $course={variant === "course"}
        $compact={compactHeader}
        $basic={
          variant === "people" || variant === "dates" ? variant : undefined
        }
      >
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          aria-label="닫기"
          data-close
          autoFocus
          onClick={onClose}
        >
          <img src={close} alt="" />
        </button>
      </S.SheetHeader>
      <S.SheetBody $course={variant === "course"} $gap={contentGap}>
        {children}
      </S.SheetBody>
      {footer && <S.SheetFooter>{footer}</S.SheetFooter>}
    </S.Sheet>
  );
}
export default TripSheet;
