import { Clock } from 'lucide-react';
import type { TimestampDisplayProps } from '../types';
import { formatTimestamp } from '@/lib/utils';

export const TimestampDisplay = ({
  timestamp,
  onClick,
  clickable = false,
}: TimestampDisplayProps) => {
  return (
    <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      <span
        className={`text-sm font-medium text-slate-700 dark:text-slate-300 ${
          clickable 
            ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200' 
            : ''
        }`}
        onClick={() => clickable && onClick?.(timestamp)}
      >
        {formatTimestamp(timestamp)}
      </span>
    </div>
  );
};
