import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, Brain, Clock, Users, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-pearl">
      <header className="bg-neutral-pearl/80 backdrop-blur-sm border-b border-neutral-stone sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-neutral-sage rounded-xl">
                <BookOpen className="h-6 w-6 text-neutral-sage-foreground" />
              </div>
              <span className="text-2xl font-bold text-neutral-pearl-foreground">LearnTub</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="text-neutral-pearl-foreground hover:bg-neutral-stone hover:text-neutral-stone-foreground"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="bg-neutral-sage text-neutral-sage-foreground hover:bg-neutral-sage/90"
                asChild
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative bg-gradient-to-br from-neutral-pearl via-neutral-dust to-neutral-stone">
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-sage/5 to-neutral-mist/5"></div>
          <div className="relative container mx-auto px-4 py-24 lg:py-32">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-neutral-sage/10 border border-neutral-sage/20 rounded-full text-sm text-neutral-sage-foreground mb-8">
                <span className="w-2 h-2 bg-neutral-sage rounded-full mr-2 animate-pulse"></span>
                Transform your learning experience
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-pearl-foreground mb-8 leading-tight">
                Turn YouTube into Your Learning Platform
              </h1>

              <p className="text-xl lg:text-2xl text-neutral-stone-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                Take smart notes, get AI-powered insights, and transform passive video watching into
                active learning experiences that accelerate your growth.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button
                  size="lg"
                  className="bg-neutral-sage text-neutral-sage-foreground hover:bg-neutral-sage/90 px-8 py-4 text-lg group"
                  asChild
                >
                  <Link href="/register">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neutral-stone bg-neutral-pearl/50 text-neutral-pearl-foreground hover:bg-neutral-stone hover:text-neutral-stone-foreground px-8 py-4 text-lg group"
                  asChild
                >
                  <Link href="/demo">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-8 text-neutral-stone-foreground">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-pearl-foreground">10K+</div>
                  <div className="text-sm">Active Learners</div>
                </div>
                <div className="w-px h-8 bg-neutral-stone"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-pearl-foreground">50K+</div>
                  <div className="text-sm">Notes Created</div>
                </div>
                <div className="w-px h-8 bg-neutral-stone"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-pearl-foreground">95%</div>
                  <div className="text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-neutral-dust">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-dust-foreground mb-6">
                Everything you need to learn smarter
              </h2>
              <p className="text-xl text-neutral-stone-foreground max-w-3xl mx-auto">
                Powerful features designed to enhance your learning journey and maximize retention.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-neutral-pearl border-neutral-stone/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <CardHeader className="pb-4">
                  <div className="p-3 bg-gradient-to-br from-neutral-sage to-neutral-sage/80 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="h-8 w-8 text-neutral-sage-foreground" />
                  </div>
                  <CardTitle className="text-xl text-neutral-pearl-foreground">
                    AI-Powered Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-neutral-stone-foreground leading-relaxed">
                    Get intelligent feedback and insights on your notes with advanced AI analysis
                    that helps you understand concepts deeper.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-neutral-pearl border-neutral-stone/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <CardHeader className="pb-4">
                  <div className="p-3 bg-gradient-to-br from-neutral-mist to-neutral-mist/80 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-8 w-8 text-neutral-mist-foreground" />
                  </div>
                  <CardTitle className="text-xl text-neutral-pearl-foreground">
                    Timestamp Sync
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-neutral-stone-foreground leading-relaxed">
                    Notes automatically sync with video timestamps for seamless review and
                    navigation. Never lose context again.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-neutral-pearl border-neutral-stone/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <CardHeader className="pb-4">
                  <div className="p-3 bg-gradient-to-br from-neutral-clay to-neutral-clay/80 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-neutral-clay-foreground" />
                  </div>
                  <CardTitle className="text-xl text-neutral-pearl-foreground">
                    Smart Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-neutral-stone-foreground leading-relaxed">
                    Organize your learning with courses, tags, and intelligent categorization that
                    adapts to your learning style.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-neutral-pearl border-neutral-stone/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <CardHeader className="pb-4">
                  <div className="p-3 bg-gradient-to-br from-neutral-sage to-neutral-mist rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-neutral-pearl-foreground">
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-neutral-stone-foreground leading-relaxed">
                    Monitor your learning progress with detailed analytics and insights that help
                    you stay motivated and on track.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-r from-neutral-stone to-neutral-mist">
          <div className="container mx-auto px-4">
            <div className="text-center bg-neutral-pearl rounded-3xl p-12 lg:p-16 shadow-2xl max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neutral-sage to-neutral-mist rounded-2xl mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-pearl-foreground mb-6">
                  Ready to Start Learning Smarter?
                </h2>
                <p className="text-xl text-neutral-stone-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of learners who are already transforming their YouTube experience
                  into powerful learning sessions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:opacity-90 px-8 py-4 text-lg group"
                  asChild
                >
                  <Link href="/register">
                    Create Your Free Account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-neutral-stone-foreground">
                  No credit card required • Free forever plan available
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
