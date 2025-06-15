import { RegisterForm } from '@/features/auth/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/routes';
import { redirect } from 'next/navigation';
import { getUserInSession } from '@/features/profile/queries';

export default async function RegisterPage() {
  const user = await getUserInSession();

  if (user) {
    redirect(routes.learn);
  }

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
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Start your learning journey with LearnTub
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <RegisterForm />
          <div className="mt-4 sm:mt-6 text-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
            </span>
            <Link
              href={routes.login}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
