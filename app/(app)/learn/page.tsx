import { EnhancedAddVideoForm } from "@/features/videos/components/enhanced-add-video-form"
import { VideoLibrary } from "@/features/videos/components/video-library"
import { LearningCategories } from "@/features/videos/components/learning-categories"
import { HowItWorks } from "@/features/videos/components/how-it-works"
import { ProTips } from "@/features/videos/components/pro-tips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Plus, Library } from "lucide-react"

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20 -m-6 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <Play className="h-10 w-10 text-blue-600" />
              Learn
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Transform YouTube videos into interactive learning experiences with AI-powered insights
            </p>
          </div>
        </div>

        <Tabs defaultValue="add" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Video
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Library className="h-4 w-4" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <EnhancedAddVideoForm />
                <div className="mt-8">
                  <LearningCategories />
                </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                <HowItWorks />
                <ProTips />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="animate-in fade-in-50 duration-300">
            <VideoLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
