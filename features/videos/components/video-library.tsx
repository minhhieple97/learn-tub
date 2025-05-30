import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

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

export async function VideoLibrary() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view your videos</div>
  }

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">No videos yet</h3>
        <p className="text-muted-foreground">Add your first YouTube video to start learning</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Link key={video.id} href={`/learn/${video.youtube_id}`}>
          <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
            <div className="aspect-video relative">
              <img
                src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                alt={video.title}
                className="object-cover w-full h-full"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium line-clamp-2">{video.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{video.channel_name}</p>
            </CardContent>
            <CardFooter className="px-4 py-2 text-xs text-muted-foreground border-t">
              Added {formatDistanceToNow(new Date(video.created_at))}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
