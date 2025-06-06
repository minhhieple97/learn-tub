import { RegisterForm } from '@/features/auth/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/routes';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(routes.learn);
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href={routes.home} className="mb-4 flex items-center justify-center space-x-2">
            <BookOpen className="size-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">LearnTub</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Start your learning journey with LearnTub</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
              <Link href={routes.login} className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
