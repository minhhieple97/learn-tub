import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/routes';
import { VideoPageData } from '../types/video-page';
import { tabValues } from '../search-params';

type VideoPageHeaderProps = {
  video: VideoPageData;
};

export const VideoPageHeader = ({ video }: VideoPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`${routes.learn}?tab=${tabValues.library}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{video.title}</h1>
        {video.courses && <p className="text-muted-foreground">Course: {video.courses.title}</p>}
      </div>
    </div>
  );
};
