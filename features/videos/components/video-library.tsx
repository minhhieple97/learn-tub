"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Clock,
  BookOpen,
  Video,
  Play,
  Eye,
  Calendar,
  TrendingUp,
  Star,
  Users,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Simple utility to format relative time
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

// Format duration from seconds to MM:SS or HH:MM:SS
function formatDuration(seconds: number): string {
  if (!seconds) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function VideoLibrary() {
  const [videos, setVideos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data: user } = await supabase.auth.getUser();

        if (!user.user) {
          setError('Please log in to view your videos');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('videos')
          .select('*, notes(count)')
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setVideos(data);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        {/* Enhanced Loading Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-9 w-64 rounded-xl" />
            <Skeleton className="h-5 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Enhanced Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card
              key={i}
              className="group overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 dark:from-slate-800/90 dark:via-slate-850/80 dark:to-slate-900/70 backdrop-blur-sm"
            >
              <div className="relative">
                <Skeleton className="aspect-video w-full rounded-t-xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl" />
              </div>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4">
                <Skeleton className="h-5 w-28 rounded-lg" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-16 rounded-3xl bg-gradient-to-br from-red-50/90 via-pink-50/80 to-red-100/70 dark:from-red-950/40 dark:via-red-900/30 dark:to-red-950/20 border border-red-200/50 dark:border-red-800/30 shadow-2xl backdrop-blur-sm">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100/80 to-pink-100/80 dark:from-red-900/60 dark:to-pink-900/60 shadow-xl border border-red-200/50 dark:border-red-800/40">
          <Video className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">{error}</h3>
        <p className="text-red-700 dark:text-red-300 text-lg opacity-90 max-w-md mx-auto leading-relaxed">
          Please try again or contact support if the problem persists.
        </p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center p-20 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/70 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/30 shadow-2xl backdrop-blur-sm">
        <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-900/60 dark:to-indigo-900/60 shadow-2xl border border-blue-200/50 dark:border-blue-800/40">
          <Video className="h-14 w-14 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold text-lg">Switch to "Add Video" tab to get started</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="ml-auto">
        <Badge
          variant="outline"
          className="px-6 py-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/60 dark:to-indigo-950/60 border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-bold shadow-lg text-lg backdrop-blur-sm"
        >
          <Users className="h-4 w-4 mr-2" />
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </Badge>
      </div>

      {/* Enhanced Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {videos.map((video) => (
          <Link key={video.id} href={`/learn/${video.youtube_id}`}>
            <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-2 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/80 dark:from-slate-800/95 dark:via-slate-850/90 dark:to-slate-900/85 hover:from-blue-50/90 hover:via-indigo-50/80 hover:to-purple-50/70 dark:hover:from-slate-700/95 dark:hover:via-slate-750/90 dark:hover:to-slate-800/85 backdrop-blur-sm rounded-2xl">
              {/* Enhanced Video Thumbnail */}
              <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                <img
                  src={
                    video.thumbnail_url ||
                    `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
                  }
                  alt={video.title}
                  className="object-cover w-full h-full group-hover:scale-125 transition-transform duration-700 ease-out"
                />

                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Enhanced Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-500 border border-white/20">
                    <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                      <Play className="h-5 w-5 text-white fill-current ml-0.5" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg">Watch & Learn</span>
                  </div>
                </div>

                {/* Enhanced Duration Badge */}
                {video.duration > 0 && (
                  <Badge className="absolute bottom-4 right-4 bg-black/90 text-white border-0 backdrop-blur-sm font-mono text-sm shadow-2xl px-3 py-1.5 rounded-xl">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {formatDuration(video.duration)}
                  </Badge>
                )}

              </div>

              {/* Enhanced Content */}
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-xl line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 leading-tight">
                  {video.title}
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 font-semibold">
                  {video.channel_name}
                </p>

                {/* Enhanced Metadata */}
                <div className="flex items-center gap-3 pt-3">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 bg-gradient-to-r from-slate-100/80 to-slate-200/60 dark:from-slate-800/80 dark:to-slate-700/60 px-3 py-2 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {formatDistanceToNow(new Date(video.created_at))}
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 bg-gradient-to-r from-slate-100/80 to-slate-200/60 dark:from-slate-800/80 dark:to-slate-700/60 px-3 py-2 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    {video.notes?.[0]?.count || 0} notes
                  </div>
                </div>
              </CardContent>

              {/* Enhanced Footer */}
              <CardFooter className="px-6 py-5 bg-gradient-to-r from-slate-50/90 to-slate-100/80 dark:from-slate-800/60 dark:to-slate-900/50 border-t border-slate-200/60 dark:border-slate-700/40 backdrop-blur-sm">
                <div className="w-full flex justify-between items-center">
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/60 dark:to-indigo-950/60 border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-bold px-4 py-2 rounded-xl shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Video
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold bg-slate-100/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg">
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
