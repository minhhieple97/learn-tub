import { IScreenshotResult } from '@/features/notes/types';
import { RICH_TEXT_EDITOR } from '@/features/notes/constants';

/**
 * Client-side function to capture video frame
 */
export const captureVideoFrame = (
  videoElement: HTMLVideoElement,
): Promise<IScreenshotResult> | null => {
  try {
    if (!videoElement || videoElement.readyState < 2) {
      throw new Error('Video not ready for screenshot');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const timestamp = videoElement.currentTime;

    return new Promise<IScreenshotResult>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create screenshot blob'));
            return;
          }

          const fileName = `screenshot-${Date.now()}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });

          resolve({
            file,
            width: canvas.width,
            height: canvas.height,
            timestamp,
          });
        },
        'image/png',
        RICH_TEXT_EDITOR.SCREENSHOT_QUALITY,
      );
    });
  } catch (error) {
    console.error('Error capturing video frame:', error);
    return null;
  }
};

/**
 * Client-side utility to convert File to base64
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Client-side utility to convert canvas to base64
 */
export const convertCanvasToBase64 = (
  canvas: HTMLCanvasElement,
  quality: number = RICH_TEXT_EDITOR.SCREENSHOT_QUALITY,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create canvas blob'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read canvas blob'));
        reader.readAsDataURL(blob);
      },
      'image/png',
      quality,
    );
  });
};

/**
 * Client-side utility to get file from clipboard
 */
export const getImageFromClipboard = (event: ClipboardEvent): File | null => {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        return file;
      }
    }
  }

  return null;
};
