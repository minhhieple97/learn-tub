'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Library } from 'lucide-react';
import { Suspense } from 'react';
import { useQueryStates } from 'nuqs';
import { AddVideoForm } from './add-video-form';
import { HowItWorks } from './how-it-works';
import { VideoLibrary } from './video-library';
import { VideoLibraryLoading } from './video-library-loading';
import { learnPageParsers, type TabValue } from '../search-params';
import { IVideo } from '../types';

type LearnTabsProps = {
  videosPromise: Promise<IVideo[]>;
  defaultTab: TabValue;
};

export function LearnTabs({ videosPromise, defaultTab }: LearnTabsProps) {
  const [{ tab }, setParams] = useQueryStates(learnPageParsers);

  const handleTabChange = (value: string) => {
    setParams({ tab: value as TabValue });
  };

  return (
    <Tabs value={tab || defaultTab} onValueChange={handleTabChange} className="space-y-4">
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
  );
}
