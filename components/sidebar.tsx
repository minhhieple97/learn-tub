"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Home, Play, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { routes } from '@/routes';

const navigation = [
  { name: 'Learn', href: routes.learn, icon: Play },
  { name: 'Dashboard', href: routes.dashboard.root, icon: Home },
  { name: 'Settings', href: routes.settings.root, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">LearnTub</span>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-blue-600 text-white hover:bg-blue-700")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
