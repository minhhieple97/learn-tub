import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Lightbulb, Copy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AI_EVALUATION } from '@/config/constants';
import type { AIFeedback } from '../types';

type AIFeedbackDisplayProps = {
  feedback: AIFeedback;
  onCopy?: () => void;
  onReset?: () => void;
};

export const AIFeedbackDisplay = ({ feedback, onCopy, onReset }: AIFeedbackDisplayProps) => {
  const handleCopyFeedback = async () => {
    const formattedFeedback = formatFeedbackForCopy(feedback);

    try {
      await navigator.clipboard.writeText(formattedFeedback);
      toast.success(AI_EVALUATION.FEEDBACK_COPY_SUCCESS);
      onCopy?.();
    } catch (error) {
      toast.error(AI_EVALUATION.FEEDBACK_COPY_ERROR);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= AI_EVALUATION.SCORE_EXCELLENT_THRESHOLD) return 'bg-green-500';
    if (score >= AI_EVALUATION.SCORE_GOOD_THRESHOLD) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium">AI Evaluation</CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getScoreColor(feedback.overall_score)} text-white`}
          >
            {feedback.overall_score}/10
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleCopyFeedback} className="h-8 w-8 p-0">
            <Copy className="h-4 w-4" />
          </Button>
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 w-8 p-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Summary</h4>
          <p className="text-sm">{feedback.summary}</p>
        </div>

        {/* Correct Points */}
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

        {/* Incorrect Points */}
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

        {/* Improvement Suggestions */}
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

        {/* Detailed Analysis */}
        {feedback.detailed_analysis && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Detailed Analysis</h4>
            <p className="text-sm whitespace-pre-wrap">{feedback.detailed_analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const formatFeedbackForCopy = (feedback: AIFeedback): string => {
  return `AI Evaluation Feedback

Summary: ${feedback.summary}

Overall Score: ${feedback.overall_score}/10

Correct Points:
${feedback.correct_points.map((point) => `• ${point}`).join('\n')}

Points to Review:
${feedback.incorrect_points.map((point) => `• ${point}`).join('\n')}

Improvement Suggestions:
${feedback.improvement_suggestions.map((suggestion) => `• ${suggestion}`).join('\n')}

Detailed Analysis:
${feedback.detailed_analysis}`;
};
