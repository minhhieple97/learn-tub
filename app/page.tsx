import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, Brain, Clock, Users, ArrowRight, Star, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LearnTub
              </span>
              <p className="text-xs text-slate-500 font-medium">Learning Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Enhanced Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
            <Star className="h-4 w-4" />
            <span>Trusted by 10,000+ learners</span>
          </div>

          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Transform YouTube into Your
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Learning Platform
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Take smart notes, get AI-powered insights, and turn passive video watching into active learning experiences
            with our intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg text-lg px-8 py-4">
              <Link href="/register" className="flex items-center">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-lg px-8 py-4"
            >
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="light-card-elevated group hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">AI-Powered Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-center leading-relaxed">
                Get intelligent feedback and insights on your notes with advanced AI analysis and personalized
                recommendations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="light-card-elevated group hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl group-hover:from-emerald-100 group-hover:to-emerald-200 transition-colors">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">Timestamp Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-center leading-relaxed">
                Notes automatically sync with video timestamps for seamless review and navigation through your content.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="light-card-elevated group hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl group-hover:from-purple-100 group-hover:to-purple-200 transition-colors">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">Smart Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-center leading-relaxed">
                Organize your learning with courses, tags, and intelligent categorization powered by machine learning.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="light-card-elevated group hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl group-hover:from-orange-100 group-hover:to-orange-200 transition-colors">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-center leading-relaxed">
                Monitor your learning progress with detailed analytics, insights, and personalized learning paths.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center bg-gradient-to-br from-white to-blue-50 rounded-2xl p-12 shadow-xl border border-blue-100">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Join the learning revolution</span>
            </div>

            <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to Start Learning Smarter?</h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Join thousands of learners who are already transforming their YouTube experience into structured,
              AI-enhanced learning journeys.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg text-lg px-8 py-4">
                <Link href="/register" className="flex items-center">
                  Create Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              No credit card required • Free forever • Start learning in 30 seconds
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
