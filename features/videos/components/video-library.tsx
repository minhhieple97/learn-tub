"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, BookOpen, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Simple utility to format relative time
function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

// Format duration from seconds to MM:SS or HH:MM:SS
function formatDuration(seconds: number): string {
  if (!seconds) return "00:00"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export function VideoLibrary() {
  const [videos, setVideos] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data: user } = await supabase.auth.getUser()

        if (!user.user) {
          setError("Please log in to view your videos")
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from("videos")
          .select("*, notes(count)")
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setVideos(data)
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError("Failed to load videos")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden h-full">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">{error}</h3>
        <p className="text-red-600 dark:text-red-400">Please try again or contact support if the problem persists.</p>
      </div>
    )
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center p-12 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Video className="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h3 className="text-xl font-medium text-blue-800 dark:text-blue-200 mb-2">No videos yet</h3>
        <p className="text-blue-600 dark:text-blue-400 mb-6">Add your first YouTube video to start learning</p>
        <Badge
          variant="outline"
          className="mx-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
        >
          Switch to "Add Video" tab to get started
        </Badge>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your Learning Library</h3>
        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
          {videos.length} {videos.length === 1 ? "video" : "videos"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Link key={video.id} href={`/learn/${video.youtube_id}`}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="aspect-video relative group">
                <img
                  src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                  alt={video.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Badge className="bg-blue-600 hover:bg-blue-700">Watch & Learn</Badge>
                </div>
                {video.duration > 0 && (
                  <Badge variant="outline" className="absolute bottom-2 right-2 bg-black/70 text-white border-none">
                    {formatDuration(video.duration)}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-2 text-slate-900 dark:text-slate-100">{video.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{video.channel_name}</p>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(video.created_at))}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {video.notes?.[0]?.count || 0} notes
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <div className="w-full flex justify-between items-center">
                  <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700">
                    Video
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
