import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, CheckCircle, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { routes } from '@/routes';
import {
  getRoadmapWithNodes,
  getRoadmapProgress,
} from '@/features/roadmaps/queries';
import { checkProfile } from '@/lib/require-auth';
import { notFound } from 'next/navigation';

type RoadmapDetailPageProps = {
  params: Promise<{ roadmapId: string }>;
};

export default async function RoadmapDetailPage({
  params,
}: RoadmapDetailPageProps) {
  const { roadmapId } = await params;
  const profile = await checkProfile();

  const [roadmap, progress] = await Promise.all([
    getRoadmapWithNodes(roadmapId, profile.id),
    getRoadmapProgress(roadmapId, profile.id),
  ]);

  if (!roadmap) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'archived':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const completionPercentage = progress?.completionPercentage || 0;
  const totalNodes = roadmap.nodes.length;
  const completedNodes = roadmap.nodes.filter(
    (n) => n.status === 'completed',
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.roadmaps.root}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {roadmap.title}
              </h1>
              <Badge
                variant="outline"
                className={getStatusColor(roadmap.status ?? 'draft')}
              >
                {(roadmap.status ?? 'draft').charAt(0).toUpperCase() +
                  (roadmap.status ?? 'draft').slice(1)}
              </Badge>
            </div>
            {roadmap.description && (
              <p className="text-slate-600 dark:text-slate-300">
                {roadmap.description}
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Progress</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Completion</span>
              <span>
                {completedNodes}/{totalNodes} nodes
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>

        {/* Learning Nodes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Learning Path
          </h3>

          {roadmap.nodes.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center border">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-lg font-semibold mb-2">No content yet</h4>
              <p className="text-slate-600 dark:text-slate-300">
                This roadmap needs to be generated with AI content.
              </p>
            </div>
          ) : (
            roadmap.nodes.map((node, index) => {
              const isCompleted = node.status === 'completed';
              const isInProgress = node.status === 'in_progress';

              return (
                <div
                  key={node.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${
                    isCompleted
                      ? 'border-l-green-500'
                      : isInProgress
                        ? 'border-l-blue-500'
                        : 'border-l-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold ${
                          isCompleted
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : isInProgress
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {node.title}
                        </h4>
                        {node.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                            {node.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>Level {node.level}</span>
                          {node.estimated_duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.round(
                                (node.estimated_duration_minutes ?? 0) / 60,
                              )}
                              h
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {(node.status ?? 'pending').replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isCompleted ? 'outline' : 'default'}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isCompleted ? 'Review' : 'Start'}
                    </Button>
                  </div>

                  {/* Videos */}
                  {node.videos && node.videos.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Resources ({node.videos.length})
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {node.videos.slice(0, 2).map((nodeVideo) => (
                          <div
                            key={nodeVideo.id}
                            className="flex items-center gap-2 p-2 rounded border hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <div className="relative">
                              <Image
                                src={nodeVideo.video.thumbnail_url || ''}
                                alt={nodeVideo.video.title}
                                width={48}
                                height={32}
                                className="w-12 h-8 rounded object-cover"
                              />
                              <Play className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium line-clamp-2">
                                {nodeVideo.video.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {nodeVideo.video.channel_name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {node.videos.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                        >
                          View All {node.videos.length} Videos
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
