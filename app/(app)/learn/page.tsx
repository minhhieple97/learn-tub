import { AddVideoForm } from "@/features/videos/components/add-video-form"
import { VideoLibrary } from "@/features/videos/components/video-library"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Learn</h2>
        <p className="text-gray-600 dark:text-gray-300">Add YouTube videos and start taking smart notes</p>
      </div>

      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos">My Videos</TabsTrigger>
          <TabsTrigger value="add">Add Video</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
          <VideoLibrary />
        </TabsContent>
        <TabsContent value="add" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AddVideoForm />
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Learn how to make the most of LearnTub</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Add a YouTube Video</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste any YouTube URL to get started with your learning session
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Take Smart Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Notes automatically sync with video timestamps for easy review
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Get AI Insights</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive intelligent feedback and suggestions on your learning
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
