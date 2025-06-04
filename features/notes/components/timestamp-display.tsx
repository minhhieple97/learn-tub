import { Clock } from 'lucide-react';
import type { TimestampDisplayProps } from '../types';
import { formatTimestamp } from '@/lib/utils';

export const TimestampDisplay = ({
  timestamp,
  onClick,
  clickable = false,
}: TimestampDisplayProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Clock className="h-4 w-4" />
      <span
        className={`text-sm font-medium ${clickable ? 'cursor-pointer hover:text-blue-600' : ''}`}
        onClick={() => clickable && onClick?.(timestamp)}
      >
        {formatTimestamp(timestamp)}
      </span>
    </div>
  );
};
