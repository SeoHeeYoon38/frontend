import { useLocation, useNavigate } from "react-router";
import backIcon from "../assets/course-settings/back.svg";
import shareIcon from "../assets/course-settings/link.svg";
import memberIcon from "../assets/course-settings-details/menu-members.svg";
import inviteIcon from "../assets/course-settings-details/menu-invite.svg";
import inviteBadgeIcon from "../assets/course-settings-details/member-add.svg";
import pinIcon from "../assets/course-settings-details/menu-pin.svg";
import cameraIcon from "../assets/course-settings-details/menu-camera.svg";
import daysIcon from "../assets/course-settings-details/menu-days.svg";
import originIcon from "../assets/course-settings-details/menu-origin.svg";
import copyIcon from "../assets/course-settings-details/menu-copy.svg";
import deleteIcon from "../assets/course-settings-details/menu-delete.svg";
import notificationIcon from "../assets/course-settings-details/menu-bell.svg";
import chevronIcon from "../assets/figma/settings-chevron.svg";
import { courseTitle, isServerTripId } from "../api/adapters";
import { ApiError } from "../api/client";
import { getCourses } from "../api/courses";
import { getLatestItinerary, saveItinerary } from "../api/itineraries";
import { getTripMembers, leaveTrip } from "../api/members";
import { addSavedPlace, getSavedPlaces } from "../api/places";
import { createTrip, deleteTrip, getTrip, updateTrip } from "../api/trips";
import type { CourseSummaryResponse, ItineraryVersionView, MemberResponse, TripResponse } from "../api/types";
import { apiTripToSummary, companionLabels } from "../utils/serverTrip";
import { addDays, hasRegisteredImportedTrip, markImportedTripRegistered } from "../utils/importedTrip";
import { travelModeLabels } from "../utils/trip";
import { courseImportUncertain } from "../utils/courseImport";
import TripInformationSheet from "../components/course-completion/TripInformationSheet";
import CourseSettingsMenu from "../components/course-settings/CourseSettingsMenu";
import ServerInviteSheet from "../components/course-settings/ServerInviteSheet";
import CourseSettingsSheet from "../components/course-settings/CourseSettingsSheet";
import { CourseSettingsConfirmDialog, CourseSettingsDetailView } from "../components/course-settings/CourseSettingsDetails";
import useCourseSettings from "../hooks/useCourseSettings";
import { useEffect, useRef, useState } from "react";
import * as S from "../components/course-settings/CourseSettings.styled";
import { serverTripPlanPath, settingsBackPath, travelerCoursePath } from "../utils/navigation";
import { readMockScenario } from "../utils/mockScenario";
import { routes } from "../config/routes";
import type { CourseSettingsDialog, CourseSettingsView } from "../types/courseSettings";
import { readMockTrip, saveMockTrip } from "../data/mocks/mockTripService";

function CourseSettingsPage() {
  const { search } = useLocation();
  const tripId = new URLSearchParams(search).get("returnTripId");
  if (tripId && isServerTripId(tripId)) {
    return <ServerCourseSettings key={tripId} tripId={Number(tripId)} />;
  }
  return <DemoCourseSettings />;
}

