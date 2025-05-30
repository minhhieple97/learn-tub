import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">LearnTub</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Transform YouTube into Your
            <span className="text-blue-600"> Learning Platform</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Take smart notes, get AI-powered insights, and turn passive video watching into active learning experiences.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">Start Learning Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>AI-Powered Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get intelligent feedback and insights on your notes with advanced AI analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Timestamp Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Notes automatically sync with video timestamps for seamless review and navigation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Smart Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize your learning with courses, tags, and intelligent categorization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Monitor your learning progress with detailed analytics and insights.</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Start Learning Smarter?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of learners who are already transforming their YouTube experience.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Create Your Free Account</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
