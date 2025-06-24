import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";
import { StatsDisplay } from "./stats-display";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/30">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
      <div className="container relative mx-auto px-4 py-24 lg:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 mb-8 inline-flex items-center rounded-full px-4 py-2 text-sm backdrop-blur-sm">
            <span className="bg-blue-600 mr-2 size-2 animate-pulse rounded-full"></span>
            Transform your learning experience
          </div>

          <h1 className="text-slate-900 dark:text-slate-100 mb-8 text-5xl font-bold leading-tight lg:text-7xl">
            Turn YouTube into Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learning Platform
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 mx-auto mb-12 max-w-4xl text-xl leading-relaxed lg:text-2xl">
            Take smart notes, get AI-powered insights, and transform passive
            video watching into active learning experiences that accelerate your
            growth.
          </p>

          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 group px-8 py-4 text-lg shadow-xl"
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
              className="border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 group px-8 py-4 text-lg backdrop-blur-sm"
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