function ServerCourseSettings({ tripId }: { tripId: number }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [trip, setTrip] = useState<TripResponse>();
  const [members, setMembers] = useState<MemberResponse[]>();
  const [loadError, setLoadError] = useState("");
  const [memberError, setMemberError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [memberAttempt, setMemberAttempt] = useState(0);
  const [showMembers, setShowMembers] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInvite, setShowInvite] = useState(() => new URLSearchParams(search).get("panel") === "invite");
  const [showShare, setShowShare] = useState(false);
  const [dialog, setDialog] = useState<"delete" | "leave" | "clone">();
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCover, setSelectedCover] = useState(0);
  const [tripDays, setTripDays] = useState(1);
  const [itinerary, setItinerary] = useState<ItineraryVersionView>();
  const [originalCourse, setOriginalCourse] = useState<CourseSummaryResponse>();
  const [registrationComplete, setRegistrationComplete] = useState(() => hasRegisteredImportedTrip(tripId));
  const [cloneUncertain, setCloneUncertain] = useState(false);
  const actionPending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void getTrip(tripId, signal).then(
      (response) => {
        if (!signal.aborted) setTrip(response);
      },
      () => {
        if (!signal.aborted) setLoadError("여행 설정을 불러오지 못했어요. 다시 시도해 주세요.");
      },
    );
    return () => controller.abort();
  }, [tripId, attempt]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void getTripMembers(tripId, signal).then(
      (response) => {
        if (!signal.aborted) setMembers(response);
      },
      () => {
        if (!signal.aborted) setMemberError(true);
      },
    );
    return () => controller.abort();
  }, [tripId, memberAttempt]);

  const currentMember = members?.find((member) => member.me);
  const owner = currentMember?.role === "OWNER";
  const summary = trip && apiTripToSummary(trip);
  const city = trip?.city;
  const imported = itinerary?.source === "COURSE_ADD" || Boolean(originalCourse);
  const needsRegistration = imported && !registrationComplete && trip?.companion === "ALONE";
  const movement = new Set(itinerary?.validation.days.flatMap((day) => day.visits.map((visit) => visit.travel.mode)));
  const movementLabel = [...movement].map((value) => travelModeLabels[value]).join(" · ");
  const {
    activeSheet,
    tripName,
    draftName,
    isDirty,
    isEditingName,
    copied,
    copyError,
    inviteLink,
    notice,
    nameInputRef,
    setDraftName,
    setNotice,
    openSheet,
    closeSheet,
    startEditingName,
    saveTripName,
    saveAndCloseTripSheet,
    cancelNameEdit,
    copyInviteLink,
  } = useCourseSettings({ initialTripName: summary?.title ?? "여행" });

  useEffect(() => {
    if (!city) return;
    const controller = new AbortController();
    const { signal } = controller;
    void getLatestItinerary(tripId, signal).then((response) => {
      if (!signal.aborted) setItinerary(response);
    }).catch(() => {});
    void getSavedPlaces(tripId, signal).then(async ({ places }) => {
      const names = new Set(places.filter((place) => place.source === "POPULAR").flatMap((place) => place.listNames));
      if (!names.size || signal.aborted) return;
      const matches = (await getCourses(city, signal)).filter((course) => names.has(course.title));
      if (!signal.aborted && matches.length === 1) setOriginalCourse(matches[0]);
    }).catch(() => {});
    return () => controller.abort();
  }, [tripId, city]);

  useEffect(() => {
    if (!trip) return;
    const start = new Date(`${trip.startDate}T00:00:00`);
    const end = new Date(`${trip.endDate}T00:00:00`);
    setTripDays(Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1));
  }, [trip]);
  const leaveMessage = owner
    ? members?.length === 1
      ? "혼자 참여한 여행이라 나가면 여행이 삭제돼요."
      : "먼저 참여한 멤버에게 방장이 넘어가고, 나는 여행에서 나가요."
    : "나간 뒤에는 여행을 볼 수 없어요. 다시 참여하려면 초대 링크가 필요해요.";

  function openDialog(action: "delete" | "leave" | "clone") {
    setActionError("");
    setDialog(action);
  }

  async function confirmAction() {
    if (!dialog || !currentMember || (dialog === "delete" && !owner) || actionPending.current) return;
    actionPending.current = true;
    setPending(true);
    setActionError("");
    let copyId: number | undefined;
    try {
      if (dialog === "clone") {
        if (!trip || !itinerary || cloneUncertain) return;
        const copy = await createTrip({
          city: trip.city, startDate: trip.startDate, endDate: trip.endDate,
          companion: trip.companion, companionCount: trip.companionCount,
        });
        if (!Number.isSafeInteger(copy.id) || copy.id <= 0) {
          throw new ApiError(502, "IMPORT_RESULT_UNKNOWN", "새 여행 주소를 확인하지 못했어요.");
        }
        copyId = copy.id;
        const days = itinerary.draft.days.map(({ date, visits }) => ({
          date,
          visits: visits.map(({ placeId, stayMinutes, fixedStart, travelMode }) => ({ placeId, stayMinutes, fixedStart, travelMode })),
        }));
        const placeIds = new Set(days.flatMap((day) => day.visits.map((visit) => visit.placeId)));
        for (const placeId of placeIds) await addSavedPlace(copyId, placeId);
        await saveItinerary(copyId, days, null);
        navigate(serverTripPlanPath("my-trips", String(copyId)), { replace: true });
        return;
      }
      let tripDeleted = dialog === "delete";
      if (tripDeleted) await deleteTrip(tripId);
      else tripDeleted = (await leaveTrip(tripId)).tripDeleted;
      navigate(`${routes.myTrips}?toast=${tripDeleted ? "trip-deleted" : "trip-left"}`, { replace: true });
    } catch (reason) {
      if (copyId !== undefined) {
        try {
          await deleteTrip(copyId);
        } catch {
          setCloneUncertain(true);
          setActionError("복제한 여행을 정리하지 못했어요. 마이트립에서 확인해 주세요.");
          return;
        }
      } else if (dialog === "clone" && courseImportUncertain(reason)) {
        setCloneUncertain(true);
        setActionError("복제 여부를 확인하지 못했어요. 마이트립에서 새 여행을 확인해 주세요.");
        return;
      }
      setActionError(reason instanceof Error ? reason.message : "요청을 처리하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setPending(false);
      actionPending.current = false;
    }
  }

  return (
    <S.PageShell>
      <S.Page>
        {(showMembers || showNotifications) && (showNotifications || members) ? (
          <CourseSettingsDetailView
            view={showNotifications ? "notifications" : "members"}
            members={members}
            onBack={() => {
              setShowMembers(false);
              setShowNotifications(false);
            }}
            onInvite={() => setShowInvite(true)}
          />
        ) : (
          <>
            <S.Navigation aria-label="코스 설정 탐색">
              <button type="button" aria-label="이전 화면으로 이동" onClick={() => navigate(settingsBackPath(search))}>
                <img src={backIcon} alt="" />
              </button>
              <h1>코스 설정</h1>
              <span aria-hidden="true" />
            </S.Navigation>
            <S.SettingsContent>
              {loadError ? (
                <>
                  <p role="alert">{loadError}</p>
                  <button type="button" onClick={() => {
                    setLoadError("");
                    setAttempt((value) => value + 1);
                  }}>다시 시도</button>
                </>
              ) : !trip || !summary ? <p role="status">여행 설정을 불러오고 있어요.</p> : (
                <>
                  <S.SettingsSection aria-label="여행 정보">
                    <h2>여행 정보</h2>
                    <S.MenuList>
                      <S.MenuButton type="button" onClick={() => openSheet("trip")}>
                        <img src={pinIcon} alt="" />
                        <span>여행 정보 수정</span>
                        <S.MenuMeta>{needsRegistration ? "동행 미등록" : `${summary.dateLabel}, ${companionLabels[trip.companion]} ${trip.companionCount}명`}</S.MenuMeta>
                        <S.Chevron src={chevronIcon} alt="" />
                      </S.MenuButton>
                      <S.MenuButton type="button" onClick={() => openSheet("cover")}>
                        <img src={cameraIcon} alt="" />
                        <span>대표 이미지 변경</span>
                        <S.Chevron src={chevronIcon} alt="" />
                      </S.MenuButton>
                    </S.MenuList>
                  </S.SettingsSection>
                  <S.Divider />
                  <S.SettingsSection aria-label="함께하기">
                    <h2>함께하기</h2>
                    <S.MenuList>
                      <S.MenuButton type="button" onClick={() => setShowInvite(true)}>
                        <S.IconStack>
                          <img src={inviteIcon} alt="" />
                          <img src={inviteBadgeIcon} alt="" />
                        </S.IconStack>
                        <span>친구 초대</span>
                        <S.Chevron src={chevronIcon} alt="" />
                      </S.MenuButton>
                      <S.MenuButton type="button" disabled={!members} onClick={() => setShowMembers(true)}>
                        <img src={memberIcon} alt="" />
                        <span>멤버 관리</span>
                        {members && <S.MenuMeta>{members.length}명</S.MenuMeta>}
                        <S.Chevron src={chevronIcon} alt="" />
                      </S.MenuButton>
                      {trip.status === "CONFIRMED" && (
                        <S.MenuButton type="button" onClick={() => setShowShare(true)}>
                          <img src={shareIcon} alt="" />
                          <span>일정 공유</span>
                          <S.Chevron src={chevronIcon} alt="" />
                        </S.MenuButton>
                      )}
                    </S.MenuList>
                    {memberError ? (
                      <>
                        <p role="alert">여행 구성원을 불러오지 못했어요.</p>
                        <button type="button" onClick={() => {
                          setMemberError(false);
                          setMemberAttempt((value) => value + 1);
                        }}>구성원 다시 불러오기</button>
                      </>
                    ) : !members && <p role="status">여행 구성원을 불러오고 있어요.</p>}
                  </S.SettingsSection>
                  <S.Divider />
                  <S.SettingsSection aria-label="일정 관리">
                    <h2>일정 관리</h2>
                    <S.MenuList>
                      <S.MenuButton type="button" onClick={() => openSheet("duration")}>
                        <img src={daysIcon} alt="" />
                        <span>여행 기간 변경</span>
                        <S.MenuMeta>{summary.durationLabel ?? "날짜 미정"}</S.MenuMeta>
                        <S.Chevron src={chevronIcon} alt="" />
                      </S.MenuButton>
                      {originalCourse && (
                        <S.MenuButton type="button" onClick={() => navigate(travelerCoursePath(String(originalCourse.id)), {
                          state: { courseSettingsSearch: search },
                        })}>
                          <img src={originIcon} alt="" />
                          <span>원본 코스 보기</span>
                          <S.MenuMeta>{originalCourse.author.name || courseTitle(originalCourse.title)}</S.MenuMeta>
                          <S.Chevron src={chevronIcon} alt="" />
                        </S.MenuButton>
                      )}
                      {itinerary && currentMember && (
                        <S.MenuButton type="button" disabled={cloneUncertain} onClick={() => openDialog("clone")}>
                          <img src={copyIcon} alt="" />
                          <span>코스 복제</span>
                          <S.Chevron src={chevronIcon} alt="" />
                        </S.MenuButton>
                      )}
                    </S.MenuList>
                  </S.SettingsSection>
                  {currentMember && <>
                    <S.Divider />
                    <S.SettingsSection aria-label="기타">
                      <h2>기타</h2>
                      <S.MenuList>
                        <S.MenuButton type="button" onClick={() => setShowNotifications(true)}>
                          <img src={notificationIcon} alt="" />
                          <span>알림 설정</span>
                          <S.Chevron src={chevronIcon} alt="" />
                        </S.MenuButton>
                        {!owner && <S.MenuButton type="button" $danger onClick={() => openDialog("leave")}>
                          <S.LeaveIcon aria-hidden="true" />
                          <span>여행 나가기</span>
                        </S.MenuButton>}
                        {owner && <S.MenuButton type="button" $danger onClick={() => openDialog("delete")}>
                          <img src={deleteIcon} alt="" />
                          <span>코스 삭제</span>
                        </S.MenuButton>}
                      </S.MenuList>
                    </S.SettingsSection>
                  </>}
                </>
              )}
            </S.SettingsContent>
          </>
        )}
        {activeSheet === "trip" && trip && summary && (
          <TripInformationSheet trip={trip} title={summary.title} mode={needsRegistration ? "register" : "edit"}
            movementLabel={movementLabel} onClose={closeSheet} onSaved={(updated) => {
              setTrip(updated);
              if (imported) {
                markImportedTripRegistered(tripId);
                setRegistrationComplete(true);
              }
              setNotice("여행 정보를 저장했어요");
              closeSheet();
            }} />
        )}
        {activeSheet && activeSheet !== "trip" && trip && summary && (
          <CourseSettingsSheet
            activeSheet={activeSheet}
            tripName={tripName}
            draftName={draftName}
            isDirty={isDirty}
            isEditingName={isEditingName}
            copied={copied}
            copyError={copyError}
            inviteLink={inviteLink}
            nameInputRef={nameInputRef}
            onDraftNameChange={setDraftName}
            onStartEditingName={startEditingName}
            onSaveTripName={saveTripName}
            onSaveAndClose={saveAndCloseTripSheet}
            onDiscardAndClose={closeSheet}
            onCancelNameEdit={cancelNameEdit}
            onCopyInviteLink={copyInviteLink}
            onNotice={setNotice}
            onClose={closeSheet}
            selectedCover={selectedCover}
            tripDays={tripDays}
            onCoverChange={setSelectedCover}
            onSaveCover={() => {
              setNotice("대표 이미지를 변경했어요.");
              closeSheet();
            }}
            onTripDaysChange={setTripDays}
            onSaveDuration={() => {
              if (pending) return;
              setPending(true);
              void updateTrip(tripId, { endDate: addDays(trip.startDate, tripDays - 1) }).then(
                (response) => {
                  setTrip(response);
                  setNotice(`여행 기간을 ${tripDays - 1}박 ${tripDays}일로 변경했어요.`);
                  closeSheet();
                  setPending(false);
                },
                () => {
                  setNotice("여행 기간을 변경하지 못했어요. 다시 시도해 주세요.");
                  setPending(false);
                },
              );
            }}
            tripCity={summary.city}
            tripDateLabel={`${summary.dateLabel} · ${summary.durationLabel ?? "날짜 미정"}`}
            tripCompanionLabel={`${trip.companionCount}명`}
          />
        )}
        <S.LiveRegion aria-live="polite">{notice}</S.LiveRegion>
        {showInvite && <ServerInviteSheet tripId={tripId} onClose={() => setShowInvite(false)} />}
        {showShare && <ServerInviteSheet tripId={tripId} onClose={() => setShowShare(false)} publicShare />}
        {dialog && <CourseSettingsConfirmDialog
          dialog={dialog}
          tripName={summary?.title}
          leaveMessage={leaveMessage}
          pending={pending}
          error={actionError}
          onCancel={() => setDialog(undefined)}
          onConfirm={() => void confirmAction()}
        />}
      </S.Page>
    </S.PageShell>
  );
}

function DemoCourseSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripId = new URLSearchParams(location.search).get("course") ?? "osaka";
  const trip = readMockTrip(tripId);
  const showUnsavedMock =
    readMockScenario(location.search) === "settings-unsaved-close";
  const openInviteInitially = new URLSearchParams(location.search).get("panel") === "invite";
  const [view, setView] = useState<CourseSettingsView>("menu");
  const [dialog, setDialog] = useState<CourseSettingsDialog>(null);
  const [selectedCover, setSelectedCover] = useState(0);
  const [tripDays, setTripDays] = useState(3);
  const {
    activeSheet,
    tripName,
    draftName,
    isDirty,
    isEditingName,
    copied,
    copyError,
    inviteLink,
    notice,
    nameInputRef,
    setDraftName,
    setNotice,
    openSheet,
    closeSheet,
    startEditingName,
    saveTripName,
    saveAndCloseTripSheet,
    cancelNameEdit,
    copyInviteLink,
  } = useCourseSettings(
    { initialTripName: trip?.title, onSaveTripName: (title) => {
      const current = readMockTrip(tripId);
      return current ? saveMockTrip({ ...current, title }) : false;
    }, ...(openInviteInitially ? { initialSheet: "invite" as const } : showUnsavedMock
      ? {
          initialSheet: "trip",
          initialDraftName: "오사카 우정 여행",
        }
      : {}) },
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  const openInviteFromMembers = () => {
    setView("menu");
    openSheet("invite");
  };

  const confirmAction = () => {
    if (dialog === "delete") {
      setDialog(null);
      navigate(routes.myTrips, { state: { courseDeleted: true } });
      return;
    }
    setDialog(null);
    setNotice("코스를 내 여행에 복제했어요.");
  };

  return (
    <S.PageShell>
      <S.Page>
        {view === "menu" ? <><S.Navigation aria-label="코스 설정 탐색">
          <button
            type="button"
            aria-label="이전 화면으로 이동"
            onClick={() => navigate(settingsBackPath(location.search))}
          >
            <img src={backIcon} alt="" />
          </button>
          <h1>코스 설정</h1>
          <span aria-hidden="true" />
        </S.Navigation>

        <CourseSettingsMenu
          onOpenSheet={openSheet}
          onOpenMembers={() => setView("members")}
          onOpenNotifications={() => setView("notifications")}
          onOpenClone={() => setDialog("clone")}
          onOpenDelete={() => setDialog("delete")}
          onOpenOrigin={() => navigate("/courses/kyoto-walk")}
        />
        <S.LiveRegion aria-live="polite">{notice}</S.LiveRegion>
        </> : (
          <CourseSettingsDetailView view={view} onBack={() => setView("menu")} onInvite={openInviteFromMembers} />
        )}

        {activeSheet && (
          <CourseSettingsSheet
            activeSheet={activeSheet}
            tripName={tripName}
            draftName={draftName}
            isDirty={isDirty}
            isEditingName={isEditingName}
            copied={copied}
            copyError={copyError}
            inviteLink={inviteLink}
            nameInputRef={nameInputRef}
            onDraftNameChange={setDraftName}
            onStartEditingName={startEditingName}
            onSaveTripName={saveTripName}
            onSaveAndClose={saveAndCloseTripSheet}
            onDiscardAndClose={closeSheet}
            onCancelNameEdit={cancelNameEdit}
            onCopyInviteLink={copyInviteLink}
            onNotice={setNotice}
            onClose={closeSheet}
            initialCloseConfirm={showUnsavedMock}
            selectedCover={selectedCover}
            tripDays={tripDays}
            onCoverChange={setSelectedCover}
            onSaveCover={() => {
              setNotice("대표 이미지를 변경했어요.");
              closeSheet();
            }}
            onTripDaysChange={setTripDays}
            onSaveDuration={() => {
              setNotice(`여행 기간을 ${tripDays - 1}박 ${tripDays}일로 변경했어요.`);
              closeSheet();
            }}
          />
        )}
        {dialog && <CourseSettingsConfirmDialog dialog={dialog} onCancel={() => setDialog(null)} onConfirm={confirmAction} />}
      </S.Page>
    </S.PageShell>
  );
}

export default CourseSettingsPage;
