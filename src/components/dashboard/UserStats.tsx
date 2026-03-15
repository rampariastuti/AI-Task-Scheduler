"use client";

import { DashboardCard } from "@/components/ui/DashboardCard";
import { CheckCircle2, Clock, Star, Zap } from "lucide-react";

interface UserStatsProps {
  completedCount: number;
  totalCount: number;
}

export const UserStats = ({ completedCount, totalCount }: UserStatsProps) => {
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <DashboardCard 
        title="Completed" 
        value={completedCount} 
        icon={CheckCircle2} 
        trend={completionRate} 
      />
      <DashboardCard 
        title="Active" 
        value={totalCount - completedCount} 
        icon={Clock} 
      />
      <DashboardCard 
        title="Efficiency" 
        value={`${completionRate}%`} 
        icon={Zap} 
      />
      <DashboardCard 
        title="Level" 
        value="Gold" 
        icon={Star} 
      />
    </div>
  );
};