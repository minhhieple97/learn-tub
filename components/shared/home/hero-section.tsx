import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";
import { StatsDisplay } from "./stats-display";

export function HeroSection() {
  return (
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
            Take smart notes, get AI-powered insights, and transform passive
            video watching into active learning experiences that accelerate your
            growth.
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

          <StatsDisplay />
        </div>
      </div>
    </section>
  );
}
