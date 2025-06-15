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
    <section className="bg-neutral-dust py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-neutral-dust-foreground mb-6 text-4xl font-bold lg:text-5xl">
            Everything you need to learn smarter
          </h2>
          <p className="text-neutral-stone-foreground mx-auto max-w-3xl text-xl">
            Powerful features designed to enhance your learning journey and
            maximize retention.
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
                Get intelligent feedback and insights on your notes with
                advanced AI analysis that helps you understand concepts deeper.
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
                Notes automatically sync with video timestamps for seamless
                review and navigation. Never lose context again.
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
                Organize your learning with courses, tags, and intelligent
                categorization that adapts to your learning style.
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
