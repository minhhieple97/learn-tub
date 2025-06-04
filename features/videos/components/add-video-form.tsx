"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addVideoAction } from '../actions/add-video';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Youtube, Play } from 'lucide-react';
import { routes } from '@/routes';
import { dotPatternUrl, isValidYouTubeUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const AddVideoForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [state, action, isPending] = useActionState(addVideoAction, null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (state?.success && state.videoId) {
      router.push(`${routes.learn}/${state.videoId}`);
    }

    if (state?.error) {
      toast({
        title: 'Failed to add video',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, router]);

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 dark:from-red-600 dark:via-red-700 dark:to-red-800">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url('${dotPatternUrl}')` }}
      ></div>

      <CardHeader className="relative text-center pb-6 pt-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
          <Youtube className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-white mb-2">Import YouTube Video</CardTitle>
        <CardDescription className="text-lg text-red-100 max-w-md mx-auto">
          Transform any YouTube video into an interactive learning experience
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6 pb-8">
        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="videoUrl" className="text-lg font-semibold text-white">
              YouTube URL
            </Label>
            <div className="relative">
              <Input
                id="videoUrl"
                name="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`pl-14 h-14 text-lg text-primary backdrop-blur-sm border-0 shadow-lg placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-white/50 ${
                  url && isValidYouTubeUrl(url)
                    ? 'ring-2 ring-green-400'
                    : url && !isValidYouTubeUrl(url)
                    ? 'ring-2 ring-orange-400'
                    : ''
                }`}
                required
              />
            </div>
            <p className="text-red-100 text-sm">
              Supports youtube.com, youtu.be, and embedded URLs
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending || !url || !isValidYouTubeUrl(url)}
            className="w-full h-14 text-lg font-semibold bg-white text-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
          >
            {isPending ? (
              <>
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                Importing Video...
              </>
            ) : (
              <>
                <Play className="mr-3 h-5 w-5" />
                Start Learning Now
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
