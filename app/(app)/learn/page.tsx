import { EnhancedAddVideoForm } from "@/features/videos/components/enhanced-add-video-form"
import { VideoLibrary } from "@/features/videos/components/video-library"
import { LearningCategories } from "@/features/videos/components/learning-categories"
import { HowItWorks } from "@/features/videos/components/how-it-works"
import { ProTips } from "@/features/videos/components/pro-tips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Plus, Library } from "lucide-react"

export default function LearnPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Play className="h-8 w-8 text-blue-600" />
              Learn
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-base">
              Transform YouTube videos into interactive learning experiences with AI-powered
              insights
            </p>
          </div>
        </div>

        <Tabs defaultValue="add" className="space-y-4">
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

          <TabsContent value="add" className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <EnhancedAddVideoForm />
              </div>

              <div className="lg:col-span-1 space-y-4">
                <HowItWorks />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="animate-in fade-in-50 duration-300">
            <VideoLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
