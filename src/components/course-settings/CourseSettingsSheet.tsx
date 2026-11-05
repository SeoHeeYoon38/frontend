import type { RefObject } from "react";
import closeIcon from "../../assets/course-settings/close.svg";
import editIcon from "../../assets/course-settings/edit.svg";
import linkIcon from "../../assets/course-settings/link.svg";
import successCheck from "../../assets/course-settings/success-check.svg";
import successRing from "../../assets/course-settings/success-ring.svg";
import {
  courseInviteLink,
  courseMembers,
  courseShareTargets,
} from "../../data/mocks/courseSettingsData";
import type { CourseSettingsSheet as SheetName } from "../../types/courseSettings";
import * as S from "./CourseSettings.styled";

interface CourseSettingsSheetProps {
  activeSheet: SheetName;
  tripName: string;
  draftName: string;
  isEditingName: boolean;
  copied: boolean;
  nameInputRef: RefObject<HTMLInputElement | null>;
  onDraftNameChange: (value: string) => void;
  onStartEditingName: () => void;
  onSaveTripName: () => void;
  onCancelNameEdit: () => void;
  onCopyInviteLink: () => void;
  onNotice: (message: string) => void;
  onClose: () => void;
}

function CourseSettingsSheet({
  activeSheet,
  tripName,
  draftName,
  isEditingName,
  copied,
  nameInputRef,
  onDraftNameChange,
  onStartEditingName,
  onSaveTripName,
  onCancelNameEdit,
  onCopyInviteLink,
  onNotice,
  onClose,
}: CourseSettingsSheetProps) {
  return (
    <S.SheetLayer
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <S.BottomSheet
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${activeSheet}-sheet-title`}
      >
        <S.Grabber />
        <S.SheetHeader>
          <h2 id={`${activeSheet}-sheet-title`}>
            {activeSheet === "trip" ? "내 여행 수정" : "친구 초대"}
          </h2>
          <button type="button" aria-label="닫기" onClick={onClose}>
            <img src={closeIcon} alt="" />
          </button>
        </S.SheetHeader>

        {activeSheet === "trip" ? (
          <S.TripDetails>
            <S.DetailRow>
              <dt>여행 이름</dt>
              <dd>
                {isEditingName ? (
                  <S.NameEditor
                    ref={nameInputRef}
                    value={draftName}
                    aria-label="여행 이름"
                    onChange={(event) => onDraftNameChange(event.target.value)}
                    onBlur={onSaveTripName}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onSaveTripName();
                      if (event.key === "Escape") onCancelNameEdit();
                    }}
                  />
                ) : (
                  <span>{tripName}</span>
                )}
                <button
                  type="button"
                  aria-label="여행 이름 수정"
                  onClick={onStartEditingName}
                >
                  <img src={editIcon} alt="" />
                </button>
              </dd>
            </S.DetailRow>
            <S.DetailRow>
              <dt>여행지</dt>
              <dd>일본 · 도쿄</dd>
            </S.DetailRow>
            <S.DetailRow>
              <dt>날짜</dt>
              <dd>2026.05.18 – 05.21 · 3박 4일</dd>
            </S.DetailRow>
            <S.DetailRow>
              <dt>인원</dt>
              <dd>3명</dd>
            </S.DetailRow>
            <S.DetailRow>
              <dt>이동 수단</dt>
              <dd>대중교통</dd>
            </S.DetailRow>
          </S.TripDetails>
        ) : (
          <S.InviteContent>
            <S.LinkBox>
              <img src={linkIcon} alt="" />
              <span>{courseInviteLink.replace("https://", "")}</span>
              <button type="button" onClick={onCopyInviteLink}>
                링크 복사
              </button>
            </S.LinkBox>
            <S.CopyMessage
              $visible={copied}
              aria-hidden={!copied}
              aria-live="polite"
            >
              <S.SuccessIcon aria-hidden="true">
                <img src={successRing} alt="" />
                <img src={successCheck} alt="" />
              </S.SuccessIcon>
              링크를 복사했어요
            </S.CopyMessage>

            <S.MemberSection>
              <h3>함께하는 친구</h3>
              <S.MemberList>
                {courseMembers.map((member) => (
                  <li key={member.name}>
                    <img src={member.avatar} alt="" />
                    <strong>
                      {member.name} <small>{member.suffix}</small>
                    </strong>
                    <span>{member.role}</span>
                  </li>
                ))}
              </S.MemberList>
            </S.MemberSection>

            <S.ShareSection>
              <h3>다른 앱으로 공유</h3>
              <S.ShareList>
                {courseShareTargets.map((target) => (
                  <li key={target.label}>
                    <button
                      type="button"
                      onClick={() =>
                        onNotice(
                          `${target.label} 공유는 모바일 앱에서 사용할 수 있어요.`,
                        )
                      }
                    >
                      <img src={target.image} alt="" />
                      <span>{target.label}</span>
                    </button>
                  </li>
                ))}
              </S.ShareList>
            </S.ShareSection>
          </S.InviteContent>
        )}
      </S.BottomSheet>
    </S.SheetLayer>
  );
}

export default CourseSettingsSheet;
