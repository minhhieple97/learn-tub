import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ILearningGoal } from "../types";

type LearningGoalsCardProps = {
  goals: ILearningGoal[];
};

export const LearningGoalsCard = ({ goals }: LearningGoalsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Goals</CardTitle>
        <CardDescription>Your progress towards weekly goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{goal.title}</span>
                <span>
                  {goal.current}/{goal.target}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${goal.color}`}
                  style={{ width: `${goal.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
