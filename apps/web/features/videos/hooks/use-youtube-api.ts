import { useState, useEffect } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type UseYouTubeAPIReturn = {
  isApiLoaded: boolean;
  YT: any;
};

export const useYouTubeAPI = (): UseYouTubeAPIReturn => {
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag) {
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setIsApiLoaded(true);
      };
    } else {
      setIsApiLoaded(true);
    }
  }, []);

  return {
    isApiLoaded,
    YT: typeof window !== 'undefined' ? window.YT : null,
  };
}; 