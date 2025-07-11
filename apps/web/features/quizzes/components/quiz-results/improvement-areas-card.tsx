"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, XCircle } from "lucide-react";

type ImprovementAreasCardProps = {
  areas: string[];
};

export const ImprovementAreasCard = ({ areas }: ImprovementAreasCardProps) => {
  return (
    <Card className="border-amber-300 dark:border-amber-700">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Target className="size-5" />
          Areas for Improvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {areas.map((area, index) => (
            <li key={index} className="flex items-start gap-2">
              <XCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="text-slate-800 dark:text-slate-300">{area}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
