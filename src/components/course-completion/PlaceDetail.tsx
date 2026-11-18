import { useEffect, useState } from "react";
import placeDetailActions from "../../assets/course-completion/place-detail-actions.svg";
import placeDetailBack from "../../assets/course-completion/place-detail-back.svg";
import placeDetailMap from "../../assets/course-completion/place-detail-map.png";
import placeDetailPhoto from "../../assets/course-completion/place-detail-photo.png";
import mapIcon from "../../assets/figma/traveler-pin.svg";
import infoIcon from "../../assets/course-completion/place-detail-info.svg";
import chevronIcon from "../../assets/course-completion/place-detail-chevron.svg";
import CompanionOpinions from "../course-community/CompanionOpinions";
import ServerCompanionOpinions from "../course-community/ServerCompanionOpinions";
import { PlaceGallery } from "../common/PlacePhoto";
import type { TripInteractions } from "../../api/interactions";
import { getPlaceDetail, getPlaceHours, type PlaceDetailResponse, type PlaceHoursResponse } from "../../api/places";
import type { CoursePlace } from "../../types/courseCompletion";
import { isMapCoordinate } from "../../utils/googleMaps";
import CourseRouteMap from "./CourseRouteMap";

interface PlaceDetailProps {
  place: CoursePlace;
  onBack: () => void;
  onRemove: () => void;
  onMove?: () => void;
  onReplace?: () => void;
  server?: {
    tripId: number;
    day?: number;
    itemId: string;
    placeId: string;
    interactions?: TripInteractions;
    loadError?: string;
    onRefresh: () => Promise<void>;
    currentUserId?: number;
    currentCharacterId?: number | null;
    onChange: (update: (current: TripInteractions) => TripInteractions) => void;
  };
  removePending?: boolean;
  removeError?: string;
}

