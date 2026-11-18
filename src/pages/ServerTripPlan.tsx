import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ApiError } from "../api/client";
import { canRevertVersion, restoredPlan, revertErrorMessage } from "../utils/itineraryRevert";
import {
  applyItineraryEdit,
  getItineraryHistory,
  getLatestItinerary,
  requestItineraryEdit,
  revertItinerary,
  saveItinerary,
} from "../api/itineraries";
import { getTripInteractions, type TripInteractions } from "../api/interactions";
import { getSavedPlaces } from "../api/places";
import { getTripMembers } from "../api/members";
import { confirmTrip, getTrip } from "../api/trips";
import { getPlacePhoto } from "../api/placePhotos";
import type {
  ItineraryEditPreview,
  ItineraryVersionSummary,
  ItineraryVersionView,
  SavedPlaceResponse,
  MemberResponse,
  TripResponse,
} from "../api/types";
import { readPlanDay, readPlanOrigin, resumeTripPath, tripCommunityPath, tripPlanBackPath, tripSettingsPath } from "../utils/navigation";
import { apiTripToDraft, apiTripToSummary } from "../utils/serverTrip";
import { dateLabel, durationLabel, timeLabel } from "../utils/trip";
import DirectTripBuilder from "../components/direct-trip/DirectTripBuilder";
import CourseRouteMap from "../components/course-completion/CourseRouteMap";
import TripTimeline from "../components/course-completion/TripTimeline";
import PlaceDetail from "../components/course-completion/PlaceDetail";
import AddItineraryPlaceSheet from "../components/course-completion/AddItineraryPlaceSheet";
import TravelModeSheet from "../components/course-completion/TravelModeSheet";
import AiEditSheet from "../components/course-completion/AiEditSheet";
import type { TravelLeg } from "../api/types";
import { travelModeLabels } from "../utils/trip";
import TripSummary from "../components/course-completion/TripSummary";
import ImportedTripRegistration from "../components/course-completion/ImportedTripRegistration";
import TripSheet from "../components/common/TripSheet";
import { RegisterBanner } from "./ImportedTripPage.styled";
import calendarIcon from "../assets/course-completion/icon-calendar.svg";
import backIcon from "../assets/icons/nav-back.svg";
import settingsIcon from "../assets/course-completion/settings.svg";
import aiAvatar from "../assets/course-community/ai-avatar.png";
import addIcon from "../assets/icons/action-add.svg";
import checkIcon from "../assets/icons/status-selected-check.svg";
import triangleIcon from "../assets/course-completion/triangle-down.svg";
import inviteIcon from "../assets/course-settings-details/member-add.svg";
import chatIcon from "../assets/course-community/chat.svg";
import avatarBlue from "../assets/course-settings/avatar-blue.png";
import avatarPurple from "../assets/course-settings/avatar-purple.png";
import avatarYellow from "../assets/course-settings/avatar-yellow.png";
import { routes } from "../config/routes";

interface TripPlanData {
  trip: TripResponse;
  itinerary: ItineraryVersionView | null;
  places: SavedPlaceResponse[];
  history: ItineraryVersionSummary[];
  members: MemberResponse[];
  interactions?: TripInteractions;
}

// Keep the last server response while moving between the course and chat screens.
// A fresh request still runs on every mount, so this never becomes the source of truth.
const recentPlans = new Map<string, TripPlanData>();

const sourceLabels: Record<ItineraryVersionSummary["source"], string> = {
  AI_GENERATED: "AI 일정 생성",
  AI_EDITED: "AI 수정",
  MANUAL_EDIT: "직접 수정",
  COURSE_ADD: "코스 추가",
  REVERT: "되돌리기",
};

const categoryLabels: Record<string, string> = {
  FOOD: "맛집",
  CAFE: "카페",
  SIGHTSEEING: "명소",
  SHOPPING: "쇼핑",
  NATURE: "자연",
  CULTURE: "문화",
  NIGHTLIFE: "야경",
  ACTIVITY: "체험",
  OTHER: "장소",
};

