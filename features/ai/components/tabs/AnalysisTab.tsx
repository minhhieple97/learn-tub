import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Loader2,
  Sparkles,
  TrendingUp,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { NoteAnalysis } from '../../hooks/useAIAssistant';

interface AnalysisTabProps {
  isLoading: boolean;
  analysis: NoteAnalysis | null;
  handleAnalyzeNotes: () => Promise<void>;
  getScoreColor: (score: number) => string;
}

export function AnalysisTab({
  isLoading,
  analysis,
  handleAnalyzeNotes,
  getScoreColor,
}: AnalysisTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Button
          onClick={handleAnalyzeNotes}
          disabled={isLoading}
          className="bg-primary px-6 py-2.5 text-sm font-medium rounded-xl shadow-lg transition-all duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Notes...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze My Notes
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-5">
          {/* Score Header */}
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-neutral-sage border border-neutral-stone rounded-xl">
              <TrendingUp className="h-4 w-4 mr-2 text-neutral-sage" />
              <span className="text-sm font-semibold text-neutral-sage">
                {analysis.comprehensionScore}% Comprehension
              </span>
            </div>
          </div>

          {/* Analysis Cards */}
          <div className="space-y-4">
            <AnalysisCard title="Summary" icon={<BookOpen className="h-4 w-4 text-neutral-sage" />}>
              <p className="text-neutral-stone leading-relaxed text-sm">{analysis.summary}</p>
            </AnalysisCard>

            <AnalysisCard
              title="Key Points"
              icon={<CheckCircle className="h-4 w-4 text-neutral-sage" />}
            >
              <div className="space-y-2">
                {analysis.keyPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-neutral-sage border border-neutral-stone rounded-lg"
                  >
                    <div className="flex-shrink-0 w-5 h-5 bg-neutral-mist text-neutral-mist rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-neutral-stone leading-relaxed text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </AnalysisCard>

            {analysis.knowledgeGaps.length > 0 && (
              <AnalysisCard
                title="Knowledge Gaps"
                icon={<AlertTriangle className="h-4 w-4 text-neutral-clay" />}
              >
                <div className="space-y-2">
                  {analysis.knowledgeGaps.map((gap, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-neutral-clay rounded-lg border-l-4 border-neutral-clay"
                    >
                      <AlertTriangle className="h-4 w-4 text-neutral-clay mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-clay leading-relaxed text-sm">{gap}</span>
                    </div>
                  ))}
                </div>
              </AnalysisCard>
            )}

            <AnalysisCard
              title="AI Suggestions"
              icon={<Lightbulb className="h-4 w-4 text-neutral-mist" />}
            >
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-neutral-mist rounded-lg border-l-4 border-neutral-mist"
                  >
                    <Lightbulb className="h-4 w-4 text-neutral-mist mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-mist leading-relaxed text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </AnalysisCard>
          </div>
        </div>
      )}
    </div>
  );
}

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function AnalysisCard({ title, icon, children }: AnalysisCardProps) {
  return (
    <Card className="border border-neutral-stone bg-neutral-dust shadow-sm rounded-xl">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center text-base font-semibold text-neutral-dust">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">{children}</CardContent>
    </Card>
  );
}
