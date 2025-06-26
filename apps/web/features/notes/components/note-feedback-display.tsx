import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Lightbulb, Copy, RotateCcw } from "lucide-react";
import { TOAST_MESSAGES } from "@/config/constants";
import { toast } from "@/hooks/use-toast";
import { formatFeedbackForCopy, getScoreColor } from "@/lib/utils";
import { IFeedback } from "@/types";

type NoteFeedbackDisplayProps = {
  feedback: IFeedback;
  onCopy?: () => void;
  onReset?: () => void;
};

export const NoteFeedbackDisplay = ({
  feedback,
  onCopy,
  onReset,
}: NoteFeedbackDisplayProps) => {
  const handleCopyFeedback = async () => {
    const formattedFeedback = formatFeedbackForCopy(feedback);

    try {
      await navigator.clipboard.writeText(formattedFeedback);
      toast.success({ description: TOAST_MESSAGES.FEEDBACK_COPY_SUCCESS });
      onCopy?.();
    } catch (error) {
      toast.error({ description: TOAST_MESSAGES.FEEDBACK_COPY_ERROR });
    }
  };

  return (
    <Card
      className="mt-4 flex flex-col overflow-hidden"
      style={{
        maxHeight: "60vh",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0 border-b">
        <CardTitle className="text-lg font-medium">AI Evaluation</CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getScoreColor(
              feedback.overall_score,
            )} text-white border-0`}
          >
            {feedback.overall_score}/10
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyFeedback}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4 pb-6">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Summary
          </h4>
          <p className="text-sm">{feedback.summary}</p>
        </div>

        {feedback.correct_points.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Correct Points
            </h4>
            <ul className="space-y-1">
              {feedback.correct_points.map((point, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.incorrect_points.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Points to Review
            </h4>
            <ul className="space-y-1">
              {feedback.incorrect_points.map((point, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvement_suggestions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Improvement Suggestions
            </h4>
            <ul className="space-y-1">
              {feedback.improvement_suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.detailed_analysis && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Detailed Analysis
            </h4>
            <p className="text-sm whitespace-pre-wrap">
              {feedback.detailed_analysis}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
