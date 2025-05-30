import { EnhancedAddVideoForm } from "@/features/videos/components/enhanced-add-video-form"
import { VideoLibrary } from "@/features/videos/components/video-library"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Library, TrendingUp } from "lucide-react"

export default function LearnPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Play className="h-8 w-8 text-blue-600" />
            Learn
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Transform YouTube videos into interactive learning experiences with AI-powered insights
          </p>
        </div>
        <Badge variant="outline" className="hidden md:flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Smart Learning
        </Badge>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Video
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
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
              {/* Getting Started Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                  <CardDescription>Get the most out of LearnTub in 3 simple steps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Import YouTube Video</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste any YouTube URL to automatically fetch video details and metadata
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">Take Smart Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Notes automatically sync with video timestamps for seamless review and navigation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100">Get AI Insights</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive intelligent feedback, quizzes, and personalized study plans
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-900 dark:text-amber-100">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">• Use keyboard shortcuts</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 ml-2">Space: Play/Pause, N: New Note</p>
                  </div>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">• Tag your notes</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 ml-2">
                      Organize with custom tags for easy searching
                    </p>
                  </div>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">• Try AI analysis</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 ml-2">
                      Get comprehension scores and study suggestions
                    </p>
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
  )
}
