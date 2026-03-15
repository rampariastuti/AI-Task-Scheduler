"use client";

import React from "react";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Users, Briefcase, Zap, Target, Clock } from "lucide-react";

interface AdminOverviewProps {
  totalUsers: number;
  activeTasks: number;
  efficiency: number;
  liveConnections?: number;
}

export const AdminOverview = ({ 
  totalUsers, 
  activeTasks, 
  efficiency,
  liveConnections = 0 
}: AdminOverviewProps) => {
  
  // Calculate trend based on live connections percentage
  const liveTrend = Math.round((liveConnections / totalUsers) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <DashboardCard 
        title="Total Users" 
        value={totalUsers.toLocaleString()} 
        icon={Users} 
        trend={totalUsers > 100 ? 5 : 12} // Dynamic trend based on user count
        subtext="registered"
      />
      <DashboardCard 
        title="Active Tasks" 
        value={activeTasks.toLocaleString()} 
        icon={Briefcase} 
        trend={activeTasks > 50 ? 8 : 3}
        subtext="in progress"
      />
      <DashboardCard 
        title="Live Connections" 
        value={liveConnections.toLocaleString()} 
        icon={Zap}
        trend={liveTrend}
        subtext={`${Math.round((liveConnections / totalUsers) * 100)}% of users`}
      />
      <DashboardCard 
        title="System Efficiency" 
        value={`${efficiency}%`} 
        icon={Target} 
        trend={efficiency > 75 ? 2.5 : efficiency > 50 ? 1.5 : 0.5}
        subtext="completion rate"
      />
    </div>
  );
};