import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Calendar } from 'lucide-react';
import { IVideo } from '../types';
import { formatDistanceToNow, formatDuration } from '@/lib/utils';
import { routes } from '@/routes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type VideoCardProps = {
  video: IVideo;
};

export const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link href={`${routes.learn}/${video.youtube_id}`}>
      <Card className="group h-full flex flex-col overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-2 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/80 dark:from-slate-800/95 dark:via-slate-850/90 dark:to-slate-900/85 hover:from-blue-50/90 hover:via-indigo-50/80 hover:to-purple-50/70 dark:hover:from-slate-700/95 dark:hover:via-slate-750/90 dark:hover:to-slate-800/85 backdrop-blur-sm rounded-2xl">
        <div className="aspect-video relative overflow-hidden rounded-t-2xl flex-shrink-0">
          <Image
            src={
              video.thumbnail_url ||
              `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
            }
            alt={video.title}
            width={480}
            height={360}
            className="object-cover w-full h-full group-hover:scale-125 transition-transform duration-700 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

          {(video.duration ?? 0) > 0 && (
            <Badge className="absolute bottom-4 right-4 bg-black/90 text-white border-0 backdrop-blur-sm font-mono text-sm shadow-2xl px-3 py-1.5 rounded-xl">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {formatDuration(video.duration ?? 0)}
            </Badge>
          )}
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className="font-bold text-xl text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 leading-tight h-[3.5rem] overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {video.title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="max-w-[350px] text-sm p-3 bg-slate-900 text-white border-slate-700"
                >
                  {video.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-base text-slate-600 dark:text-slate-400 font-semibold line-clamp-1">
              {video.channel_name}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-4 mt-auto flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-gradient-to-r from-slate-100/80 to-slate-200/60 dark:from-slate-800/80 dark:to-slate-700/60 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <Calendar className="h-3 w-3 mr-2" />
                {formatDistanceToNow(new Date(video.created_at ?? Date.now()))}
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-gradient-to-r from-slate-100/80 to-slate-200/60 dark:from-slate-800/80 dark:to-slate-700/60 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <BookOpen className="h-3 w-3 mr-2" />
                {video.notes?.[0]?.count || 0} notes
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-md">
              {new Date(video.created_at ?? Date.now()).toLocaleDateString()}
            </span>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-gradient-to-r from-slate-50/90 to-slate-100/80 dark:from-slate-800/60 dark:to-slate-900/50 border-t border-slate-200/60 dark:border-slate-700/40 backdrop-blur-sm flex-shrink-0">
          <div className="w-full flex justify-between items-center"></div>
        </CardFooter>
      </Card>
    </Link>
  );
};
