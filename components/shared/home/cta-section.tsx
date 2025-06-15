import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";

export function CTASection() {
  return (
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
              Join thousands of learners who are already transforming their
              YouTube experience into powerful learning sessions.
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
  );
}
