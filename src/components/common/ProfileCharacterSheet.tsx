import { useState } from "react";
import blue from "../../assets/images/character-blue.webp";
import purple from "../../assets/images/character-purple.webp";
import type { ProfileAvatar } from "../../utils/mySettings";
import TripSheet from "./TripSheet";
import { Primary } from "../trip/Trip.styled";
import styled from "styled-components";

const characters = [
  { value: "blue", image: blue, label: "파란 캐릭터" },
  { value: "purple", image: purple, label: "보라 캐릭터" },
] as const;

const Choices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  button {
    width: 62px;
    height: 62px;
    padding: 4px;
    border: 2px solid transparent;
    border-radius: 50%;
    background: #f3f5fa;
  }

  button[aria-pressed="true"] { border-color: #090738; }
  img { width: 100%; height: 100%; object-fit: contain; }
`;

export default function ProfileCharacterSheet({ current, title, onClose, onApply }: {
  current: ProfileAvatar;
  title: string;
  onClose: () => void;
  onApply: (value: ProfileAvatar) => void;
}) {
  const [selected, setSelected] = useState(current);
  return (
    <TripSheet title={title} variant="course" onClose={onClose}
      footer={<Primary type="button" onClick={() => onApply(selected)}>적용하기</Primary>}>
      <p>기본 이미지</p>
      <Choices>
        {characters.map(({ value, image, label }) => (
          <button key={value} type="button" aria-label={label} aria-pressed={value === selected}
            onClick={() => setSelected(value)}>
            <img src={image} alt="" />
          </button>
        ))}
      </Choices>
    </TripSheet>
  );
}
