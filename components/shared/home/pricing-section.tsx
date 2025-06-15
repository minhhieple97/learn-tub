import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Zap, Star, Crown } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";

export function PricingSection() {
  return (
    <section className="bg-neutral-pearl py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="bg-neutral-sage/10 border-neutral-sage/20 text-neutral-sage-foreground mb-6 inline-flex items-center rounded-full border px-4 py-2 text-sm">
            <Zap className="mr-2 size-4" />
            Simple, transparent pricing
          </div>
          <h2 className="text-neutral-pearl-foreground mb-6 text-4xl font-bold lg:text-5xl">
            Choose Your Learning Plan
          </h2>
          <p className="text-neutral-stone-foreground mx-auto max-w-3xl text-xl">
            Start free and upgrade as you grow. All plans include unlimited
            note-taking.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Basic Plan */}
            <Card className="bg-neutral-dust border-neutral-stone/20 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="from-neutral-mist to-neutral-mist/80 w-fit rounded-xl bg-gradient-to-br p-3">
                    <BookOpen className="text-neutral-mist-foreground size-6" />
                  </div>
                </div>
                <CardTitle className="text-neutral-dust-foreground text-2xl">
                  Basic
                </CardTitle>
                <CardDescription className="text-neutral-stone-foreground">
                  Perfect for getting started with AI-powered learning
                </CardDescription>
                <div className="flex items-baseline">
                  <span className="text-neutral-dust-foreground text-4xl font-bold">
                    Free
                  </span>
                  <span className="text-neutral-stone-foreground ml-2 text-lg">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      Unlimited note-taking
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      50 AI credits per month
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      Basic AI note evaluation
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      AI quiz generation
                    </span>
                  </div>
                </div>
                <Button
                  className="bg-neutral-sage text-neutral-sage-foreground hover:bg-neutral-sage/90 w-full"
                  asChild
                >
                  <Link href={routes.register}>Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-neutral-pearl border-neutral-sage/30 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ring-2 ring-neutral-sage/20">
              <div className="bg-neutral-sage absolute right-4 top-4 rounded-full px-3 py-1">
                <span className="text-neutral-sage-foreground text-xs font-semibold">
                  POPULAR
                </span>
              </div>
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="from-neutral-sage to-neutral-sage/80 w-fit rounded-xl bg-gradient-to-br p-3">
                    <Star className="text-neutral-sage-foreground size-6" />
                  </div>
                </div>
                <CardTitle className="text-neutral-pearl-foreground text-2xl">
                  Pro
                </CardTitle>
                <CardDescription className="text-neutral-stone-foreground">
                  For serious learners who want more AI-powered insights
                </CardDescription>
                <div className="flex items-baseline">
                  <span className="text-neutral-pearl-foreground text-4xl font-bold">
                    $2
                  </span>
                  <span className="text-neutral-stone-foreground ml-2 text-lg">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-pearl-foreground">
                      Everything in Basic
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-pearl-foreground font-semibold">
                      500 AI credits per month
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-pearl-foreground">
                      Advanced AI analysis
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-pearl-foreground">
                      Priority support
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-pearl-foreground">
                      Export capabilities
                    </span>
                  </div>
                </div>
                <Button
                  className="bg-neutral-sage text-neutral-sage-foreground hover:bg-neutral-sage/90 w-full"
                  asChild
                >
                  <Link href={routes.register}>Start Pro Trial</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-neutral-dust border-neutral-stone/20 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="from-neutral-clay to-neutral-clay/80 w-fit rounded-xl bg-gradient-to-br p-3">
                    <Crown className="text-neutral-clay-foreground size-6" />
                  </div>
                </div>
                <CardTitle className="text-neutral-dust-foreground text-2xl">
                  Premium
                </CardTitle>
                <CardDescription className="text-neutral-stone-foreground">
                  For power users and professional learners
                </CardDescription>
                <div className="flex items-baseline">
                  <span className="text-neutral-dust-foreground text-4xl font-bold">
                    $5
                  </span>
                  <span className="text-neutral-stone-foreground ml-2 text-lg">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      Everything in Pro
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground font-semibold">
                      1,500 AI credits per month
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      Premium AI models
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      Advanced analytics
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-neutral-sage mr-3 size-5" />
                    <span className="text-neutral-dust-foreground">
                      API access
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-neutral-stone bg-neutral-dust text-neutral-dust-foreground hover:bg-neutral-stone hover:text-neutral-stone-foreground w-full"
                  asChild
                >
                  <Link href={routes.register}>Go Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Credits */}
          <div className="mt-12 text-center">
            <Card className="bg-neutral-mist/50 border-neutral-stone/20 mx-auto max-w-2xl">
              <CardContent className="p-8">
                <div className="mb-4">
                  <Zap className="text-neutral-sage mx-auto mb-3 size-8" />
                  <h3 className="text-neutral-mist-foreground mb-2 text-xl font-semibold">
                    Need More Credits?
                  </h3>
                  <p className="text-neutral-stone-foreground">
                    Purchase additional credits anytime for just{" "}
                    <span className="font-semibold">$1 for 200 credits</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-neutral-sage text-neutral-sage hover:bg-neutral-sage hover:text-neutral-sage-foreground"
                  asChild
                >
                  <Link href={routes.register}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
