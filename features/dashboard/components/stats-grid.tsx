import { BookOpen, Clock, TrendingUp, Video } from 'lucide-react';
import { StatCard } from './stat-card';
import type { DashboardStats } from '../types';

type StatsGridProps = {
  stats: DashboardStats;
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const statCards = [
    {
      title: 'Total Videos',
      value: stats.totalVideos,
      change: '+2 from last week',
      icon: Video,
    },
    {
      title: 'Learning Time',
      value: stats.learningTime,
      change: '+4h from last week',
      icon: Clock,
    },
    {
      title: 'Notes Created',
      value: stats.notesCreated,
      change: '+12 from last week',
      icon: BookOpen,
    },
    {
      title: 'Streak',
      value: `${stats.streak} days`,
      change: 'Keep it up!',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
