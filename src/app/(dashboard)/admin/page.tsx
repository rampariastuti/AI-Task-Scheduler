"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { AdminOverview } from "@/components/dashboard/AdminOverview";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { ShieldCheck, Activity, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
    loading: true
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (userSnap) => {
      const unsubTasks = onSnapshot(collection(db, "tasks"), (taskSnap) => {
        const tasks = taskSnap.docs.map(d => d.data());
        setStats({
          totalUsers: userSnap.size,
          activeTasks: tasks.filter(t => t.status !== "completed").length,
          completedTasks: tasks.filter(t => t.status === "completed").length,
          loading: false
        });
      });
      return () => unsubTasks();
    });
    return () => unsubUsers();
  }, []);

  const totalPossible = stats.activeTasks + stats.completedTasks;
  const efficiencyScore = totalPossible > 0 
    ? Math.round((stats.completedTasks / totalPossible) * 100) 
    : 0;

  if (stats.loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary mb-4" size={40} />
        <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">Processing Live Feed</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            System Performance <ShieldCheck className="text-accent-primary" size={28} />
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest">
            Live Administrative Control Panel
          </p>
        </div>
      </header>

      {/* Dynamic Data Overview */}
      <AdminOverview 
        totalUsers={stats.totalUsers} 
        activeTasks={stats.activeTasks} 
        efficiency={efficiencyScore} 
      />

      {/* Analytics Visualization */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-accent-primary" />
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 italic">Heuristics & AI Analytics</h2>
        </div>
        <AnalyticsCharts />
      </section>
    </div>
  );
}