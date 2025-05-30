import { EnhancedAddVideoForm } from "@/features/videos/components/enhanced-add-video-form"
import { VideoLibrary } from "@/features/videos/components/video-library"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Library, TrendingUp, Lightbulb, Rocket } from "lucide-react"

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 -m-6 p-6">
      <div className="space-y-6">
        {/* Enhanced Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <Play className="h-10 w-10 text-blue-600" />
              Learn
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Transform YouTube videos into interactive learning experiences with AI-powered insights
            </p>
          </div>
          <Badge
            variant="outline"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-blue-200 dark:border-blue-700"
          >
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Smart Learning Platform
          </Badge>
        </div>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-white/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800/80">
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Plus className="h-4 w-4" />
              Add Video
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Library className="h-4 w-4" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EnhancedAddVideoForm />
              </div>

              <div className="lg:col-span-1 space-y-6">
                {/* Enhanced Getting Started Guide */}
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950 border-blue-200 dark:border-blue-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <Rocket className="h-5 w-5" />
                      How It Works
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                      Get the most out of LearnTub in 3 simple steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Import YouTube Video</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Paste any YouTube URL to automatically fetch video details and metadata
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Take Smart Notes</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Notes automatically sync with video timestamps for seamless review and navigation
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Get AI Insights</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Receive intelligent feedback, quizzes, and personalized study plans
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Tips Card */}
                <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-300 dark:border-amber-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        ⌨️
                      </div>
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">Use keyboard shortcuts</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Space: Play/Pause, N: New Note</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        🏷️
                      </div>
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">Tag your notes</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Organize with custom tags for easy searching
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        🤖
                      </div>
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">Try AI analysis</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Get comprehension scores and study suggestions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <VideoLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
