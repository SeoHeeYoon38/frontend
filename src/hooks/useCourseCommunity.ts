import { useMemo, useState } from "react";
import { communityPollOptions } from "../data/mocks/courseCommunityData";
import type { CommunityStage } from "../types/courseCommunity";

function useCourseCommunity() {
  const [stage, setStage] = useState<CommunityStage>("welcome");
  const [selectedPollId, setSelectedPollId] = useState("osaka-castle");
  const [selectedDay, setSelectedDay] = useState(2);
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);

  const pollOptions = useMemo(
    () =>
      communityPollOptions.map((option) => ({
        ...option,
        votes:
          option.id === selectedPollId && option.id !== "osaka-castle"
            ? option.votes + 1
            : option.votes,
      })),
    [selectedPollId],
  );

  const submitMessage = () => {
    const nextMessage = message.trim();
    if (!nextMessage) return;
    setSentMessages((current) => [...current, nextMessage]);
    setMessage("");
  };

  const showSummary = () => setStage("summary");
  const showPoll = () => setStage("poll");
  const openDayPicker = () => setStage("day-picker");
  const applyToCourse = () => setStage("applied");

  return {
    message,
    pollOptions,
    selectedDay,
    selectedPollId,
    sentMessages,
    stage,
    applyToCourse,
    openDayPicker,
    setMessage,
    setSelectedDay,
    setSelectedPollId,
    setStage,
    showPoll,
    showSummary,
    submitMessage,
  };
}

export default useCourseCommunity;
