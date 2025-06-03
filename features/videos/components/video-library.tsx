import { VideoLibraryError } from './video-library-error';
import { VideoLibraryEmpty } from './video-library-empty';
import { VideoGrid } from './video-grid';
import { Video } from '@/features/videos/types/video';

type VideoLibraryProps = {
  videos: Video[];
  error: string | null;
};

export function VideoLibrary({ videos, error }: VideoLibraryProps) {
  if (error) {
    return <VideoLibraryError error={error} />;
  }

  if (!videos || videos.length === 0) {
    return <VideoLibraryEmpty />;
  }

  return (
    <div className="space-y-10">
      <VideoGrid videos={videos} />
    </div>
  );
}
