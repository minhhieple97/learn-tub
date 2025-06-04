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
      const { data: video } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', youtubeId)
        .maybeSingle();

      if (video) {
        setDbVideoId(video.id);
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
