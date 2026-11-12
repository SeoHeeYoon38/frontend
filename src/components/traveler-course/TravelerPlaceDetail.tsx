import { useState } from "react";
import backIcon from "../../assets/figma/traveler-back.svg";
import heartIcon from "../../assets/figma/traveler-heart.svg";
import heartFilledIcon from "../../assets/figma/traveler-heart-filled.svg";
import { sannenzakaDetail } from "../../data/mocks/travelerCourseData";
import type { TravelerCoursePlace } from "../../types/course";
import * as S from "./TravelerCourseOverlay.styled";

interface TravelerPlaceDetailProps {
  onBack: () => void;
  place?: TravelerCoursePlace;
  city?: string;
}

function TravelerPlaceDetail({ onBack, place, city }: TravelerPlaceDetailProps) {
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState("");
  const hero = place?.image || sannenzakaDetail.hero;
  const name = place?.name || sannenzakaDetail.name;
  const category = place?.category || sannenzakaDetail.category;

  return (
    <S.PlaceScreen>
      <S.PlaceHero>
        <img src={hero} alt={name} />
        <S.PlaceNavigation>
          <button type="button" aria-label="지도 화면으로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button>
          <button type="button" aria-label={saved ? "장소 저장 해제" : "장소 저장"} onClick={() => setSaved((value) => !value)}><img src={saved ? heartFilledIcon : heartIcon} alt="" /></button>
        </S.PlaceNavigation>
        <S.GalleryIndicator>1 / {place ? 1 : sannenzakaDetail.gallery.length}</S.GalleryIndicator>
      </S.PlaceHero>

      <S.PlaceBody>
        <S.PlaceTitle>
          <span>{category}</span>
          <h1>{name}</h1>
          {!place && <small>{sannenzakaDetail.englishName}</small>}
          <p>{place ? city : <>★ {sannenzakaDetail.rating}　<span>{sannenzakaDetail.reviewCount}　|　{sannenzakaDetail.region}</span></>}</p>
        </S.PlaceTitle>
        <section><h2>소개</h2><p>{place ? `${city ?? "여행지"} 코스에 포함된 ${name}입니다.` : sannenzakaDetail.description}</p></section>
        <section>
          <h2>기본 정보</h2>
          <S.InfoRows>
            <div><span>방문 시간</span><strong>{place ? "코스 일정에서 확인" : sannenzakaDetail.hours}</strong>{!place && <b>지금 영업 중</b>}</div>
            <div><span>지역</span><strong>{place ? city : sannenzakaDetail.address}</strong></div>
          </S.InfoRows>
        </section>
        {!place && <section><h2>위치</h2><S.LocationMap src={sannenzakaDetail.map} alt="산넨자카 골목 위치 지도" /></section>}
      </S.PlaceBody>
      <S.AiButton type="button" onClick={() => setNotice("도틀로 AI 질문 화면은 다음 흐름에서 이어져요")}>✦　도틀로 AI에게 물어보기</S.AiButton>
      {notice && <div role="status" hidden>{notice}</div>}
    </S.PlaceScreen>
  );
}

export default TravelerPlaceDetail;

