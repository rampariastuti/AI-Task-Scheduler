"use client";

import React from "react";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Users, Briefcase, Zap, Target } from "lucide-react";

interface AdminOverviewProps {
  totalUsers: number;
  activeTasks: number;
  efficiency: number;
}

export const AdminOverview = ({ totalUsers, activeTasks, efficiency }: AdminOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <DashboardCard 
        title="Total Users" 
        value={totalUsers.toLocaleString()} 
        icon={Users} 
        trend={5} 
      />
      <DashboardCard 
        title="Active Tasks" 
        value={activeTasks.toLocaleString()} 
        icon={Briefcase} 
        trend={12} 
      />
      <DashboardCard 
        title="Live Connections" 
        value={Math.floor(totalUsers * 0.15)} // Simulation of live users (15% of total)
        icon={Zap} 
      />
      <DashboardCard 
        title="System Efficiency" 
        value={`${efficiency}%`} 
        icon={Target} 
        trend={1.5} 
      />
    </div>
  );
};