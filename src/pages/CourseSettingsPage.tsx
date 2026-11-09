import { useLocation, useNavigate } from "react-router";
import statusIcons from "../assets/course-completion/status-icons.svg";
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

function CourseSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeSheet,
    tripName,
    draftName,
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
    cancelNameEdit,
    copyInviteLink,
  } = useCourseSettings();

  return (
    <S.PageShell>
      <S.Page>
        <S.StatusBar aria-hidden="true">
          <span>9:41</span>
          <img src={statusIcons} alt="" />
        </S.StatusBar>

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
            isEditingName={isEditingName}
            copied={copied}
            nameInputRef={nameInputRef}
            onDraftNameChange={setDraftName}
            onStartEditingName={startEditingName}
            onSaveTripName={saveTripName}
            onCancelNameEdit={cancelNameEdit}
            onCopyInviteLink={copyInviteLink}
            onNotice={setNotice}
            onClose={closeSheet}
          />
        )}
      </S.Page>
    </S.PageShell>
  );
}

export default CourseSettingsPage;
