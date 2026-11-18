import { useEffect, useMemo, useRef, useState } from "react";
import { communityPollOptions } from "../data/mocks/courseCommunityData";
import type { CommunityStage } from "../types/courseCommunity";
import { requestedChatAction, type ChatAction } from "../utils/chatActions";

const actionStages: Record<ChatAction, CommunityStage> = {
  coordinate: "summary", recommend: "recommendation", poll: "poll",
};

function useCourseCommunity() {
  const [stage, setStage] = useState<CommunityStage>("welcome");
  const [selectedPollId, setSelectedPollId] = useState("osaka-castle");
  const [selectedDay, setSelectedDay] = useState(2);
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [pendingAi, setPendingAi] = useState<ChatAction>();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pollOptions = useMemo(
    () =>
      communityPollOptions.map((option) => ({
        ...option,
        votes: option.id === selectedPollId &&
          (stage === "applied" || option.id !== "osaka-castle")
          ? option.votes + 1
          : option.votes,
      })),
    [selectedPollId, stage],
  );

  const submitMessage = (value = message, action = requestedChatAction(value.trim())) => {
    const nextMessage = value.trim();
    if (!nextMessage || timer.current !== undefined) return;
    setSentMessages((current) => [...current, nextMessage]);
    if (value === message) setMessage("");
    if (action) {
      setPendingAi(action);
      timer.current = window.setTimeout(() => {
        setStage(actionStages[action]);
        setPendingAi(undefined);
        timer.current = undefined;
      }, 650);
    }
  };

  const openDayPicker = () => setStage("day-picker");

  return {
    message,
    pollOptions,
    selectedDay,
    selectedPollId,
    sentMessages,
    pendingAi,
    stage,
    openDayPicker,
    setMessage,
    setSelectedDay,
    setSelectedPollId,
    setStage,
    submitMessage,
  };
}

export default useCourseCommunity;
