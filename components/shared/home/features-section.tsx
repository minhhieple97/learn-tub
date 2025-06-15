import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Brain, Clock, Users } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="bg-white dark:bg-slate-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-slate-900 dark:text-slate-100 mb-6 text-4xl font-bold lg:text-5xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              learn smarter
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mx-auto max-w-3xl text-xl">
            Powerful features designed to enhance your learning journey and
            maximize retention.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-950/20 border border-slate-200 dark:border-slate-700 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="from-blue-500 to-blue-600 mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110 shadow-lg">
                <Brain className="text-white size-8" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100 text-xl">
                AI-Powered Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Get intelligent feedback and insights on your notes with
                advanced AI analysis that helps you understand concepts deeper.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-700 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="from-indigo-500 to-indigo-600 mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110 shadow-lg">
                <Clock className="text-white size-8" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100 text-xl">
                Timestamp Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Notes automatically sync with video timestamps for seamless
                review and navigation. Never lose context again.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-950/20 border border-slate-200 dark:border-slate-700 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="from-purple-500 to-purple-600 mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110 shadow-lg">
                <BookOpen className="text-white size-8" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100 text-xl">
                Smart Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Organize your learning with courses, tags, and intelligent
                categorization that adapts to your learning style.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/20 border border-slate-200 dark:border-slate-700 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="from-cyan-500 to-cyan-600 mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110 shadow-lg">
                <Users className="size-8 text-white" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100 text-xl">
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Monitor your learning progress with detailed analytics and
                insights that help you stay motivated and on track.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
