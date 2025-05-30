"use server"

import { createClient } from "@/lib/supabase/server"

interface YouTubeVideoData {
  id: string
  snippet: {
    title: string
    description: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      high: {
        url: string
      }
    }
  }
  contentDetails: {
    duration: string
  }
}

export async function addVideoAction(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in to add videos" }
  }

  // Ensure profile exists (safety net)
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("id", user.id).single()

  if (profileError && profileError.code === "PGRST116") {
    // Profile doesn't exist, create it
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error creating profile:", insertError)
      return { error: "Failed to create user profile. Please try again." }
    }
  } else if (profileError) {
    console.error("Error checking profile:", profileError)
    return { error: "Database error. Please try again." }
  }

  const videoUrl = formData.get("videoUrl") as string

  if (!videoUrl) {
    return { error: "Video URL is required" }
  }

  // Extract YouTube video ID from URL
  const videoId = extractYouTubeId(videoUrl)

  if (!videoId) {
    return { error: "Invalid YouTube URL" }
  }

  try {
    // Check if video already exists
    const { data: existingVideos } = await supabase
      .from("videos")
      .select("id")
      .eq("youtube_id", videoId)
      .eq("user_id", user.id)
      .limit(1)

    if (existingVideos && existingVideos.length > 0) {
      return { error: "You've already added this video" }
    }

    // Fetch video data from YouTube API
    const apiKey = process.env.YOUTUBE_API_KEY
    let videoData: YouTubeVideoData | null = null

    if (apiKey) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`,
        )
        const data = await response.json()

        if (data.items && data.items.length > 0) {
          videoData = data.items[0]
        }
      } catch (error) {
        console.error("YouTube API error:", error)
        // Continue with fallback data if API fails
      }
    }

    // Parse duration from ISO 8601 format (PT1H2M3S) to seconds
    const parseDuration = (duration: string): number => {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (!match) return 0
      const hours = Number.parseInt(match[1] || "0")
      const minutes = Number.parseInt(match[2] || "0")
      const seconds = Number.parseInt(match[3] || "0")
      return hours * 3600 + minutes * 60 + seconds
    }

    // Insert video with data from API or fallback to basic data
    const { error } = await supabase.from("videos").insert({
      user_id: user.id,
      youtube_id: videoId,
      title: videoData?.snippet?.title || "Untitled Video",
      description: videoData?.snippet?.description || "",
      thumbnail_url: videoData?.snippet?.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: videoData?.contentDetails?.duration ? parseDuration(videoData.contentDetails.duration) : 0,
      channel_name: videoData?.snippet?.channelTitle || "Unknown Channel",
      published_at: videoData?.snippet?.publishedAt || null,
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Failed to add video to database" }
    }

    return { success: true, videoId }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "An unexpected error occurred" }
  }
}

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}
