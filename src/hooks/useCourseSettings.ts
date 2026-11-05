import { useEffect, useRef, useState } from "react";
import { courseInviteLink } from "../data/mocks/courseSettingsData";
import type { CourseSettingsSheet } from "../types/courseSettings";

function useCourseSettings() {
  const [activeSheet, setActiveSheet] = useState<CourseSettingsSheet | null>(
    null,
  );
  const [tripName, setTripName] = useState("도쿄 3박 4일");
  const [draftName, setDraftName] = useState(tripName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeSheet) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveSheet(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeSheet]);

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
  };
}

export default useCourseSettings;
