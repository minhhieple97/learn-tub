import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { toast, useToast } from '@/hooks/use-toast';
import { addVideoAction } from '../actions/add-video';
import { routes } from '@/routes';
import { isValidYouTubeUrl } from '@/lib/utils';
import { TOAST_MESSAGES } from '@/config/constants';

type UseAddVideoFormReturn = {
  url: string;
  setUrl: (url: string) => void;
  isValidUrl: boolean;
  isPending: boolean;
  execute: (input: { videoUrl: string }) => void;
  canSubmit: boolean;
};

export const useAddVideoForm = (): UseAddVideoFormReturn => {
  const router = useRouter();
  const { execute, isPending } = useAction(addVideoAction, {
    onError: ({ error }) => {
      if (error.validationErrors?.fieldErrors?.videoUrl) {
        toast.error({
          title: 'Invalid input',
          description:
            error.validationErrors.fieldErrors.videoUrl[0] ||
            TOAST_MESSAGES.INVALID_URL_ERROR,
        });
      } else {
        toast.error({
          title: 'Failed to add video',
          description: error.serverError || TOAST_MESSAGES.UNEXPECTED_ERROR,
        });
      }
    },
    onSuccess: ({ data }) => {
      if (data?.success && data?.videoId) {
        toast.success({
          title: 'Success',
          description: TOAST_MESSAGES.VIDEO_ADDED_SUCCESS,
        });
        router.push(`${routes.learn}/${data.videoId}`);
      }
    },
  });

  const [url, setUrl] = useState('');

  const isValidUrl = !!url && isValidYouTubeUrl(url);
  const canSubmit = !isPending && !!url && isValidUrl;

  const handleExecute = (input: { videoUrl: string }) => {
    execute(input);
  };

  return {
    url,
    setUrl,
    isValidUrl,
    isPending,
    execute: handleExecute,
    canSubmit,
  };
};
