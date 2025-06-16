import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Check, Zap, Star, Crown } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/routes';

export const PricingSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-200/50 bg-blue-50/80 px-4 py-2 text-sm text-blue-700 backdrop-blur-sm dark:border-blue-400/30 dark:bg-blue-900/30 dark:text-blue-300">
            <Zap className="mr-2 size-4" />
            Simple, transparent pricing
          </div>
          <h2 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
            Choose Your Learning Plan
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300">
            Start free and upgrade as you grow. All plans include unlimited
            note-taking.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Basic Plan */}
            <Card className="relative overflow-hidden border border-slate-200/50 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-700/50 dark:bg-slate-800/80 dark:hover:shadow-blue-400/20">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="w-fit rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3">
                    <BookOpen className="size-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">
                  Basic
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Perfect for getting started with AI-powered learning
                </CardDescription>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    Free
                  </span>
                  <span className="ml-2 text-lg text-slate-600 dark:text-slate-400">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Unlimited note-taking
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      50 AI credits per month
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Basic AI note evaluation
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      AI quiz generation
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  asChild
                >
                  <Link href={routes.login}>Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative overflow-hidden border border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 ring-2 ring-blue-200/50 dark:border-blue-400/30 dark:from-blue-900/20 dark:to-indigo-900/20 dark:ring-blue-400/30">
              <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1">
                <span className="text-xs font-semibold text-white">
                  POPULAR
                </span>
              </div>
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="w-fit rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
                    <Star className="size-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">
                  Pro
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  For serious learners who want more AI-powered insights
                </CardDescription>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    $2
                  </span>
                  <span className="ml-2 text-lg text-slate-600 dark:text-slate-400">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Everything in Basic
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      500 AI credits per month
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Advanced AI analysis
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Priority support
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Export capabilities
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                  asChild
                >
                  <Link href={routes.login}>Start Pro Trial</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative overflow-hidden border border-slate-200/50 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10 dark:border-slate-700/50 dark:bg-slate-800/80 dark:hover:shadow-purple-400/20">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="w-fit rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3">
                    <Crown className="size-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">
                  Premium
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  For power users and professional learners
                </CardDescription>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    $5
                  </span>
                  <span className="ml-2 text-lg text-slate-600 dark:text-slate-400">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Everything in Pro
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      1,500 AI credits per month
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Premium AI models
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Advanced analytics
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 size-5 text-green-500 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      API access
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-purple-200 bg-white/50 text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400/30 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-purple-900/20 dark:hover:text-purple-300"
                  asChild
                >
                  <Link href={routes.login}>Go Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Credits */}
          <div className="mt-12 text-center">
            <Card className="mx-auto max-w-2xl border border-blue-200/50 bg-blue-50/50 backdrop-blur-sm dark:border-blue-400/30 dark:bg-blue-900/20">
              <CardContent className="p-8">
                <div className="mb-4">
                  <Zap className="mx-auto mb-3 size-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
                    Need More Credits?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Purchase additional credits anytime for just{' '}
                    <span className="font-semibold">$1 for 200 credits</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-400/30 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
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
};
