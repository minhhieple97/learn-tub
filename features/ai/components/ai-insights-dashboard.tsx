import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, Target, Zap } from "lucide-react"
import { getProfileInSession } from '@/features/profile/queries/profile';

export async function AIInsightsDashboard() {
  const supabase = await createClient();
  const profile = await getProfileInSession();

  // Get AI interaction stats
  const { data: interactions } = await supabase
    .from('ai_interactions')
    .select('interaction_type, created_at, output_data')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const analysisCount =
    interactions?.filter((i) => i.interaction_type === 'note_analysis').length || 0;
  const quizCount =
    interactions?.filter((i) => i.interaction_type === 'quiz_generation').length || 0;
  const studyPlanCount =
    interactions?.filter((i) => i.interaction_type === 'study_plan').length || 0;

  const recentAnalyses = interactions?.filter((i) => i.interaction_type === 'note_analysis') || [];
  const avgComprehension =
    recentAnalyses.length > 0
      ? Math.round(
          recentAnalyses.reduce((sum, analysis) => {
            return sum + (analysis.output_data?.comprehensionScore || 0);
          }, 0) / recentAnalyses.length,
        )
      : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Brain className="h-5 w-5" />
        AI Learning Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Analyses</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisCount}</div>
            <p className="text-xs text-muted-foreground">AI-powered insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Generated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizCount}</div>
            <p className="text-xs text-muted-foreground">Practice assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Plans</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyPlanCount}</div>
            <p className="text-xs text-muted-foreground">Personalized plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Comprehension</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgComprehension}%</div>
            <p className="text-xs text-muted-foreground">From note analysis</p>
          </CardContent>
        </Card>
      </div>

      {recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent AI Insights</CardTitle>
            <CardDescription>Latest feedback from your learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalyses.slice(0, 3).map((analysis, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm font-medium">
                    Comprehension Score: {analysis.output_data?.comprehensionScore}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                  {analysis.output_data?.summary && (
                    <p className="text-sm mt-1 line-clamp-2">{analysis.output_data.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
