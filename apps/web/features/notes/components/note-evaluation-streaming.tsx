import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type NoteEvaluationStreamingProps = {
  content: string;
  isEvaluating: boolean;
};

export const NoteEvaluationStreaming = ({
  content,
  isEvaluating,
}: NoteEvaluationStreamingProps) => {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          {isEvaluating && <Loader2 className="h-4 w-4 animate-spin" />}
          AI Evaluation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg">
          <div className="text-sm whitespace-pre-wrap font-mono">
            {content}
            {isEvaluating && <span className="animate-pulse">|</span>}
          </div>
          {isEvaluating && (
            <div className="mt-2 text-xs text-muted-foreground">
              AI is analyzing your note...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
