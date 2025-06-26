import { useState } from "react";

type UseVideoPlayerReturn = {
  currentTimestamp: number;
  targetSeekTime: number | undefined;
  handleTimeUpdate: (time: number) => void;
  handleNoteTimestampClick: (time: number) => void;
};

export const useVideoPlayer = (): UseVideoPlayerReturn => {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [targetSeekTime, setTargetSeekTime] = useState<number | undefined>(
    undefined,
  );

  const handleTimeUpdate = (time: number) => {
    setCurrentTimestamp(Math.floor(time));
  };

  const handleNoteTimestampClick = (time: number) => {
    setTargetSeekTime(time);
    // Optional: Reset targetSeekTime after a delay or via acknowledgment from YouTubePlayer
    // to allow re-clicking the same timestamp. For now, this will seek once per distinct time.
  };

  return {
    currentTimestamp,
    targetSeekTime,
    handleTimeUpdate,
    handleNoteTimestampClick,
  };
};
