import { useLocation, useNavigate } from "react-router";
import backIcon from "../assets/course-settings/back.svg";
import CourseSettingsMenu from "../components/course-settings/CourseSettingsMenu";
import CourseSettingsSheet from "../components/course-settings/CourseSettingsSheet";
import useCourseSettings from "../hooks/useCourseSettings";
import * as S from "../components/course-settings/CourseSettings.styled";
import {
  readPlanOrigin,
  settingsBackPath,
  tripCommunityPath,
} from "../utils/navigation";
import { readMockScenario } from "../utils/mockScenario";

function CourseSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const showUnsavedMock =
    readMockScenario(location.search) === "settings-unsaved-close";
  const {
    activeSheet,
    tripName,
    draftName,
    isDirty,
    isEditingName,
    copied,
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
    showUnsavedMock
      ? {
          initialSheet: "trip",
          initialDraftName: "오사카 우정 여행",
        }
      : {},
  );

  return (
    <S.PageShell>
      <S.Page>
        <S.Navigation aria-label="코스 설정 탐색">
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
          onOpenCommunity={() =>
            navigate(tripCommunityPath(readPlanOrigin(location.search)))
          }
          onNotice={setNotice}
        />
        <S.LiveRegion aria-live="polite">{notice}</S.LiveRegion>

        {activeSheet && (
          <CourseSettingsSheet
            activeSheet={activeSheet}
            tripName={tripName}
            draftName={draftName}
            isDirty={isDirty}
            isEditingName={isEditingName}
            copied={copied}
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
          />
        )}
      </S.Page>
    </S.PageShell>
  );
}

export default CourseSettingsPage;
