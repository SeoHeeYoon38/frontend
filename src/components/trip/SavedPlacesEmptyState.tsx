import emptyIcon from "../../assets/icons/status-saved-places-empty.svg";
import * as S from "./SavedPlacesStep.styled";

export default function SavedPlacesEmptyState({ city }: { city: string }) {
  return (
    <S.EmptyState>
      <S.EmptyArt><img src={emptyIcon} alt="" /></S.EmptyArt>
      <h2>{city}에 저장한 장소가 없어요</h2>
      <p>{city} 인기 장소나 추천 코스에서 바로 담을 수 있어요</p>
    </S.EmptyState>
  );
}
