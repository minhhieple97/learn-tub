import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/react-query/theme-toggle";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";

export function Header() {
  return (
    <header className="bg-neutral-pearl/80 border-neutral-stone sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto p-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-neutral-sage rounded-xl p-2">
              <BookOpen className="text-neutral-sage-foreground size-6" />
            </div>
            <Link
              href={routes.home}
              className="text-neutral-pearl-foreground text-2xl font-bold"
            >
              LearnTub
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="text-neutral-pearl-foreground hover:bg-neutral-stone hover:text-neutral-stone-foreground"
              asChild
            >
              <Link href={routes.login}>Login</Link>
            </Button>
            <Button
              className="bg-neutral-sage text-neutral-sage-foreground hover:bg-neutral-sage/90"
              asChild
            >
              <Link href={routes.register}>Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
