import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, ArrowRight } from "lucide-react";

type IEvaluationWelcomeProps = {
  onStartAnalysis: () => void;
};

export const EvaluationWelcome = ({
  onStartAnalysis,
}: IEvaluationWelcomeProps) => {
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardContent className="pt-8 pb-8">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Get AI-Powered Insights
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Analyze your learning notes with advanced AI to receive
              personalized feedback on accuracy, clarity, and suggestions for
              improvement.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Content Analysis
            </Badge>
            <Badge
              variant="outline"
              className="border-green-200 text-green-700"
            >
              Accuracy Check
            </Badge>
            <Badge
              variant="outline"
              className="border-purple-200 text-purple-700"
            >
              Improvement Tips
            </Badge>
          </div>
          <Button
            onClick={onStartAnalysis}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Analysis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
