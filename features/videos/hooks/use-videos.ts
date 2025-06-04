import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Video } from '@/features/videos/types/video';

type UseVideosReturn = {
  videos: Video[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useVideos = (): UseVideosReturn => {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        setError('Please log in to view your videos');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('*, notes(count)')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setVideos(data);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos,
  };
}