function PlaceDetail({ place, onBack, onRemove, onMove, onReplace, server, removePending = false, removeError }: PlaceDetailProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [hoursResult, setHoursResult] = useState<{
    key: string;
    value: PlaceHoursResponse | null;
    error: boolean;
  }>();
  const [placeResult, setPlaceResult] = useState<{
    key: string;
    value: PlaceDetailResponse | null;
    error: boolean;
  }>();
  const serverTripId = server?.tripId;
  const serverPlaceId = server?.placeId;
  const hoursKey = `${serverTripId ?? ""}:${serverPlaceId ?? ""}`;
  const hours = hoursResult?.key === hoursKey ? hoursResult.value : undefined;
  const hoursError = hoursResult?.key === hoursKey && hoursResult.error;
  const livePlace = placeResult?.key === hoursKey ? placeResult.value : undefined;
  const placeError = placeResult?.key === hoursKey && placeResult.error;
  useEffect(() => {
    if (!detailsExpanded || serverTripId === undefined || !serverPlaceId) return;
    const controller = new AbortController();
    void getPlaceHours(serverTripId, serverPlaceId, controller.signal).then(
      (result) => { if (!controller.signal.aborted) setHoursResult({ key: hoursKey, value: result ?? null, error: false }); },
      () => { if (!controller.signal.aborted) setHoursResult({ key: hoursKey, value: null, error: true }); },
    );
    return () => controller.abort();
  }, [detailsExpanded, serverTripId, serverPlaceId, hoursKey]);
  useEffect(() => {
    if (serverTripId === undefined || !serverPlaceId) return;
    const controller = new AbortController();
    void getPlaceDetail(serverTripId, serverPlaceId, controller.signal).then(
      (result) => { if (!controller.signal.aborted) setPlaceResult({ key: hoursKey, value: result, error: false }); },
      () => { if (!controller.signal.aborted) setPlaceResult({ key: hoursKey, value: null, error: true }); },
    );
    return () => controller.abort();
  }, [serverTripId, serverPlaceId, hoursKey]);
  const isKuromon = !server && place.name === "구로몬 시장";
  const coordinates = { latitude: livePlace?.latitude ?? place.latitude, longitude: livePlace?.longitude ?? place.longitude };
  const mapQuery = isMapCoordinate(coordinates) ? `${coordinates.latitude},${coordinates.longitude}` : place.name;
  const mapsUrl = livePlace?.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const showMap = () => window.open(mapsUrl, "_blank", "noopener,noreferrer");
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopyMessage("주소를 복사했어요.");
    } catch {
      setCopyMessage("주소를 복사하지 못했어요.");
    }
  };

  return (
    <main className="place-detail" aria-label={`${place.name} 상세`}>
      <header className="place-detail__hero">
        {server
          ? <PlaceGallery placeId={server.placeId} name={place.name} />
          : <img src={isKuromon ? placeDetailPhoto : place.image} alt={place.name} />}
        <div className="place-detail__scrim" />
        <div className="place-detail__nav">
          <button type="button" onClick={() => detailsExpanded ? setDetailsExpanded(false) : onBack()} aria-label={detailsExpanded ? "장소 의견으로 돌아가기" : "코스로 돌아가기"}>
            <img src={placeDetailBack} alt="" />
          </button>
          <span />
          <button type="button" aria-label="지도에서 보기" onClick={showMap}><img src={mapIcon} alt="" /></button>
          <button type="button" aria-label="더 보기" onClick={() => setConfirmRemove(true)}>
            <img src={placeDetailActions} alt="" />
          </button>
        </div>
      </header>

      <div className="place-detail__body">
        <div className="place-detail__chips">
          <span>{place.category}</span>
          {(!server || livePlace?.savedPlaceId != null) && <span>내가 저장</span>}
        </div>
        <h1>{livePlace?.name ?? place.name}</h1>
        {isKuromon && <p className="place-detail__english">Kuromon Ichiba Market</p>}
        {isKuromon && <div className="place-detail__rating">
          <strong>★ 4.2</strong>
          <span>리뷰 8,500</span>
          <span>오사카 난바</span>
          <button type="button" onClick={showMap}>지도 보기</button>
        </div>}
        {server && livePlace && (livePlace.rating !== null || livePlace.address) && <div className="place-detail__rating">
          {livePlace.rating !== null && <strong>★ {livePlace.rating.toFixed(1)}</strong>}
          {livePlace.reviewCount !== null && <span>리뷰 {livePlace.reviewCount.toLocaleString()}</span>}
          {livePlace.address && <span>{livePlace.address}</span>}
          <button type="button" onClick={showMap}>지도 보기</button>
        </div>}

        {!detailsExpanded && <button
          className="place-detail__more-info"
          type="button"
          aria-expanded={detailsExpanded}
          onClick={() => setDetailsExpanded(true)}
        >
          <img src={infoIcon} alt="" />
          영업시간, 위치 등 장소 정보 보기
          <img className={detailsExpanded ? "is-expanded" : ""} src={chevronIcon} alt="" />
        </button>}

        {!detailsExpanded && (server
          ? <><ServerCompanionOpinions tripId={server.tripId} itemId={server.itemId}
              interactions={server.interactions} loadError={server.loadError} onRefresh={server.onRefresh}
              currentUserId={server.currentUserId} currentCharacterId={server.currentCharacterId} onChange={server.onChange} /></>
          : <CompanionOpinions placeName={place.name} />)}

        {detailsExpanded && (
          <>
            <section>
              <h2>소개</h2>
              <p>{server
                ? placeError ? "장소 정보를 불러오지 못했어요." : livePlace === undefined ? "장소 정보를 확인하고 있어요." : livePlace?.summary || place.description || "장소 소개가 없어요."
                : isKuromon
                ? "190년 넘게 이어진 오사카의 부엌이에요. 해산물 꼬치, 와규 꼬치, 제철 과일을 가게 앞에서 바로 먹을 수 있어요. 지붕이 있는 아케이드라 비가 와도 다니기 좋아요."
                : place.description || place.detail || "장소 정보가 아직 없어요."}</p>
              {isKuromon && <div className="place-detail__tags">
                <span>해산물 꼬치</span>
                <span>길거리 음식</span>
                <span>실내 아케이드</span>
              </div>}
            </section>

            {isKuromon && <section>
              <h2>정보</h2>
              <dl className="place-detail__info">
                <div><dt>영업시간</dt><dd><b>오늘 영업 중</b><br />09:00 - 18:00 <button type="button">요일별 보기</button></dd></div>
                <div><dt>휴무</dt><dd>가게마다 달라요, 일요일 휴무 많음</dd></div>
                <div><dt>주소</dt><dd>1 Chome-15-6 Nippombashi, Chuo Ward <button type="button">복사</button></dd></div>
                <div><dt>가는 법</dt><dd>난바역 도보 6분, 숙소에서 도보 5분 <button type="button">길찾기</button></dd></div>
                <div><dt>전화</dt><dd>+81 6-6631-0007</dd></div>
                <div><dt>예약</dt><dd>예약 없이 방문</dd></div>
              </dl>
            </section>}

            {server && <section>
              <h2>정보</h2>
              <dl className="place-detail__info">
                <div><dt>영업시간</dt><dd>
                  {hoursError ? "영업시간을 불러오지 못했어요." : hours === undefined ? "영업시간을 확인하고 있어요."
                    : hours === null ? "영업시간 정보가 없어요."
                      : <>
                        <b>{hours.open24h ? "24시간 영업" : hours.openNow ? "지금 영업 중" : "지금 영업 종료"}</b>
                        {!hours.open24h && hours.days.length > 0 && <>
                          <button type="button" aria-expanded={showHours} aria-controls="place-weekday-hours" onClick={() => setShowHours((open) => !open)}>요일별 보기</button>
                          <div hidden={!showHours} id="place-weekday-hours">
                            {hours.days.map(({ day, hours: periods }) => (
                              <div key={day}>{({ MONDAY: "월", TUESDAY: "화", WEDNESDAY: "수", THURSDAY: "목", FRIDAY: "금", SATURDAY: "토", SUNDAY: "일" } as const)[day]}요일 {periods.length
                                ? periods.map(({ open, close }) => `${open} - ${close}`).join(", ") : "휴무"}</div>
                            ))}
                          </div>
                        </>}
                      </>}
                </dd></div>
                {livePlace?.address && <div><dt>주소</dt><dd>
                  {livePlace.address}<button type="button" onClick={() => void copyAddress(livePlace.address!)}>복사</button>
                </dd></div>}
              </dl>
              {copyMessage && <small role="status">{copyMessage}</small>}
            </section>}

            {server && <section>
              <h2>위치</h2>
              {isMapCoordinate(coordinates) && <div className="place-detail__live-map">
                <CourseRouteMap places={[{ id: server.placeId, name: place.name, ...coordinates }]} city={place.name} live />
              </div>}
              <button className="place-detail__map-link" type="button" onClick={showMap}>구글맵에서 열기</button>
            </section>}

            {server && livePlace?.reviewCount != null && <section className="place-detail__review">
              <h2>리뷰</h2>
              <b>구글 리뷰 {livePlace.reviewCount.toLocaleString()}개</b>
              <a href={mapsUrl} target="_blank" rel="noreferrer">리뷰 더 보기</a>
            </section>}

            {isKuromon && <section>
              <h2>위치</h2>
              <div className="place-detail__map">
                <img src={placeDetailMap} alt="구로몬 시장 위치 지도" />
                <span>1</span>
              </div>
              <button className="place-detail__map-link" type="button" onClick={showMap}>구글맵에서 열기</button>
            </section>}

            {isKuromon && <section className="place-detail__review">
              <h2>리뷰</h2>
              <b>구글 리뷰 8,500개</b>
              <article>
                <strong>여행자 리뷰 요약</strong>
                <p>오전에 가야 신선하고 덜 붐벼요. 현금만 받는 가게가 많아요.</p>
              </article>
              <article>
                <strong>minji 님</strong>
                <p>참치 꼬치랑 딸기 모찌가 제일 맛있었어요. 한 바퀴 도는 데 40분쯤 걸려요.</p>
              </article>
            </section>}
            {(onReplace || onMove) && <div className="place-detail__quick-actions">
              {onReplace && <button type="button" onClick={onReplace}>비슷한 곳으로 바꾸기</button>}
              {onMove && <button type="button" onClick={onMove}>일차 옮기기</button>}
            </div>}

          </>
        )}
      </div>
      {detailsExpanded && <div className="place-detail__footer">
        <button type="button" className="is-muted" onClick={() => setConfirmRemove(true)}>일정에서 빼기</button>
        <button type="button" onClick={() => setDetailsExpanded(false)}>확인</button>
      </div>}
      {confirmRemove && <div className="place-detail__confirm-layer" role="presentation" onClick={() => setConfirmRemove(false)}>
        <section role="alertdialog" aria-modal="true" aria-labelledby="place-remove-title" onClick={(event) => event.stopPropagation()}>
          <h2 id="place-remove-title">{place.name}을 일정에서 뺄까요?</h2>
          <p>{server?.day ? `${server.day}일차 코스에서 빠지고` : "일정에서 빠지고"}<br />일행에게도 바로 반영돼요.</p>
          {removeError && <p role="alert">{removeError}</p>}
          <div>
            <button type="button" disabled={removePending} onClick={() => setConfirmRemove(false)}>취소</button>
            <button type="button" disabled={removePending} onClick={onRemove}>{removePending ? "반영 중" : "빼기"}</button>
          </div>
        </section>
      </div>}
    </main>
  );
}

export default PlaceDetail;
