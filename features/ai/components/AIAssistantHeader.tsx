import { Brain } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function AIAssistantHeader() {
  return (
    <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-lg rounded-3xl">
      <CardHeader className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-slate-800 mb-3">
          AI Learning Assistant
        </CardTitle>
        <CardDescription className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unlock deeper insights with AI-powered analysis, personalized quizzes, and tailored study
          plans
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
