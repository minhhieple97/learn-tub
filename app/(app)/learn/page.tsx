import { Play } from "lucide-react";
import { getLearnPageData } from "@/features/videos/queries";
import { LearnTabs } from "@/features/videos/components/learn-tabs";
import { learnPageCache } from "@/features/videos/search-params";
import type { SearchParams } from "nuqs/server";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function LearnPage({ searchParams }: PageProps) {
  const videosPromise = getLearnPageData();

  const { tab } = await learnPageCache.parse(searchParams);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="mx-auto space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
              <Play className="size-8 text-blue-600" />
              Learn
            </h2>
            <p className="mt-1 text-base text-slate-600 dark:text-slate-300">
              Transform YouTube videos into interactive learning experiences
              with AI-powered insights
            </p>
          </div>
        </div>

        <LearnTabs videosPromise={videosPromise!} defaultTab={tab} />
      </div>
    </div>
  );
}
