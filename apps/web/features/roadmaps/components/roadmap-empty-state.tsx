import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export const RoadmapEmptyState = () => {
  return (
    <Card className="p-8 text-center">
      <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-semibold mb-2">No roadmaps yet</h3>
      <p className="text-slate-600 dark:text-slate-300">
        Use the chat below to create your first learning roadmap.
      </p>
    </Card>
  );
};
