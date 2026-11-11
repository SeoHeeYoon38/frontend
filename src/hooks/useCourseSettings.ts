import { useRef, useState } from "react";
import { demoInvitePath } from "../utils/navigation";
import type { CourseSettingsSheet } from "../types/courseSettings";

interface UseCourseSettingsOptions {
  initialSheet?: CourseSettingsSheet | null;
  initialTripName?: string;
  initialDraftName?: string;
  onSaveTripName?: (name: string) => boolean;
}

function useCourseSettings(options: UseCourseSettingsOptions = {}) {
  const initialTripName = options.initialTripName ?? "오사카 3박 4일";
  const [activeSheet, setActiveSheet] = useState<CourseSettingsSheet | null>(
    options.initialSheet ?? null,
  );
  const [tripName, setTripName] = useState(initialTripName);
  const [draftName, setDraftName] = useState(
    options.initialDraftName ?? initialTripName,
  );
  const [isEditingName, setIsEditingName] = useState(
    Boolean(options.initialDraftName),
  );
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const inviteLink = new URL(demoInvitePath, window.location.origin).href;
  const [notice, setNotice] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const openSheet = (sheet: CourseSettingsSheet) => {
    setActiveSheet(sheet);
    setCopied(false);
    setCopyError("");
    setNotice("");
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setIsEditingName(false);
    setDraftName(tripName);
  };

  const startEditingName = () => {
    setDraftName(tripName);
    setIsEditingName(true);
    window.setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const saveTripName = () => {
    const nextName = draftName.trim();
    if (nextName) {
      if (options.onSaveTripName && !options.onSaveTripName(nextName)) {
        setNotice("여행 이름을 저장하지 못했어요. 브라우저 저장소를 확인해 주세요.");
        return;
      }
      setTripName(nextName);
      setNotice("여행 이름을 수정했어요.");
    }
    setIsEditingName(false);
  };

  const saveAndCloseTripSheet = () => {
    const nextName = draftName.trim() || tripName;
    if (options.onSaveTripName && !options.onSaveTripName(nextName)) {
      setNotice("여행 정보를 저장하지 못했어요. 브라우저 저장소를 확인해 주세요.");
      return;
    }
    setTripName(nextName);
    setDraftName(nextName);
    setNotice("여행 정보를 저장했어요.");
    setIsEditingName(false);
    setActiveSheet(null);
  };

  const cancelNameEdit = () => {
    setDraftName(tripName);
    setIsEditingName(false);
  };

  const copyInviteLink = async () => {
    setCopied(false);
    setCopyError("");
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopyError("링크를 복사하지 못했어요. 미리보기를 열어 주소를 복사해 주세요.");
    }
  };

  return {
    activeSheet,
    tripName,
    draftName,
    isDirty: draftName.trim() !== tripName,
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
  };
}

export default useCourseSettings;
