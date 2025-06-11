import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { addVideoAction } from '../actions/add-video';
import { routes } from '@/routes';
import { isValidYouTubeUrl } from '@/lib/utils';
import { TOAST_MESSAGES } from '@/config/constants';
import { IUseAddVideoFormReturn } from '../types';

export const useAddVideoForm = (): IUseAddVideoFormReturn => {
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
          description: TOAST_MESSAGES.VIDEO_ADDED_SUCCESS,
        });
        router.push(`${routes.learn}/${data.videoId}`);
      }
    },
  });

  const [url, setUrl] = useState('');
  const [tutorial, setTutorial] = useState('');

  const isValidUrl = !!url && isValidYouTubeUrl(url);
  const canSubmit = !isPending && !!url && isValidUrl;

  const handleExecute = (input: { videoUrl: string; tutorial?: string }) => {
    execute(input);
  };

  return {
    url,
    setUrl,
    tutorial,
    setTutorial,
    isValidUrl,
    isPending,
    execute: handleExecute,
    canSubmit,
  };
};
