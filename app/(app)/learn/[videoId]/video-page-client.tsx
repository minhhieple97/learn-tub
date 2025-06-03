"use client"

import { useState } from "react"
import { YouTubePlayer } from "@/features/videos/components/youtube-player"
import { NoteEditor } from "@/features/notes/components/note-editor"
import { AIAssistant } from "@/features/ai/components/ai-assistant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { routes } from "@/routes"

// Re-define types here or import from a shared file
interface Course {
  title: string
}

export interface Video {
  id: string // Database ID
  youtube_id: string
  title: string
  description?: string | null
  channel_name?: string | null
  published_at?: string | null
  courses?: Course | null
}

interface VideoPageClientProps {
  video: Video; // Use the defined Video type
  videoId: string;
}

export function VideoPageClient({ video, videoId }: VideoPageClientProps) {
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [targetSeekTime, setTargetSeekTime] = useState<number | undefined>(undefined);

  const handleTimeUpdate = (time: number) => {
    setCurrentTimestamp(Math.floor(time));
  };

  const handleNoteTimestampClick = (time: number) => {
    setTargetSeekTime(time);
    // Optional: Reset targetSeekTime after a delay or via acknowledgment from YouTubePlayer
    // to allow re-clicking the same timestamp. For now, this will seek once per distinct time.
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={routes.learn}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Videos
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{video.title}</h1>
          {video.courses && <p className="text-muted-foreground">Course: {video.courses.title}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <YouTubePlayer
            videoId={videoId}
            onTimeUpdate={handleTimeUpdate}
            targetSeekTime={targetSeekTime}
            initialTimestamp={0} // You might want to load this from learning_sessions later
          />
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Video Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{video.description || 'No description available.'}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Channel: {video.channel_name || 'Unknown'}</p>
                <p>
                  Published:{' '}
                  {video.published_at
                    ? new Date(video.published_at).toLocaleDateString()
                    : 'Publication date unknown'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                Notes
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">
                AI Assistant
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4">
              <NoteEditor
                videoId={videoId}
                currentTimestamp={currentTimestamp}
                onTimestampClick={handleNoteTimestampClick}
              />
            </TabsContent>
            <TabsContent value="ai" className="mt-4">
              <AIAssistant videoId={videoId} dbVideoId={video.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
