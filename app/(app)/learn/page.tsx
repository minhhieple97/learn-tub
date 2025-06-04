import { AddVideoForm, VideoLibrary, HowItWorks } from '@/features/videos/components';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { routes } from '@/routes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Plus, Library } from 'lucide-react';
import { Video } from '@/features/videos/types/video';
import { Suspense } from 'react';
import { VideoLibraryLoading } from '@/features/videos/components/video-library-loading';

// Create the videos promise function
async function getVideosPromise(userId: string) {
  const supabase = await createClient();
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*, notes(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return videos || [];
}

export default async function LearnPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) {
    redirect(routes.login);
  }

  // Create the promise for videos
  const videosPromise = getVideosPromise(profile.id);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Play className="h-8 w-8 text-blue-600" />
              Learn
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-base">
              Transform YouTube videos into interactive learning experiences with AI-powered
              insights
            </p>
          </div>
        </div>

        <Tabs defaultValue="add" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Video
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Library className="h-4 w-4" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <AddVideoForm />
              </div>

              <div className="lg:col-span-1 space-y-4">
                <HowItWorks />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="animate-in fade-in-50 duration-300">
            <Suspense fallback={<VideoLibraryLoading />}>
              <VideoLibrary videosPromise={videosPromise} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
