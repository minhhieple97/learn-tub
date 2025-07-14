"use client";

import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Home,
  Play,
  ChevronLeft,
  Menu,
  Settings,
  Map,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/routes";
import { useState } from "react";

const navigation = [
  { name: "Learn", href: routes.learn, icon: Play },
  { name: "Roadmaps", href: routes.roadmaps.root, icon: Map },
  { name: "Dashboard", href: routes.dashboard.root, icon: Home },
  { name: "Settings", href: routes.settings.root, icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "p-2" : "p-6",
        )}
      >
        {!isCollapsed && (
          <div className="mb-8 flex items-center justify-between">
            <Link href={routes.home} className="flex items-center space-x-2">
              <BookOpen className="size-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                LearnTub
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={cn(
                "h-8 w-8 p-0 rounded-full transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "border border-gray-200 dark:border-gray-600",
                "bg-white dark:bg-gray-800 shadow-sm",
                "hover:shadow-md hover:scale-105",
                "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              )}
              title="Collapse sidebar"
            >
              <ChevronLeft className="size-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        )}

        {isCollapsed && (
          <div className="mb-6 flex flex-col items-center space-y-4">
            <Link href={routes.home}>
              <BookOpen className="size-8 text-blue-600" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={cn(
                "h-8 w-8 p-0 rounded-full transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "border border-gray-200 dark:border-gray-600",
                "bg-white dark:bg-gray-800 shadow-sm",
                "hover:shadow-md hover:scale-105",
                "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              )}
              title="Expand sidebar"
            >
              <Menu className="size-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        )}

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full transition-all duration-200",
                  isCollapsed ? "justify-center p-2 h-10" : "justify-start",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700",
                )}
                asChild
                title={isCollapsed ? item.name : undefined}
              >
                <Link href={item.href}>
                  <item.icon
                    className={cn("h-4 w-4", !isCollapsed && "mr-2")}
                  />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
