import { useRef, useState } from "react";
import { courseInviteLink } from "../data/mocks/courseSettingsData";
import type { CourseSettingsSheet } from "../types/courseSettings";

interface UseCourseSettingsOptions {
  initialSheet?: CourseSettingsSheet | null;
  initialTripName?: string;
  initialDraftName?: string;
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
  const [notice, setNotice] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const openSheet = (sheet: CourseSettingsSheet) => {
    setActiveSheet(sheet);
    setCopied(false);
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
      setTripName(nextName);
      setNotice("여행 이름을 수정했어요.");
    }
    setIsEditingName(false);
  };

  const saveAndCloseTripSheet = () => {
    const nextName = draftName.trim() || tripName;
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
    try {
      await navigator.clipboard.writeText(courseInviteLink);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = courseInviteLink;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
    setCopied(true);
  };

  return {
    activeSheet,
    tripName,
    draftName,
    isDirty: draftName.trim() !== tripName,
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
  };
}

export default useCourseSettings;
