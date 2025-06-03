import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoPageData } from '../types/video-page';

type VideoInfoCardProps = {
  video: VideoPageData;
};

export function VideoInfoCard({ video }: VideoInfoCardProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Video Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{video.description || 'No description available.'}</p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Channel: {video.channel_name || 'Unknown'}</p>
          <p>
            Published:{' '}
            {video.published_at
              ? new Date(video.published_at).toLocaleDateString()
              : 'Publication date unknown'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