function travelDeparture(arrival: string, minutes: number) {
  const instant = Date.parse(`${arrival.slice(0, 19)}Z`);
  return Number.isFinite(instant) && Number.isFinite(minutes)
    ? new Date(instant - minutes * 60_000).toISOString().slice(0, 19)
    : undefined;
}

function ServerTripPlan({ tripId, userId }: { tripId: number; userId: number }) {
  const { search, state } = useLocation();
  const cacheKey = `${userId}:${tripId}`;
  const [data, setData] = useState<TripPlanData | undefined>(() => recentPlans.get(cacheKey));
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(() => readPlanDay(search) - 1);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [photoPlace, setPhotoPlace] = useState<{ itemId: string; placeId: string; name: string }>();
  const placeReturnScroll = useRef<number | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [photoPending, setPhotoPending] = useState(false);

  useLayoutEffect(() => {
    if (photoPlace) {
      if (placeReturnScroll.current === null) placeReturnScroll.current = window.scrollY;
      window.scrollTo(0, 0);
    } else if (placeReturnScroll.current !== null) {
      window.scrollTo(0, placeReturnScroll.current);
      placeReturnScroll.current = null;
    }
  }, [photoPlace]);
  const [interactionError, setInteractionError] = useState("");
  const interactionRequest = useRef(0);
  const [editing, setEditing] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [travelSelection, setTravelSelection] = useState<{
    date: string;
    targetItemId: string;
    from: string;
    to: string;
    fromCoordinate?: { latitude: number; longitude: number };
    toCoordinate?: { latitude: number; longitude: number };
    departAt?: string;
    travel: TravelLeg;
  }>();
  const [travelSaving, setTravelSaving] = useState(false);
  const [travelError, setTravelError] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editPreview, setEditPreview] = useState<ItineraryEditPreview>();
  const [editPending, setEditPending] = useState(false);
  const reverting = useRef(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState(state?.courseImported === true ? "내 일정으로 가져왔어요" : "");
  const [inviteAccepted, setInviteAccepted] = useState(state?.inviteAccepted === true);
  const [confirmation, setConfirmation] = useState<Awaited<ReturnType<typeof confirmTrip>> | null | undefined>(
    state?.confirmation,
  );
  const [confirming, setConfirming] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(() => {
    try { return localStorage.getItem(`dotlo:imported-trip-registered:${tripId}`) === "true"; }
    catch { return false; }
  });
  const [importedPhoto, setImportedPhoto] = useState<string | undefined>(state?.importedCoverImageUrl);
  const confirmationPending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadPlan() {
      try {
        const [trip, itinerary] = await Promise.all([getTrip(tripId, signal), getLatestItinerary(tripId, signal).catch((reason: unknown) => {
          if (reason instanceof ApiError && reason.code === "ITINERARY_NOT_FOUND") return null;
          throw reason;
        })]);
        if (signal.aborted) return;
        const [saved, history, members, interactions] = await Promise.all([
          itinerary ? getSavedPlaces(tripId, signal) : Promise.resolve(undefined),
          itinerary ? getItineraryHistory(tripId, signal).catch(() => []) : Promise.resolve([]),
          getTripMembers(tripId, signal),
          itinerary ? getTripInteractions(tripId, signal).catch(() => {
            if (!signal.aborted) setInteractionError("좋아요와 댓글을 불러오지 못했어요.");
            return undefined;
          }) : Promise.resolve(undefined),
        ]);
        if (!signal.aborted) {
          const dayCount = itinerary?.validation.days.length ?? 0;
          setActiveDay((current) => Math.min(current, Math.max(dayCount - 1, 0)));
          setData({ trip, itinerary, places: saved?.places ?? [], history, members, interactions });
        }
      } catch (reason) {
        if (signal.aborted) return;
        if (reason instanceof ApiError && reason.code === "TRIP_NOT_FOUND") {
          recentPlans.delete(cacheKey);
          setData(undefined);
        }
        setError(reason instanceof ApiError && reason.code === "TRIP_NOT_FOUND"
          ? "여행을 찾지 못했어요."
          : "여행 일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    }

    void loadPlan();
    return () => controller.abort();
  }, [tripId, cacheKey]);

  useEffect(() => {
    if (data) recentPlans.set(cacheKey, data);
  }, [data, cacheKey]);

  const summary = data && apiTripToSummary(data.trip);
  const days = data?.itinerary?.validation.days ?? [];
  const imported = data?.itinerary?.source === "COURSE_ADD" ||
    data?.history.some((item) => item.source === "COURSE_ADD") || state?.courseImported === true;
  const firstItinerarySource = data?.history.find((item) => item.version === 1)?.source ??
    (data?.itinerary?.version === 1 ? data.itinerary.source : undefined);
  const manuallyCreated = !imported && firstItinerarySource === "MANUAL_EDIT";
  const importedPlaceId = data?.itinerary?.draft.days.flatMap((item) => item.visits)[0]?.placeId;

  useEffect(() => {
    if (!imported || !importedPlaceId) return;
    let active = true;
    void getPlacePhoto(importedPlaceId, 0).then((photo) => {
      if (active && photo?.photoUrl) setImportedPhoto((current) => current || photo.photoUrl);
    }, () => undefined);
    return () => { active = false; };
  }, [imported, importedPlaceId]);

  useEffect(() => {
    if (!imported || !notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4_000);
    return () => window.clearTimeout(timeout);
  }, [imported, notice]);

  const day = days[activeDay];
  const origin = readPlanOrigin(search);
  const backPath = origin === "generated" ? routes.myTrips : tripPlanBackPath(search);
  const placesById = new Map(data?.places.map((place) => [place.placeId, place]));
  const scheduledPlaceIds = new Set(days.flatMap((item) => item.visits.map((visit) => visit.placeId)));
  const placeCount = scheduledPlaceIds.size;
  const mapPlaces = (day?.visits ?? []).flatMap((visit, index) => {
    const place = placesById.get(visit.placeId);
    if (typeof place?.latitude !== "number" || typeof place.longitude !== "number" ||
      !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return [];
    return [{ id: visit.itemId, name: place.name, latitude: place.latitude, longitude: place.longitude, order: index + 1 }];
  });
  const excludedPlaceIds: string[] = Array.isArray(state?.excludedPlaceIds) ? state.excludedPlaceIds : [];
  const movementModes = new Set(days.flatMap((item) => item.visits.map((visit) => visit.travel.mode)));
  const movementLabel = movementModes.size === 0
    ? "이동 정보 확인 중"
    : [...movementModes].map((mode) => travelModeLabels[mode]).join("·");
  const shared = (data?.members.length ?? 0) > 1;
  const memberFallbacks = [avatarBlue, avatarPurple, avatarYellow];

  async function retryConfirmation() {
    if (!data?.itinerary || confirmationPending.current) return;
    confirmationPending.current = true;
    setConfirming(true);
    try {
      setConfirmation(await confirmTrip(tripId));
    } catch {
      setConfirmation(null);
    } finally {
      confirmationPending.current = false;
      setConfirming(false);
    }
  }

  const reloadHistory = async () => {
    const history = await getItineraryHistory(tripId);
    setData((current) => current ? { ...current, history } : current);
  };

  const applyTravelMode = async (mode: TravelLeg["mode"], all: boolean) => {
    if (!data?.itinerary || !travelSelection || travelSaving) return;
    setTravelSaving(true);
    setTravelError("");
    try {
      const days = data.itinerary.draft.days.map(({ date, visits }) => ({
        date,
        visits: visits.map((visit, index) =>
          index > 0 && (all || (date === travelSelection.date && visit.itemId === travelSelection.targetItemId))
            ? { ...visit, travelMode: mode }
            : visit),
      }));
      const itinerary = await saveItinerary(tripId, days, data.itinerary.version);
      setData((current) => current ? { ...current, itinerary } : current);
      setTravelSelection(undefined);
      setNotice("이동 수단을 저장했어요.");
      void reloadHistory().catch(() => undefined);
    } catch (reason) {
      setTravelError(reason instanceof Error ? reason.message : "이동 수단을 저장하지 못했어요.");
    } finally {
      setTravelSaving(false);
    }
  };

  const refreshInteractions = async () => {
    const request = ++interactionRequest.current;
    const interactions = await getTripInteractions(tripId);
    if (request !== interactionRequest.current) return;
    setData((current) => current ? { ...current, interactions } : current);
    setInteractionError("");
  };

  const removeSelectedPlace = async () => {
    if (!data?.itinerary || !photoPlace || photoPending) return;
    setPhotoPending(true);
    setPhotoError("");
    try {
      if (!data.itinerary.draft.days.some((item) => item.visits.some((visit) => visit.itemId === photoPlace.itemId))) {
        throw new Error("현재 일정에서 이 장소를 찾지 못했어요. 일정을 다시 열어 주세요.");
      }
      const days = data.itinerary.draft.days.map((item) => ({
        ...item,
        visits: item.visits.filter((visit) => visit.itemId !== photoPlace.itemId),
      }));
      const itinerary = await saveItinerary(tripId, days, data.itinerary.version);
      setData((current) => current ? { ...current, itinerary } : current);
      setPhotoPlace(undefined);
      setNotice(`${photoPlace.name}을 일정에서 뺐어요.`);
      void reloadHistory().catch(() => undefined);
      void refreshInteractions().catch(() => undefined);
    } catch (reason) {
      setPhotoError(reason instanceof Error ? reason.message : "장소를 일정에서 빼지 못했어요.");
    } finally {
      setPhotoPending(false);
    }
  };

  const requestEdit = async () => {
    const message = editMessage.trim();
    if (!message || editPending) return;
    setEditPending(true);
    setActionError("");
    setNotice("");
    setEditPreview(undefined);
    try {
      setEditPreview(await requestItineraryEdit(tripId, message));
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "수정안을 만들지 못했어요.");
    } finally {
      setEditPending(false);
    }
  };

  const applyEdit = async () => {
    if (!editPreview || editPending) return;
    setEditPending(true);
    setActionError("");
    try {
      const itinerary = await applyItineraryEdit(tripId, editPreview.editRequestId);
      setData((current) => current ? { ...current, itinerary } : current);
      setEditPreview(undefined);
      setEditMessage("");
      setShowAiEdit(false);
      setActiveDay(0);
      setNotice("수정한 일정을 적용했어요.");
      await reloadHistory();
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) {
        setEditPreview(undefined);
        setActionError("일정이 변경되어 수정안을 적용하지 못했어요. 최신 일정을 확인하고 수정안을 다시 만들어 주세요.");
        try {
          const itinerary = await getLatestItinerary(tripId);
          setData((current) => current ? { ...current, itinerary } : current);
          setActiveDay(0);
          await reloadHistory();
        } catch {
          setActionError("최신 일정을 불러오지 못했어요. 여행 일정을 다시 열고 수정안을 만들어 주세요.");
        }
      } else {
        setActionError(reason instanceof Error ? reason.message : "수정안을 적용하지 못했어요.");
      }
    } finally {
      setEditPending(false);
    }
  };

  const revert = async (version: number) => {
    if (editPending || reverting.current || !data?.itinerary || !canRevertVersion(version, data.itinerary.version)) return;
    reverting.current = true;
    setEditPending(true);
    setActionError("");
    setNotice("");
    try {
      const itinerary = await revertItinerary(tripId, version);
      interactionRequest.current += 1;
      setData((current) => current ? restoredPlan(current, itinerary) : current);
      setEditPreview(undefined);
      setTravelSelection(undefined);
      setPhotoPlace(undefined);
      setActiveDay(0);
      setNotice(`${version}번 일정으로 되돌렸어요.`);
      const [historyResult, interactionsResult] = await Promise.allSettled([reloadHistory(), refreshInteractions()]);
      if (historyResult.status === "rejected") {
        setActionError("일정은 복원했지만 변경 이력을 다시 불러오지 못했어요.");
      }
      if (interactionsResult.status === "rejected") {
        setInteractionError("일정은 복원했지만 일행 의견을 불러오지 못했어요. 장소 상세에서 다시 조회해 주세요.");
      }
    } catch (reason) {
      setActionError(revertErrorMessage(reason));
    } finally {
      reverting.current = false;
      setEditPending(false);
    }
  };

  if (editing && data?.itinerary) {
    return (
      <DirectTripBuilder existing={{
        draft: apiTripToDraft(data.trip),
        days: data.itinerary.draft.days,
        places: data.places,
        version: data.itinerary.version,
        initialDay: activeDay + 1,
        onSaved: (itinerary) => {
          setData((current) => current ? { ...current, itinerary, interactions: undefined } : current);
          setEditPreview(undefined);
          setActiveDay(0);
          setNotice("직접 편집한 일정을 저장했어요.");
          void reloadHistory().catch(() => undefined);
          void getSavedPlaces(tripId).then(({ places }) => {
            setData((current) => current?.itinerary?.version === itinerary.version
              ? { ...current, places }
              : current);
          }).catch(() => undefined);
        },
        onClose: () => {
          setEditing(false);
          void getLatestItinerary(tripId).then((itinerary) => {
            setData((current) => current ? { ...current, itinerary } : current);
          }).catch(() => setActionError("최신 일정을 불러오지 못했어요. 여행 일정을 다시 열어 주세요."));
          void reloadHistory().catch(() => undefined);
          void refreshInteractions().catch(() => setInteractionError("일행 의견을 불러오지 못했어요."));
        },
      }} />
    );
  }

  if (photoPlace && data) {
    const savedPlace = data.places.find((item) => item.placeId === photoPlace.placeId);
    return <div className="course-page-shell"><div className="course-page">
      <PlaceDetail
        place={{
          id: savedPlace?.id ?? 0,
          name: savedPlace?.name ?? photoPlace.name,
          category: categoryLabels[savedPlace?.category ?? "OTHER"],
          detail: savedPlace?.note ?? savedPlace?.address ?? "",
          image: "",
          icon: "",
          latitude: savedPlace?.latitude ?? undefined,
          longitude: savedPlace?.longitude ?? undefined,
        }}
        onBack={() => setPhotoPlace(undefined)}
        onRemove={() => void removeSelectedPlace()}
        removePending={photoPending}
        removeError={photoError}
        server={{ tripId, itemId: photoPlace.itemId, placeId: photoPlace.placeId,
          interactions: data.interactions, loadError: interactionError, onRefresh: refreshInteractions,
          currentUserId: data.members.find((member) => member.me)?.userId,
          onChange: (update) => {
            interactionRequest.current += 1;
            setData((current) => current?.interactions
              ? { ...current, interactions: update(current.interactions) } : current);
          } }}
      />
    </div></div>;
  }

  return (
    <div className="course-page-shell">
      <main className="course-page">
        {data && summary && (
          <header className={`course-hero${imported ? " course-hero--imported" : ""}`}>
            {(imported ? importedPhoto : summary.coverImage) && <img className="course-hero__photo"
              src={imported ? importedPhoto : summary.coverImage} alt={`${summary.city} 여행`} />}
            <div className="course-hero__scrim" />
            <nav className="course-navigation" aria-label="코스 화면 탐색">
              <Link to={backPath} aria-label="뒤로 가기"><img src={backIcon} alt="" /></Link>
              <strong>{imported ? "내 여행" : shared ? "함께하는 여행" : manuallyCreated ? "내 일정" : "AI 여행 코스"}</strong>
              {shared && (
                <Link to={tripCommunityPath(origin, undefined, tripId, activeDay + 1)} aria-label="함께하는 여행 채팅">
                  <img src={chatIcon} alt="" />
                </Link>
              )}
              <Link to={tripSettingsPath(origin, undefined, tripId)} aria-label="코스 설정">
                <img src={settingsIcon} alt="" />
              </Link>
            </nav>
            <div className="course-hero__title">
              <span>{summary.city}</span>
              <h1>{summary.title}</h1>
              {(!imported || registrationComplete) && <p>{summary.dateLabel}</p>}
            </div>
            {!shared && (
              <Link className="course-hero__invite" to={`${tripSettingsPath(origin, undefined, tripId)}&panel=invite&day=${activeDay + 1}`}>
                <img src={inviteIcon} alt="" />친구 초대
              </Link>
            )}
            {shared && (
              <ul className="course-hero__members" aria-label={`함께하는 ${data.members.length}명`}>
                {data.members.slice(0, 3).map((member, index) => (
                  <li key={member.userId} title={member.name}>
                    <img src={member.profileImageUrl || memberFallbacks[index % memberFallbacks.length]} alt={member.name} />
                  </li>
                ))}
              </ul>
            )}
          </header>
        )}
        <div className="course-content">
          {!data && error && <div className="course-plan-error" role="alert"><p>{error}</p><Link to={backPath}>내 여행으로 돌아가기</Link></div>}
          {actionError && <p role="alert">{actionError}</p>}
          {notice && !imported && <p role="status">{notice}</p>}
          {inviteAccepted && summary && (
            <div className="course-toast course-toast--invite" role="status">
              <img src={checkIcon} alt="" />
              <p>{summary.title}에 참여했어요.</p>
              <button type="button" onClick={() => setInviteAccepted(false)}>닫기</button>
            </div>
          )}
          {!data && !error && <p className="course-live-region" role="status">여행 일정을 불러오고 있어요.</p>}
          {data && summary && imported && !registrationComplete && <RegisterBanner>
            <span><img src={calendarIcon} alt="" /></span>
            <strong>여행 날짜와 동행을 알려주세요</strong>
            <button type="button" onClick={() => setRegistrationOpen(true)}>등록하기</button>
          </RegisterBanner>}
          {data && summary && (
            <section className="course-section">
              {!imported && !manuallyCreated && <section className="ai-summary" aria-label="도틀로 AI 일정 구성 설명">
                <img src={aiAvatar} alt="도틀로 AI" />
                <div className="ai-summary__bubble">
                  <b>도틀로 AI의 일정 구성</b>
                  <p>{data.itinerary
                    ? `${summary.durationLabel ?? "여행 기간"} 동안 ${placeCount}곳을 방문하는 일정이에요.`
                    : "일정을 만들면 여행 동선을 확인할 수 있어요."}</p>
                </div>
              </section>}
              {data.itinerary ? (
                <>
                  {confirmation === null && (
                    <div>
                      <p role={confirming ? "status" : "alert"}>
                        {confirming ? "일정을 확정하고 있어요." : "일정은 저장됐지만 확정을 완료하지 못했어요."}
                      </p>
                      <button type="button" className="course-inline-edit" disabled={confirming} onClick={() => void retryConfirmation()}>
                        확정 다시 시도
                      </button>
                    </div>
                  )}
                  <h2>일정</h2>
                  <TripSummary
                    duration={summary.durationLabel ?? durationLabel(data.trip.startDate, data.trip.endDate)}
                    placeCount={placeCount}
                    companion={movementLabel}
                    companionLabel="이동 방법"
                  />
                  {excludedPlaceIds.length > 0 && (
                    <section aria-label="일정에 넣지 못한 장소">
                      <p role="status">{excludedPlaceIds.length}곳은 일정에 넣지 못했어요.</p>
                      <ul>
                        {data.places.filter((place) => place.placeId && excludedPlaceIds.includes(place.placeId)).map((place) => (
                          <li key={place.id}>{place.name}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <div className="course-tabs" aria-label="여행 일차">
                    {days.map((item, index) => (
                      <button
                        key={item.date}
                        type="button"
                        className={activeDay === index ? "is-active" : ""}
                        aria-pressed={activeDay === index}
                        onClick={() => setActiveDay(index)}
                      >
                        <strong>{index + 1}일차</strong>
                        <span>{dateLabel(item.date)}</span>
                      </button>
                    ))}
                  </div>
                  {day && (mapPlaces.length ? (
                    <>
                      <CourseRouteMap places={mapPlaces} city={summary.city} day={activeDay + 1} liveTiles />
                      <button type="button" className="course-inline-edit" onClick={() => setMapExpanded(true)}>지도 확대</button>
                    </>
                  ) : <p>이날 지도에 표시할 장소 좌표가 없어요.</p>)}
                  {mapExpanded && mapPlaces.length > 0 && (
                    <TripSheet title={`${activeDay + 1}일차 지도`} onClose={() => setMapExpanded(false)}>
                      <CourseRouteMap places={mapPlaces} city={summary.city} day={activeDay + 1} liveTiles expanded />
                    </TripSheet>
                  )}
                   <TripTimeline day={activeDay + 1} shared={shared} onEdit={() => setEditing(true)} onOpenPlace={(itemId, placeId, name) => setPhotoPlace({ itemId, placeId, name })} visits={(day?.visits ?? []).map((visit, index, visits) => {
                    const place = placesById.get(visit.placeId);
                    const next = visits[index + 1];
                    const mode = next?.travel.mode;
                    const nextPlace = next && placesById.get(next.placeId);
                    return {
                      id: visit.itemId,
                      name: place?.name,
                      photoPlaceId: visit.placeId,
                      address: place?.address,
                      timing: `${timeLabel(visit.start)} – ${timeLabel(visit.end)}`,
                      category: categoryLabels[place?.category ?? "OTHER"],
                      reactions: data.interactions?.items.find((item) => item.itemId === visit.itemId),
                      connection: next && mode && (
                        <div className="travel-mode-connection">
                          <button type="button" aria-haspopup="dialog" onClick={() => setTravelSelection({
                            date: day!.date,
                            targetItemId: next.itemId,
                            from: place?.name ?? "이전 장소",
                            to: nextPlace?.name ?? "다음 장소",
                            fromCoordinate: typeof place?.latitude === "number" && typeof place.longitude === "number"
                              ? { latitude: place.latitude, longitude: place.longitude } : undefined,
                            toCoordinate: typeof nextPlace?.latitude === "number" && typeof nextPlace.longitude === "number"
                              ? { latitude: nextPlace.latitude, longitude: nextPlace.longitude } : undefined,
                            departAt: travelDeparture(next.arrival, next.travel.minutes),
                            travel: next.travel,
                          })}>
                            {travelModeLabels[mode]} {next.travel.minutes}분 <img src={triangleIcon} alt="" />
                          </button>
                          <small>{(next.travel.distanceMeters / 1000).toFixed(1)}km</small>
                        </div>
                      ),
                    };
                  })} />
                  {travelSelection && (
                    <TravelModeSheet
                      {...travelSelection}
                      tripId={tripId}
                      current={travelSelection.travel.mode}
                      saving={travelSaving}
                      error={travelError}
                      onClose={() => { setTravelSelection(undefined); setTravelError(""); }}
                      onApply={(mode, all) => void applyTravelMode(mode, all)}
                    />
                  )}
                  <button type="button" className="add-place-button" disabled={!day || editPending} onClick={() => setShowAddPlace(true)}><img src={addIcon} alt="" /> 장소 추가</button>
                  {showAddPlace && (
                    <AddItineraryPlaceSheet
                      tripId={tripId}
                      day={activeDay + 1}
                      scheduledPlaceIds={scheduledPlaceIds}
                      onClose={() => setShowAddPlace(false)}
                      onSaved={({ itinerary, reason, placeName }, place, selectedDay) => {
                        setActiveDay(selectedDay - 1);
                        setData((current) => {
                          if (!current) return current;
                          const places = current.places.filter((item) => item.placeId !== place.placeId);
                          return { ...current, itinerary, places: [...places, place] };
                        });
                        setEditPreview(undefined);
                        setActionError("");
                        setNotice(reason || `${placeName}을(를) 일정에 추가했어요.`);
                        setShowAddPlace(false);
                        void reloadHistory().catch(() => undefined);
                        void refreshInteractions().catch(() => setInteractionError("일행 의견을 불러오지 못했어요."));
                      }}
                    />
                  )}
                  {data.history.length > 0 && (
                    <details className="course-history">
                      <summary>일정 변경 이력</summary>
                      <ul>
                        {data.history.map((item) => (
                          <li key={item.version}>
                            <span>v{item.version} · {sourceLabels[item.source]} · {new Date(item.createdAt).toLocaleString("ko-KR")}</span>
                            {data.itinerary && canRevertVersion(item.version, data.itinerary.version) && (
                              <button type="button" disabled={editPending} onClick={() => void revert(item.version)}>
                                이 버전으로 되돌리기
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <p>아직 저장된 일정이 없어요.</p>
                  <Link to={resumeTripPath(tripId)}>일정 만들기</Link>
                </>
              )}
            </section>
          )}
        </div>
        {data?.itinerary && (!manuallyCreated || shared) && (
          <div className="course-cta">
            {shared ? (
              <Link to={tripCommunityPath(origin, undefined, tripId, activeDay + 1)}>AI 수정 요청</Link>
            ) : (
              <button type="button" onClick={() => setShowAiEdit(true)}>AI 수정 요청</button>
            )}
          </div>
        )}
        {showAiEdit && !editPreview && <AiEditSheet
          value={editMessage}
          onChange={setEditMessage}
          onClose={() => setShowAiEdit(false)}
          onSubmit={() => void requestEdit()}
          pending={editPending}
          error={actionError}
        />}
        {showAiEdit && editPreview && <TripSheet title="수정안 확인" variant="course" closeDisabled={editPending}
          onClose={() => { setEditPreview(undefined); setShowAiEdit(false); }}
          footer={<button className="course-sheet__primary" type="button" disabled={editPending} onClick={() => void applyEdit()}>
            {editPending ? "일정에 적용하고 있어요" : "이 일정 적용하기"}
          </button>}>
          <div className="course-edit-preview">
            <p>{editPreview.reason}</p>
            <span>변경 {editPreview.diff.changes.length}건
              {editPreview.diff.reorderedDays.length > 0 && ` · 순서 변경 ${editPreview.diff.reorderedDays.length}일`}</span>
            {actionError && <p role="alert">{actionError}</p>}
            <button type="button" disabled={editPending} onClick={() => { setEditPreview(undefined); setShowAiEdit(false); }}>기존 일정 유지</button>
          </div>
        </TripSheet>}
        {registrationOpen && data && <ImportedTripRegistration
          trip={data.trip}
          onClose={() => setRegistrationOpen(false)}
          onSaved={(trip) => {
            setData((current) => current ? { ...current, trip } : current);
            setRegistrationComplete(true);
            setRegistrationOpen(false);
            setNotice("여행 정보를 저장했어요");
            try { localStorage.setItem(`dotlo:imported-trip-registered:${tripId}`, "true"); }
            catch { /* The server save still succeeds when browser storage is unavailable. */ }
          }}
        />}
        {imported && notice && <div className="course-toast" role="status"><img src={checkIcon} alt="" /><p>{notice}</p></div>}
        {confirmation && (
          <div className="course-toast" role="status">
            <img src={checkIcon} alt="" />
            <p>코스가 완성돼서 내 여행에 저장했어요</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ServerTripPlan;
