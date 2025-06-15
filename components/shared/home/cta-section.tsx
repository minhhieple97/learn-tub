import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-24">
      <div className="container mx-auto px-4">
        <div className="bg-white/95 dark:bg-slate-800/95 mx-auto max-w-4xl rounded-3xl p-12 text-center shadow-2xl backdrop-blur-sm border border-white/20 dark:border-slate-700/50 lg:p-16">
          <div className="mb-8">
            <div className="from-blue-500 to-indigo-500 mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
              <BookOpen className="size-8 text-white" />
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 mb-6 text-4xl font-bold lg:text-5xl">
              Ready to Start{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Learning Smarter?
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mx-auto mb-8 max-w-2xl text-xl leading-relaxed">
              Join thousands of learners who are already transforming their
              YouTube experience into powerful learning sessions.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-8 py-4 text-lg shadow-xl"
              asChild
            >
              <Link href={routes.register}>
                Create Your Free Account
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
