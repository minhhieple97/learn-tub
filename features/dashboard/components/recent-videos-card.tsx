import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { RecentVideo } from '../types';

type RecentVideosCardProps = {
  videos: RecentVideo[];
};

export const RecentVideosCard = ({ videos }: RecentVideosCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Videos</CardTitle>
        <CardDescription>
          Videos you&apos;ve been watching recently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="flex items-center space-x-4">
              <div className="h-12 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <p className="font-medium">{video.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {video.timeAgo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
