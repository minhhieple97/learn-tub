import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { addVideoAction } from '../actions/add-video';
import { routes } from '@/routes';
import { isValidYouTubeUrl } from '@/lib/utils';
import { TOAST_MESSAGES } from '@/config/constants';
import { IUseAddVideoFormReturn } from '../types';
import { z } from 'zod';

const addVideoSchema = z.object({
  videoUrl: z.string().url('Please enter a valid URL').min(1, 'Video URL is required'),
  tutorial: z.string().optional(),
});

type AddVideoFormData = z.infer<typeof addVideoSchema>;
type IActionResult = { success: boolean; videoId: string } | undefined;

export const useAddVideoForm = (): IUseAddVideoFormReturn => {
  const router = useRouter();

  const form = useForm<AddVideoFormData>({
    resolver: zodResolver(addVideoSchema),
    defaultValues: {
      videoUrl: '',
      tutorial: '',
    },
  });

  const watchedUrl = form.watch('videoUrl');

  const handleValidationError = (fieldErrors: Record<string, string[] | undefined>) => {
    if (fieldErrors.videoUrl?.length) {
      toast.error({
        title: 'Invalid URL',
        description: fieldErrors.videoUrl[0] || TOAST_MESSAGES.INVALID_URL_ERROR,
      });
      return;
    }

    if (fieldErrors.tutorial?.length) {
      toast.error({
        title: 'Invalid Tutorial Text',
        description: fieldErrors.tutorial[0],
      });
      return;
    }
  };

  const handleSuccess = (data: IActionResult) => {
    if (data?.success && data?.videoId) {
      toast.success({
        description: TOAST_MESSAGES.VIDEO_ADDED_SUCCESS,
      });
      router.push(`${routes.learn}/${data.videoId}`);
    }
  };

  const { execute, isPending } = useAction(addVideoAction, {
    onError: ({ error }) => {
      if (error.validationErrors?.fieldErrors) {
        handleValidationError(error.validationErrors.fieldErrors);
      } else {
        toast.error({
          title: 'Failed to add video',
          description: error.serverError || TOAST_MESSAGES.UNEXPECTED_ERROR,
        });
      }
    },
    onSuccess: ({ data }) => handleSuccess(data),
  });

  const isValidUrl = !!watchedUrl && isValidYouTubeUrl(watchedUrl);
  const canSubmit = !isPending && isValidUrl;

  const onSubmit = (data: AddVideoFormData) => {
    execute({
      videoUrl: data.videoUrl,
      tutorial: data.tutorial || undefined,
    });
  };

  return {
    form,
    onSubmit,
    url: watchedUrl,
    setUrl: (value: string) => form.setValue('videoUrl', value),
    tutorial: form.watch('tutorial') || '',
    setTutorial: (value: string) => form.setValue('tutorial', value),
    isValidUrl,
    isPending,
    execute: (input: { videoUrl: string; tutorial?: string }) => execute(input),
    canSubmit,
  };
};
