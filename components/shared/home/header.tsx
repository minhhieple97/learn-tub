import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/react-query/theme-toggle";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";
import { getUserInSession } from '@/features/profile/queries';

export async function Header() {
  const user = await getUserInSession();
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto p-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg">
              <BookOpen className="text-white size-6" />
            </div>
            <Link
              href={routes.home}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
            >
              LearnTub
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              asChild
            >
              {user ? (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  asChild
                >
                  <Link href={routes.learn}>Learn Now</Link>
                </Button>
              ) : (
                <Link href={routes.login}>Login</Link>
              )}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
