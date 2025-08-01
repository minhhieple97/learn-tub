import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Calendar } from "lucide-react";
import { IVideo } from "../types";
import { formatDistanceToNow, formatDuration } from "@/lib/utils";
import { routes } from "@/routes";

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
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          <div className="video-overlay" />

          {(video.duration ?? 0) > 0 && (
            <Badge className="duration-badge">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(video.duration ?? 0)}
            </Badge>
          )}
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex-1 space-y-2">
            <h3 className="video-title">{video.title}</h3>
            <p className="video-channel">{video.channel_name}</p>
          </div>

          <div className="video-meta">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="meta-badge">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(video.created_at ?? Date.now()))}
              </div>
              <div className="meta-badge">
                <BookOpen className="w-3 h-3 mr-1" />
                {video.notes?.[0]?.count || 0} notes
              </div>
            </div>
            <span className="video-date">
              {new Date(video.created_at ?? Date.now()).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
