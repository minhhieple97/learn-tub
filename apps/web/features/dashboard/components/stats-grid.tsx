import { BookOpen, Clock, TrendingUp, Video } from "lucide-react";
import { StatCard } from "./stat-card";
import type { IDashboardStats } from "../types";

type StatsGridProps = {
  stats: IDashboardStats;
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const statCards = [
    {
      title: "Total Videos",
      value: stats.totalVideos,
      change: stats.totalVideosChange,
      icon: Video,
    },
    {
      title: "Learning Time",
      value: stats.learningTime,
      change: stats.learningTimeChange,
      icon: Clock,
    },
    {
      title: "Notes Created",
      value: stats.notesCreated,
      change: stats.notesCreatedChange,
      icon: BookOpen,
    },
    {
      title: "Streak",
      value: `${stats.streak} days`,
      change: stats.streakChange,
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
