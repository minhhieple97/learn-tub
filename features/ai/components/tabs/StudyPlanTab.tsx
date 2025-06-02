import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Target, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface StudyPlanTabProps {
  isLoading: boolean;
  studyPlan: string | null;
  learningGoals: string;
  setLearningGoals: (goals: string) => void;
  handleGenerateStudyPlan: () => Promise<void>;
}

export function StudyPlanTab({
  isLoading,
  studyPlan,
  learningGoals,
  setLearningGoals,
  handleGenerateStudyPlan,
}: StudyPlanTabProps) {
  return (
    <div className="space-y-8">
      <Card className="border border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-semibold text-slate-800">
            <Target className="h-5 w-5 mr-2 text-slate-600" />
            Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Textarea
              placeholder="What do you want to achieve? (e.g., 'Master React hooks', 'Understand TypeScript basics', 'Prepare for technical interview')"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="min-h-[120px] text-base border-slate-300 rounded-xl resize-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <Button
            onClick={handleGenerateStudyPlan}
            disabled={isLoading || !learningGoals.trim()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Study Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Personalized Study Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {studyPlan && (
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-2xl">
            <CardTitle className="flex items-center text-xl font-semibold text-slate-800">
              <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
              Your Personalized Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed space-y-4">
                {studyPlan.split('\n').map((line, index) => {
                  // Handle headers (lines that start with #)
                  if (line.startsWith('###')) {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-semibold text-slate-800 mt-6 mb-3 flex items-center"
                      >
                        <ArrowRight className="h-4 w-4 mr-2 text-slate-600" />
                        {line.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  if (line.startsWith('##')) {
                    return (
                      <h2
                        key={index}
                        className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center"
                      >
                        <Target className="h-5 w-5 mr-2 text-slate-600" />
                        {line.replace('##', '').trim()}
                      </h2>
                    );
                  }
                  if (line.startsWith('#')) {
                    return (
                      <h1 key={index} className="text-2xl font-bold text-slate-800 mt-8 mb-6">
                        {line.replace('#', '').trim()}
                      </h1>
                    );
                  }

                  // Handle list items
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <div key={index} className="flex items-start gap-3 py-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full mt-2.5 flex-shrink-0"></div>
                        <span className="text-slate-700">
                          {line.replace(/^[-*]\s*/, '').trim()}
                        </span>
                      </div>
                    );
                  }

                  // Handle numbered lists
                  if (/^\d+\.\s/.test(line)) {
                    const match = line.match(/^(\d+)\.\s(.+)/);
                    if (match) {
                      return (
                        <div key={index} className="flex items-start gap-3 py-1">
                          <div className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {match[1]}
                          </div>
                          <span className="text-slate-700 pt-0.5">{match[2]}</span>
                        </div>
                      );
                    }
                  }

                  // Handle time estimates (lines with time indicators)
                  if (
                    line.includes('min') ||
                    line.includes('hour') ||
                    line.includes('week') ||
                    line.includes('day')
                  ) {
                    return (
                      <div key={index} className="flex items-center gap-2 py-1 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{line.trim()}</span>
                      </div>
                    );
                  }

                  // Regular paragraphs
                  if (line.trim()) {
                    return (
                      <p key={index} className="text-slate-700 leading-relaxed">
                        {line.trim()}
                      </p>
                    );
                  }

                  // Empty lines for spacing
                  return <div key={index} className="h-2"></div>;
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
