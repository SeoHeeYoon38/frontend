import { useState } from "react";
import styled from "styled-components";
import camera from "../../assets/profile-characters/photo-camera.svg";
import album from "../../assets/profile-characters/photo-album.svg";
import check from "../../assets/profile-characters/photo-selected.svg";
import { profileCharacters } from "../../config/profileCharacters";
import type { ProfileAvatar } from "../../utils/mySettings";
import { Primary } from "../trip/Trip.styled";
import TripSheet from "./TripSheet";

const PhotoActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 6px;

  && button {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 8px;
    min-height: 84px;
    border-radius: 14px;
    background: #f3f5fa;
    font-size: 14px;
    font-weight: 500;
  }
`;

const Label = styled.p`
  margin: 24px 0 12px;
  color: #5c5c63;
  font-size: 13px;
  line-height: 18px;
`;

const PhotoNotice = styled.p`
  margin: 8px 0 0;
  color: #5c5c63;
  font-size: 13px;
`;

const Choices = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 62px));
  justify-content: space-between;
  gap: 12px 6px;
`;

const Choice = styled.button<{ $color: string }>`
  && {
    display: grid;
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    place-items: center;
    border: 2.5px solid transparent;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }

  &[aria-pressed="true"] { border-color: #090738; }
  .character-frame {
    position: relative;
    width: 90%;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 50%;
  }
  .character { display: block; width: 100%; height: 100%; object-fit: contain; }
  .character--wide { position: absolute; inset: -23% -26% auto; width: 152%; height: 152%; }
  .check { position: absolute; right: -3px; bottom: -3px; }
`;

const Apply = styled(Primary)`
  && {
    margin-bottom: max(26px, env(safe-area-inset-bottom));
    background: #090738;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
  }
`;

export default function ProfileCharacterSheet({ current, title, onClose, onApply }: {
  current: ProfileAvatar;
  title: string;
  onClose: () => void;
  onApply: (value: ProfileAvatar) => void;
}) {
  const [selected, setSelected] = useState(current);
  const [photoNotice, showPhotoNotice] = useState(false);
  return (
    <TripSheet title={title} variant="course" courseHeight={473} contentGap={0} onClose={onClose}
      footer={<Apply type="button" onClick={() => onApply(selected)}>적용하기</Apply>}>
      <PhotoActions>
        <button type="button" onClick={() => showPhotoNotice(true)}><img src={camera} alt="" />사진 찍기</button>
        <button type="button" onClick={() => showPhotoNotice(true)}><img src={album} alt="" />앨범에서 선택</button>
      </PhotoActions>
      {photoNotice && <PhotoNotice role="status">사진 등록은 준비 중이에요. 기본 이미지 중에서 골라 주세요.</PhotoNotice>}
      <Label>기본 이미지</Label>
      <Choices role="group" aria-label="기본 이미지">
        {profileCharacters.map(({ id, image, label, color }) => (
          <Choice key={id} type="button" $color={color} aria-label={label} aria-pressed={id === selected}
            onClick={() => setSelected(id)}>
            <span className="character-frame"><img className={id === 7 ? "character character--wide" : "character"} src={image} alt="" /></span>
            {id === selected && <img className="check" src={check} alt="" />}
          </Choice>
        ))}
      </Choices>
    </TripSheet>
  );
}
