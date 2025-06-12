import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/shared/react-query/theme-toggle';
import { BookOpen, Brain, Clock, Users, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/routes';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(routes.learn);
  }
  return (
    <div className="bg-neutral-pearl min-h-screen">
      <header className="bg-neutral-pearl/80 border-neutral-stone sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto p-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-neutral-sage rounded-xl p-2">
                <BookOpen className="text-neutral-sage-foreground size-6" />
              </div>
              <Link href={routes.home} className="text-neutral-pearl-foreground text-2xl font-bold">
                LearnTub
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="text-neutral-pearl-foreground hover:bg-neutral-stone hover:text-neutral-stone-foreground"
                asChild
              >
                <Link href={routes.login}>Login</Link>
              </Button>
              <Button
                className="bg-neutral-sage text-neutral-sage-foreground hover:bg-neutral-sage/90"
                asChild
              >
                <Link href={routes.register}>Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="from-neutral-pearl via-neutral-dust to-neutral-stone relative bg-gradient-to-br">
          <div className="from-neutral-sage/5 to-neutral-mist/5 absolute inset-0 bg-gradient-to-r"></div>
          <div className="container relative mx-auto px-4 py-24 lg:py-32">
            <div className="mx-auto max-w-5xl text-center">
              <div className="bg-neutral-sage/10 border-neutral-sage/20 text-neutral-sage-foreground mb-8 inline-flex items-center rounded-full border px-4 py-2 text-sm">
                <span className="bg-neutral-sage mr-2 size-2 animate-pulse rounded-full"></span>
                Transform your learning experience
              </div>

              <h1 className="text-neutral-pearl-foreground mb-8 text-5xl font-bold leading-tight lg:text-7xl">
                Turn YouTube into Your Learning Platform
              </h1>

              <p className="text-neutral-stone-foreground mx-auto mb-12 max-w-4xl text-xl leading-relaxed lg:text-2xl">
                Take smart notes, get AI-powered insights, and transform passive video watching into
                active learning experiences that accelerate your growth.
              </p>

              <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-neutral-sage text-neutral-sage-foreground hover:bg-neutral-sage/90 group px-8 py-4 text-lg"
                  asChild
                >
                  <Link href={routes.register}>
                    Start Learning Free
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neutral-stone bg-neutral-pearl/50 text-neutral-pearl-foreground hover:bg-neutral-stone hover:text-neutral-stone-foreground group px-8 py-4 text-lg"
                  asChild
                >
                  <Link href={routes.demo}>
                    <Play className="mr-2 size-5 transition-transform group-hover:scale-110" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              <div className="text-neutral-stone-foreground flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-neutral-pearl-foreground text-2xl font-bold">10K+</div>
                  <div className="text-sm">Active Learners</div>
                </div>
                <div className="bg-neutral-stone h-8 w-px"></div>
                <div className="text-center">
                  <div className="text-neutral-pearl-foreground text-2xl font-bold">50K+</div>
                  <div className="text-sm">Notes Created</div>
                </div>
                <div className="bg-neutral-stone h-8 w-px"></div>
                <div className="text-center">
                  <div className="text-neutral-pearl-foreground text-2xl font-bold">95%</div>
                  <div className="text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-dust py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-neutral-dust-foreground mb-6 text-4xl font-bold lg:text-5xl">
                Everything you need to learn smarter
              </h2>
              <p className="text-neutral-stone-foreground mx-auto max-w-3xl text-xl">
                Powerful features designed to enhance your learning journey and maximize retention.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-neutral-pearl border-neutral-stone/20 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="from-neutral-sage to-neutral-sage/80 mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110">
                    <Brain className="text-neutral-sage-foreground size-8" />
                  </div>
                  <CardTitle className="text-neutral-pearl-foreground text-xl">
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

              <Card className="bg-neutral-pearl border-neutral-stone/20 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="from-neutral-mist to-neutral-mist/80 mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110">
                    <Clock className="text-neutral-mist-foreground size-8" />
                  </div>
                  <CardTitle className="text-neutral-pearl-foreground text-xl">
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

              <Card className="bg-neutral-pearl border-neutral-stone/20 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="from-neutral-clay to-neutral-clay/80 mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110">
                    <BookOpen className="text-neutral-clay-foreground size-8" />
                  </div>
                  <CardTitle className="text-neutral-pearl-foreground text-xl">
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

              <Card className="bg-neutral-pearl border-neutral-stone/20 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="from-neutral-sage to-neutral-mist mb-4 w-fit rounded-xl bg-gradient-to-br p-3 transition-transform group-hover:scale-110">
                    <Users className="size-8 text-white" />
                  </div>
                  <CardTitle className="text-neutral-pearl-foreground text-xl">
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

        <section className="from-neutral-stone to-neutral-mist bg-gradient-to-r py-24">
          <div className="container mx-auto px-4">
            <div className="bg-neutral-pearl mx-auto max-w-4xl rounded-3xl p-12 text-center shadow-2xl lg:p-16">
              <div className="mb-8">
                <div className="from-neutral-sage to-neutral-mist mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br">
                  <BookOpen className="size-8 text-primary" />
                </div>
                <h2 className="text-neutral-pearl-foreground mb-6 text-4xl font-bold lg:text-5xl">
                  Ready to Start Learning Smarter?
                </h2>
                <p className="text-neutral-stone-foreground mx-auto mb-8 max-w-2xl text-xl leading-relaxed">
                  Join thousands of learners who are already transforming their YouTube experience
                  into powerful learning sessions.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="group bg-primary px-8 py-4 text-lg hover:opacity-90"
                  asChild
                >
                  <Link href={routes.register}>
                    Create Your Free Account
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <p className="text-neutral-stone-foreground text-sm">
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
