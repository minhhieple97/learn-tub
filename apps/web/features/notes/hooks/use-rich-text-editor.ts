'use client';

import { useEffect, useState, useRef } from 'react';
import { useNotesStore } from '../store';
import { createClient } from '@/lib/supabase/client';
import { IUseRichTextEditorHookReturn } from '../types';

export const useRichTextEditor = (): IUseRichTextEditorHookReturn => {
  const [userId, setUserId] = useState<string>('');
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const { formContent, currentVideoId, isFormLoading } = useNotesStore();

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Video element management
  const setVideoElementRef = (element: HTMLVideoElement | null) => {
    videoElementRef.current = element;
    setVideoElement(element);
  };

  // Auto-detect video element if not provided
  useEffect(() => {
    if (!videoElement) {
      // Try to find video element in the page
      const videoEl = document.querySelector('video') as HTMLVideoElement;
      if (videoEl) {
        setVideoElement(videoEl);
        videoElementRef.current = videoEl;
      }
    }
  }, [videoElement]);

  return {
    // Editor props
    content: formContent,
    disabled: isFormLoading,

    // Video context
    videoElement,
    setVideoElementRef,
    userId,
    videoId: currentVideoId || '',

    // Status
    isLoading: isFormLoading,
    isReady: !!userId && !!currentVideoId,
  };
};
