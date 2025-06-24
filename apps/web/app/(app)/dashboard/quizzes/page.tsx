import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
} from "nuqs/server";
import { QuizDashboard } from "@/features/dashboard/components/quiz-dashboard";
import {
  getQuizDashboardData,
  getUserVideos,
} from "@/features/dashboard/queries/quiz-dashboard-queries";
import type { IQuizFilters } from "@/features/dashboard/types";
import { checkProfile } from "@/lib/require-auth";

const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(""),
  difficulty: parseAsString.withDefault("all"),
  videoId: parseAsString.withDefault(""),
  sortBy: parseAsString.withDefault("created_at"),
  sortOrder: parseAsString.withDefault("desc"),
  page: parseAsInteger.withDefault(1),
});

type IQuizDashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuizDashboardPage({
  searchParams,
}: IQuizDashboardPageProps) {
  const params = searchParamsCache.parse(await searchParams);
  const profile = await checkProfile();

  const filters: Partial<IQuizFilters> = {
    search: params.search,
    difficulty: (params.difficulty || "all") as IQuizFilters["difficulty"],
    videoId: params.videoId || undefined,
    sortBy: (params.sortBy || "created_at") as IQuizFilters["sortBy"],
    sortOrder: (params.sortOrder || "desc") as IQuizFilters["sortOrder"],
    page: params.page,
    limit: 10,
  };

  const [data, videos] = await Promise.all([
    getQuizDashboardData(profile.id, filters),
    getUserVideos(profile.id),
  ]);

  return (
    <div className="container mx-auto">
      <QuizDashboard data={data} videos={videos} />
    </div>
  );
}
