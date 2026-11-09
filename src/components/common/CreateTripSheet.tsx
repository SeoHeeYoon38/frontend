import { useEffect, useId, useRef } from "react";
import aiCharacter from "../../assets/images/character-purple.webp";
import courseCharacter from "../../assets/images/character-blue.webp";
import pen from "../../assets/icons/action-pen.svg";
import chevron from "../../assets/icons/nav-chevron-right-muted.svg";
import { routes } from "../../config/routes";
import * as S from "./CreateTripSheet.styled";

const options = [
  {
    variant: "ai",
    to: routes.createTrip,
    icon: aiCharacter,
    title: "AI 맞춤 여행 만들기",
    description: "취향과 저장 장소로 전체 일정을 짜줘요",
  },
  {
    variant: "course",
    to: routes.courses,
    icon: courseCharacter,
    title: "인기 코스 둘러보기",
    description: "많이 선택한 코스를 내 일정에 가져와요",
  },
  {
    variant: "direct",
    to: `${routes.createTrip}?mode=direct`,
    icon: pen,
    title: "직접 일정 만들기",
    description: "빈 일정에서 장소를 하나씩 담아요",
  },
] as const;

interface CreateTripSheetProps {
  onClose: () => void;
}

function CreateTripSheet({ onClose }: CreateTripSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <S.Sheet
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          onClose();
        }
      }}
    >
      <S.Handle type="button" aria-label="여행 만들기 닫기" onClick={onClose} />
      <h2 id={titleId}>어떻게 여행을 만들까요?</h2>
      <S.Options>
        {options.map(({ variant, to, icon, title, description }) => (
          <S.Option key={variant} to={to}>
            <S.Thumbnail $variant={variant}>
              <img src={icon} alt="" />
            </S.Thumbnail>
            <S.OptionText>
              <strong>{title}</strong>
              <small>{description}</small>
            </S.OptionText>
            <img src={chevron} alt="" />
          </S.Option>
        ))}
      </S.Options>
      <S.HomeIndicator aria-hidden="true" />
    </S.Sheet>
  );
}

export default CreateTripSheet;
