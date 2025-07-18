import { Clock } from "lucide-react";
import type { ITimestampDisplayProps } from "../types";
import { formatTimestamp } from "@/lib/utils";

export const TimestampDisplay = ({
  timestamp,
  onClick,
  clickable = false,
}: ITimestampDisplayProps) => {
  return (
    <div
      className="flex items-center space-x-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
      onClick={() => clickable && onClick?.(timestamp ?? 0)}
    >
      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      <span
        className={`text-sm font-medium text-slate-700 dark:text-slate-300 ${
          clickable
            ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            : ""
        }`}
      >
        {formatTimestamp(timestamp ?? 0)}
      </span>
    </div>
  );
};
