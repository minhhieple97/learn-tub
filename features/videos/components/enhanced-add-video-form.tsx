"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { addVideoAction } from "../actions/add-video"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Youtube, Sparkles, Clock, BookOpen, Zap, CheckCircle2 } from "lucide-react"

export function EnhancedAddVideoForm() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(addVideoAction, null)
  const [url, setUrl] = useState("")

  // Redirect to video page if successful
  useEffect(() => {
    if (state?.success && state.videoId) {
      router.push(`/learn/${state.videoId}`)
    }
  }, [state, router])

  const isValidYouTubeUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    return regex.test(url)
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Youtube className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">Import YouTube Video</CardTitle>
          <CardDescription className="text-base text-blue-700 dark:text-blue-300">
            Transform any YouTube video into an interactive learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={action} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="videoUrl" className="text-base font-medium">
                YouTube URL
              </Label>
              <div className="relative">
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`pl-12 h-12 text-base ${
                    url && isValidYouTubeUrl(url)
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                      : url && !isValidYouTubeUrl(url)
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                  }`}
                  required
                />
                <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {url && isValidYouTubeUrl(url) && (
                  <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Supports youtube.com, youtu.be, and embedded URLs
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || !url || !isValidYouTubeUrl(url)}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Importing Video...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Learning
                </>
              )}
            </Button>

            {state?.error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
              </div>
            )}
          </form>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Timestamp Notes</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Sync with video</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">AI Insights</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Smart analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Study Plans</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Personalized</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Learning Categories</CardTitle>
          <CardDescription>Try these example videos to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Badge variant="secondary" className="justify-center py-2 cursor-pointer hover:bg-secondary/80">
              Programming
            </Badge>
            <Badge variant="secondary" className="justify-center py-2 cursor-pointer hover:bg-secondary/80">
              Science
            </Badge>
            <Badge variant="secondary" className="justify-center py-2 cursor-pointer hover:bg-secondary/80">
              Mathematics
            </Badge>
            <Badge variant="secondary" className="justify-center py-2 cursor-pointer hover:bg-secondary/80">
              Languages
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
