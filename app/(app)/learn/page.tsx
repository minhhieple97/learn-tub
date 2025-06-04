import { redirect } from 'next/navigation';
import { routes } from '@/routes';
import { Play } from 'lucide-react';
import { getLearnPageData } from '@/features/videos/queries';
import { LearnTabs } from '@/features/videos/components/learn-tabs';
import { learnPageCache } from '@/features/videos/search-params';
import type { SearchParams } from 'nuqs/server';

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function LearnPage({ searchParams }: PageProps) {
  const { user, profile, videosPromise } = await getLearnPageData();

  if (!user || !profile) {
    redirect(routes.login);
  }

  const { tab } = await learnPageCache.parse(searchParams);

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

        <LearnTabs videosPromise={videosPromise!} defaultTab={tab} />
      </div>
    </div>
  );
}
