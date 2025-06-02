"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addVideoAction } from "../actions/add-video"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Youtube, Play, CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function EnhancedAddVideoForm() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(addVideoAction, null)
  const [url, setUrl] = useState("")

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
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

      <CardHeader className="relative text-center pb-6 pt-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
          <Youtube className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-white mb-3">Import YouTube Video</CardTitle>
        <CardDescription className="text-lg text-blue-100 max-w-md mx-auto leading-relaxed">
          Transform any YouTube video into an interactive learning experience with AI-powered insights
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6 pb-8">
        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="videoUrl" className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
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
                className={cn(
                  "h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-white/50 transition-all duration-200",
                  url && isValidYouTubeUrl(url)
                    ? "ring-2 ring-emerald-400 bg-white"
                    : url && !isValidYouTubeUrl(url)
                      ? "ring-2 ring-orange-400"
                      : "",
                )}
                required
              />
              {url && isValidYouTubeUrl(url) && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">Valid URL</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-blue-100 text-sm">
              <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
              <span>Supports youtube.com, youtu.be, and embedded URLs</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending || !url || !isValidYouTubeUrl(url)}
            className="w-full h-14 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 border-0"
          >
            {isPending ? (
              <>
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
            <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-xl">
              <p className="text-red-100 font-medium text-center">{state.error}</p>
            </div>
          )}
        </form>

        {/* Success indicators */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <p className="text-xs text-blue-100">Import Video</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <p className="text-xs text-blue-100">Take Notes</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <p className="text-xs text-blue-100">AI Insights</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
