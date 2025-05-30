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
import { Youtube, Sparkles, Clock, BookOpen, Zap, CheckCircle2, Play } from "lucide-react"

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
      {/* Hero Section with Enhanced Design */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 dark:from-red-600 dark:via-red-700 dark:to-red-800 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fillOpacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <CardHeader className="relative text-center pb-6 pt-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Youtube className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Import YouTube Video
          </CardTitle>
          <CardDescription className="text-lg text-red-100 max-w-md mx-auto">
            Transform any YouTube video into an interactive learning experience with AI-powered insights
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative space-y-6 pb-8">
          <form action={action} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="videoUrl" className="text-lg font-semibold text-white">
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
                  className={`pl-14 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-white/50 ${
                    url && isValidYouTubeUrl(url)
                      ? "ring-2 ring-green-400"
                      : url && !isValidYouTubeUrl(url)
                        ? "ring-2 ring-orange-400"
                        : ""
                  }`}
                  required
                />
                <Youtube className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-red-500" />
                {url && isValidYouTubeUrl(url) && (
                  <CheckCircle2 className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                )}
              </div>
              <p className="text-red-100 text-sm">
                Supports youtube.com, youtu.be, and embedded URLs
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || !url || !isValidYouTubeUrl(url)}
              className="w-full h-14 text-lg font-semibold bg-white text-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  Importing Video...
                </>
              ) : (
                <>
                  <Play className="mr-3 h-5 w-5" />
                  Start Learning Now
                </>
              )}
            </Button>

            {state?.error && (
              <div className="p-4 bg-red-900/50 backdrop-blur-sm border border-red-400/30 rounded-lg">
                <p className="text-red-100 font-medium">{state.error}</p>
              </div>
            )}
          </form>

          {/* Enhanced Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/20">
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
                <Clock className="h-6 w-6 text-blue-200" />
              </div>
              <div>
                <p className="font-semibold text-white">Timestamp Notes</p>
                <p className="text-sm text-red-100">Sync with video timeline</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 border border-purple-400/30">
                <Zap className="h-6 w-6 text-purple-200" />
              </div>
              <div>
                <p className="font-semibold text-white">AI Insights</p>
                <p className="text-sm text-red-100">Smart analysis & quizzes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 border border-green-400/30">
                <BookOpen className="h-6 w-6 text-green-200" />
              </div>
              <div>
                <p className="font-semibold text-white">Study Plans</p>
                <p className="text-sm text-red-100">Personalized learning</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Examples */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Popular Learning Categories
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Try these example videos to get started with your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Badge 
              variant="secondary" 
              className="justify-center py-3 cursor-pointer hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition-colors bg-white/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700"
            >
              💻 Programming
            </Badge>
            <Badge 
              variant="secondary" 
              className="justify-center py-3 cursor-pointer hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300 transition-colors bg-white/80 backdrop-blur-sm border border-green-200 dark:border-green-700"
            >
              🔬 Science
            </Badge>
            <Badge 
              variant="secondary" 
              className="justify-center py-3 cursor-pointer hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-300 transition-colors bg-white/80 backdrop-blur-sm border border-purple-200 dark:border-purple-700"
            >
              📐 Mathematics
            </Badge>
            <Badge 
              variant="secondary" 
              className="justify-center py-3 cursor-pointer hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900 dark:hover:text-orange-300 transition-colors bg-white/80 backdrop-blur-sm border border-orange-200 dark:border-orange-700"
            >
              🌍 Languages
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
