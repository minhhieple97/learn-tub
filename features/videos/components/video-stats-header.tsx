import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

type VideoStatsHeaderProps = {
  videoCount: number;
};

export const VideoStatsHeader = ({ videoCount }: VideoStatsHeaderProps) => {
  return (
    <div className="ml-auto">
      <Badge
        variant="outline"
        className="px-6 py-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/60 dark:to-indigo-950/60 border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-bold shadow-lg text-lg backdrop-blur-sm"
      >
        <Users className="h-4 w-4 mr-2" />
        {videoCount} {videoCount === 1 ? 'video' : 'videos'}
      </Badge>
    </div>
  );
};
