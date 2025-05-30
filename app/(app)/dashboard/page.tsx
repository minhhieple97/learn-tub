import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIInsightsDashboard } from "@/features/ai/components/ai-insights-dashboard"
import { BookOpen, Clock, TrendingUp, Video, ArrowUpRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-1">
      {/* Enhanced Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-lg text-slate-600 font-medium">Track your learning progress and discover new content</p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="light-card-elevated group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Videos</CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">12</div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 font-medium">+2</span>
              <span className="text-slate-500 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="light-card-elevated group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Learning Time
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">24h 30m</div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 font-medium">+4h</span>
              <span className="text-slate-500 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="light-card-elevated group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Notes Created
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">89</div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 font-medium">+12</span>
              <span className="text-slate-500 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="light-card-elevated group hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Streak</CardTitle>
            <div className="p-2.5 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">7 days</div>
            <div className="flex items-center text-sm">
              <span className="text-orange-600 font-medium">Keep it up!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <AIInsightsDashboard />

      {/* Enhanced Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="light-card-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Recent Videos</CardTitle>
            <CardDescription className="text-slate-600">Videos you've been watching recently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-20 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">React Hooks Tutorial</p>
                <p className="text-sm text-slate-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-20 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Next.js 15 Features</p>
                <p className="text-sm text-slate-500">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="light-card-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Learning Goals</CardTitle>
            <CardDescription className="text-slate-600">Your progress towards weekly goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-700">Watch 5 videos</span>
                <span className="text-slate-900">3/5</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-700">Take 50 notes</span>
                <span className="text-slate-900">32/50</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: "64%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
