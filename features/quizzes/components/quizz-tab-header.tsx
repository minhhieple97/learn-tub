import { Brain } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';

export const QuizzTabHeader = () => {
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
      </CardHeader>
    </Card>
  );
};
