"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Home, Play, Settings, TrendingUp } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, color: "text-blue-600" },
  { name: "Learn", href: "/learn", icon: Play, color: "text-emerald-600" },
  { name: "My Courses", href: "/courses", icon: BookOpen, color: "text-purple-600" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-slate-600" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-slate-200/60 shadow-sm">
      <div className="p-6">
        {/* Enhanced Logo */}
        <div className="flex items-center space-x-3 mb-8 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LearnTub
            </span>
            <p className="text-xs text-slate-500 font-medium">Learning Platform</p>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-4 text-left font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-200/60 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent",
                )}
                asChild
              >
                <Link href={item.href}>
                  <div
                    className={cn(
                      "p-2 rounded-lg mr-3 transition-colors",
                      isActive ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : item.color)} />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </Link>
              </Button>
            )
          })}
        </nav>

        {/* Progress Section */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">Weekly Progress</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Learning Goal</span>
              <span className="font-medium text-slate-900">75%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full w-3/4 shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
