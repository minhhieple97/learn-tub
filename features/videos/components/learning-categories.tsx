import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Code, FlaskRoundIcon as Flask, Calculator, Globe, Palette, Music, Dumbbell } from "lucide-react"
import Link from "next/link"

export function LearningCategories() {
  const categories = [
    {
      name: "Programming",
      icon: Code,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconBg: "bg-blue-400/20",
      borderColor: "border-blue-400/30",
      textColor: "text-blue-100",
      description: "Web, mobile & software development",
    },
    {
      name: "Science",
      icon: Flask,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      iconBg: "bg-green-400/20",
      borderColor: "border-green-400/30",
      textColor: "text-green-100",
      description: "Physics, chemistry & biology",
    },
    {
      name: "Mathematics",
      icon: Calculator,
      color: "bg-gradient-to-br from-purple-500 to-violet-600",
      iconBg: "bg-purple-400/20",
      borderColor: "border-purple-400/30",
      textColor: "text-purple-100",
      description: "Algebra, calculus & statistics",
    },
    {
      name: "Languages",
      icon: Globe,
      color: "bg-gradient-to-br from-orange-500 to-amber-600",
      iconBg: "bg-orange-400/20",
      borderColor: "border-orange-400/30",
      textColor: "text-orange-100",
      description: "Learn new languages & cultures",
    },
    {
      name: "Art & Design",
      icon: Palette,
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      iconBg: "bg-pink-400/20",
      borderColor: "border-pink-400/30",
      textColor: "text-pink-100",
      description: "Drawing, painting & digital design",
    },
    {
      name: "Music",
      icon: Music,
      color: "bg-gradient-to-br from-cyan-500 to-teal-600",
      iconBg: "bg-cyan-400/20",
      borderColor: "border-cyan-400/30",
      textColor: "text-cyan-100",
      description: "Instruments, theory & production",
    },
    {
      name: "Fitness",
      icon: Dumbbell,
      color: "bg-gradient-to-br from-red-500 to-rose-600",
      iconBg: "bg-red-400/20",
      borderColor: "border-red-400/30",
      textColor: "text-red-100",
      description: "Workouts, nutrition & wellness",
    },
    {
      name: "All Categories",
      icon: Sparkles,
      color: "bg-gradient-to-br from-slate-600 to-slate-700",
      iconBg: "bg-slate-400/20",
      borderColor: "border-slate-400/30",
      textColor: "text-slate-100",
      description: "Explore all learning categories",
    },
  ]

  return (
    <Card className="border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Popular Learning Categories
        </CardTitle>
        <CardDescription>Try these example videos to get started with your learning journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(
            (category) =>
              (
                <Link
              key={category.name}
              href="#"
              className={`${category.color} rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex flex-col h-32 justify-between overflow-hidden relative group`}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fillOpacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${category.iconBg} border ${category.borderColor}`}>
                  {category.icon && <category.icon className="h-5 w-5 text-white" />}
                </div>
                <h3 className="font-semibold text-white">{category.name}</h3>
              </div>
              <p className={`text-xs ${category.textColor} opacity-90`}>{category.description}</p>
            </Link>
              ),
          )}
        </div>
      </CardContent>
    </Card>
  )
}
