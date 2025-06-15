import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/routes';

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 sm:mb-8 text-center">
        <Link
          href={routes.home}
          className="mb-4 flex items-center justify-center space-x-3 transition-transform hover:scale-105"
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg">
            <BookOpen className="size-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
            LearnTub
          </span>
        </Link>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-4">
          {/* Google Auth Button Skeleton */}
          <Skeleton className="h-10 w-full" />
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          
          {/* Form Fields Skeleton */}
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 sm:h-11 w-full" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 sm:h-11 w-full" />
            </div>
            <div className="pt-2 sm:pt-4">
              <Skeleton className="h-10 sm:h-11 w-full" />
            </div>
          </div>
          
          {/* Bottom Link Skeleton */}
          <div className="mt-4 sm:mt-6 text-center">
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
