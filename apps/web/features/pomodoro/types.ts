export type PomodoroPhase = "work" | "short-break" | "long-break";

export type PomodoroStatus = "idle" | "running" | "paused" | "completed";

export type IPomodoroSettings = {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // after how many work sessions
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  enableSounds: boolean;
};

export type IPomodoroState = {
  // Timer state
  isEnabled: boolean;
  currentPhase: PomodoroPhase;
  status: PomodoroStatus;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  startTime: number | null;
  timerInterval: NodeJS.Timeout | null;

  // Session tracking
  completedPomodoros: number;
  currentCycle: number;

  // UI state
  isSettingsOpen: boolean;
  focusModeEnabled: boolean;

  // Settings
  settings: IPomodoroSettings;
};

export type IPomodoroActions = {
  // Timer controls
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;

  // Settings
  updateSettings: (settings: Partial<IPomodoroSettings>) => void;
  toggleSettings: () => void;

  // Focus mode
  enablePomodoro: () => void;
  disablePomodoro: () => void;
  toggleFocusMode: () => void;

  // Reset everything (for page navigation)
  resetAll: () => void;
};
