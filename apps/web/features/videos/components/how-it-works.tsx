import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rocket } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Import YouTube Video",
      description:
        "Paste any YouTube URL to automatically fetch video details and metadata",
      color: "from-blue-500 to-blue-600",
    },
    {
      number: 2,
      title: "Take Smart Notes",
      description:
        "Notes automatically sync with video timestamps for seamless review and navigation",
      color: "from-green-500 to-green-600",
    },
    {
      number: 3,
      title: "Get AI Insights",
      description:
        "Receive intelligent feedback, quizzes, and personalized study plans",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <Card className="h-full flex flex-col border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          How It Works
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Get the most out of LearnTub in 3 simple steps
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col  space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start space-x-4">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${step.color} text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg`}
            >
              {step.number}
            </div>
            <div>
              <h4
                className={`font-semibold text-${step.color.split("-")[0]}-900 dark:text-${
                  step.color.split("-")[0]
                }-100 mb-1`}
              >
                {step.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
