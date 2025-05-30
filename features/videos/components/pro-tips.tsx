import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export function ProTips() {
  const tips = [
    {
      icon: "⌨️",
      title: "Use keyboard shortcuts",
      description: "Space: Play/Pause, N: New Note",
      color: "bg-amber-500",
    },
    {
      icon: "🏷️",
      title: "Tag your notes",
      description: "Organize with custom tags for easy searching",
      color: "bg-amber-500",
    },
    {
      icon: "🤖",
      title: "Try AI analysis",
      description: "Get comprehension scores and study suggestions",
      color: "bg-amber-500",
    },
  ]

  return (
    <Card className="border border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-amber-900 dark:text-amber-100 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Pro Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start space-x-3 group">
            <div
              className={`w-8 h-8 ${tip.color} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}
            >
              {tip.icon}
            </div>
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">{tip.title}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{tip.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
