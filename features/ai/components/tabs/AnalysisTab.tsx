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
    <div className="space-y-8">
      <div className="text-center">
        <Button
          onClick={handleAnalyzeNotes}
          disabled={isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-base font-medium rounded-2xl shadow-lg transition-all duration-200"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Notes...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze My Notes
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-8">
          {/* Score Header */}
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-slate-100 rounded-2xl border border-slate-200">
              <TrendingUp className="h-5 w-5 mr-2 text-slate-600" />
              <span className="text-lg font-semibold text-slate-800">
                {analysis.comprehensionScore}% Comprehension
              </span>
            </div>
          </div>

          {/* Analysis Cards */}
          <div className="space-y-6">
            <AnalysisCard title="Summary" icon={<BookOpen className="h-5 w-5 text-blue-600" />}>
              <p className="text-slate-700 leading-relaxed text-base">{analysis.summary}</p>
            </AnalysisCard>

            <AnalysisCard
              title="Key Points"
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            >
              <div className="space-y-3">
                {analysis.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-slate-700 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </AnalysisCard>

            {analysis.knowledgeGaps.length > 0 && (
              <AnalysisCard
                title="Knowledge Gaps"
                icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
              >
                <div className="space-y-3">
                  {analysis.knowledgeGaps.map((gap, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 leading-relaxed">{gap}</span>
                    </div>
                  ))}
                </div>
              </AnalysisCard>
            )}

            <AnalysisCard
              title="AI Suggestions"
              icon={<Lightbulb className="h-5 w-5 text-purple-600" />}
            >
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border-l-4 border-purple-400"
                  >
                    <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 leading-relaxed">{suggestion}</span>
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
    <Card className="border border-slate-200 shadow-sm rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-semibold text-slate-800">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
