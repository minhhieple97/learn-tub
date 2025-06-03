'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UseVideoIdReturn } from '../types';

export const useVideoId = (youtubeId: string): UseVideoIdReturn => {
  const [dbVideoId, setDbVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchVideoId = useCallback(async () => {
    if (!youtubeId) return;

    setIsLoading(true);
    try {
      const { data: videos } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', youtubeId)
        .limit(1);

      if (videos && videos.length > 0) {
        setDbVideoId(videos[0].id);
      }
    } catch (error) {
      console.error('Error fetching video ID:', error);
    } finally {
      setIsLoading(false);
    }
  }, [youtubeId, supabase]);

  useEffect(() => {
    fetchVideoId();
  }, [fetchVideoId]);

  return { dbVideoId, isLoading };
};
