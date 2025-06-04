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
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiLoaded(true);
      };
    } else {
      setIsApiLoaded(true);
    }
  }, []);

  return {
    isApiLoaded,
    YT: window.YT,
  };
}; 