"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle } from "lucide-react";

type StrengthsCardProps = {
  strengths: string[];
};

export const StrengthsCard = ({ strengths }: StrengthsCardProps) => {
  return (
    <Card className="border-emerald-300 dark:border-emerald-700">
      <CardHeader className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50">
        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <TrendingUp className="size-5" />
          Strengths
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-800 dark:text-slate-300">
                {strength}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
