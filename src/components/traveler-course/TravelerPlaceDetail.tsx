import backIcon from "../../assets/figma/traveler-back.svg";
import { useState } from "react";
import heartIcon from "../../assets/figma/traveler-heart.svg";
import heartFilledIcon from "../../assets/figma/traveler-heart-filled.svg";
import aiSparkleIcon from "../../assets/icons/status-ai-sparkle.svg";
import mapsLogo from "../../assets/images/brand-google-maps.webp";
import externalIcon from "../../assets/place-import/guide-external.svg";
import { sannenzakaDetail } from "../../data/mocks/travelerCourseData";
import type { TravelerCoursePlace } from "../../types/course";
import * as S from "./TravelerCourseOverlay.styled";
import { PlaceGallery } from "../common/PlacePhoto";
import useSavedItems from "../../hooks/useSavedItems";
import { isMapCoordinate, googleMapsEmbedUrl } from "../../utils/googleMaps";
import { hasAuthSession } from "../../api/tokenStorage";

interface TravelerPlaceDetailProps {
  onBack: () => void;
  onAskAi: () => void;
  place?: TravelerCoursePlace;
  city?: string;
  photoCourseId?: number;
}

function TravelerPlaceDetail({ onBack, onAskAi, place, city, photoCourseId }: TravelerPlaceDetailProps) {
  const isGuest = photoCourseId !== undefined && !hasAuthSession();
  const { places, setPlace, saveError, placesLoading, pendingId } = useSavedItems(!isGuest);
  const [copyMessage, setCopyMessage] = useState("");
  const [favoriteNotice, setFavoriteNotice] = useState("");
  const sample = photoCourseId === undefined && (!place || place.id === sannenzakaDetail.id) ? sannenzakaDetail : undefined;
  const hero = sample?.hero ?? place?.image ?? "";
  const name = place?.name || sample?.name || "장소";
  const category = place?.category || sample?.category || "기타";
  const livePlace = photoCourseId !== undefined && place;
  const id = place?.id || sample?.id || "";
  const savedPlaces = places.filter(item => item.id === id || item.placeId === id);
  const saved = savedPlaces.length > 0;
  const coordinates = place && isMapCoordinate(place) ? { latitude: place.latitude, longitude: place.longitude } : undefined;
  const query = coordinates ? `${coordinates.latitude},${coordinates.longitude}` : sample?.address || [name, city].filter(Boolean).join(" ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  function toggleFavorite() {
    if (isGuest) { setFavoriteNotice("장소를 저장하려면 로그인이 필요해요."); return; }
    if (savedPlaces.length > 1) {
      setFavoriteNotice("여러 여행에 저장한 장소예요. 마이의 저장한 장소에서 여행별로 관리할 수 있어요.");
      return;
    }
    setFavoriteNotice("");
    void setPlace(savedPlaces[0]?.id ?? id, saved ? null : {
      id, name, category, image: hero, city: city ?? (sample ? "교토" : ""), source: "인기 코스에서 저장",
    });
  }

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopyMessage("주소를 복사했어요.");
    } catch {
      setCopyMessage("주소를 복사하지 못했어요.");
    }
  }

  return (
    <S.PlaceScreen>
      <S.PlaceHero>
        {(livePlace && id) || sample ? <PlaceGallery courseId={photoCourseId} placeId={id} name={name} images={sample?.gallery} /> : hero && <img src={hero} alt={name} />}
        <S.PlaceNavigation>
          <button type="button" aria-label="이전 화면으로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button>
          <button type="button" aria-label="장소 찜" disabled={!id || (!isGuest && placesLoading) || pendingId !== null} aria-pressed={saved}
            onClick={toggleFavorite}><img src={saved ? heartFilledIcon : heartIcon} alt="" /></button>
        </S.PlaceNavigation>
      </S.PlaceHero>

      <S.PlaceBody>
        {saveError && <p role="alert">{saveError}</p>}
        {favoriteNotice && <p role="status">{favoriteNotice}</p>}
        <S.PlaceTitle>
          <span>{category}</span>
          <h1>{name}</h1>
          {sample && <small>{sample.englishName}</small>}
          <p>{sample ? <>★ {sample.rating}　<span>{sample.reviewCount}　|　{sample.region}</span></> : city}</p>
        </S.PlaceTitle>
        {sample && <section><h2>소개</h2><p>{sample.description}</p></section>}
        <section>
          <h2>기본 정보</h2>
          <S.InfoRows>
            {sample ? <>
              <div><span>영업시간</span><strong>{sample.hours}<b>● 지금 영업 중</b></strong><a href={mapsUrl} target="_blank" rel="noreferrer">요일별 ›</a></div>
              <div><span>주소</span><strong>{sample.address}<small>교토 히가시야마구 기요미즈 2초메</small></strong>
                <button type="button" onClick={() => void copyAddress(sample.address)}>복사</button></div>
              {copyMessage && <p role="status">{copyMessage}</p>}
            </> : <>
              {place?.visitTime && <div><span>방문 시간</span><strong>{place.visitTime}</strong></div>}
              <div><span>지역</span><strong>{city}</strong></div>
            </>}
          </S.InfoRows>
        </section>
        <section><h2>위치</h2>
          <S.LocationPreview>
            {sample ? <S.LocationMap src={sample.map} alt={`${name} 위치 지도`} /> : coordinates && <S.EmbeddedMap title={`${name} 위치 지도`} src={googleMapsEmbedUrl({ ...coordinates, zoom: 16 })} loading="lazy" />}
            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <img width="16" height="16" src={mapsLogo} alt="" />구글맵에서 열기<img width="12" height="12" src={externalIcon} alt="" />
            </a>
          </S.LocationPreview>
        </section>
        {sample && <>
          <section><h2>근처 가볼 만한 곳</h2>
            <S.NearbyPlaces>{sample.nearby.map(item => <li key={item.name}>
              <img src={item.image} alt="" />
              <strong>{item.name}</strong><small>{item.walk}　|　{item.category}</small>
            </li>)}</S.NearbyPlaces>
          </section>
          <S.Reviews>
            <header><h2>리뷰</h2><strong>★ {sample.rating}</strong><small>{sample.reviewCount}개</small></header>
            <aside><strong>✧ 리뷰 AI 요약</strong><ul>{sample.reviewHighlights.map(text => <li key={text}>{text}</li>)}</ul></aside>
            {sample.reviews.map(review => <article key={review.author}>
              <strong>{review.author}</strong><small>{review.rating}　{review.month}</small><p>{review.text}</p>
            </article>)}
            <S.MapLink href={mapsUrl} target="_blank" rel="noreferrer">구글맵에서 리뷰 더 보기</S.MapLink>
          </S.Reviews>
        </>}
      </S.PlaceBody>
      <S.AiButton type="button" onClick={onAskAi}><img src={aiSparkleIcon} alt="" />도틀로 AI에게 물어보기</S.AiButton>
    </S.PlaceScreen>
  );
}

export default TravelerPlaceDetail;

