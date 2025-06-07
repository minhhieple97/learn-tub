import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatCard as StatCardType } from '../types';

type StatCardProps = StatCardType;

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
};
