"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { AdminOverview } from "@/components/dashboard/AdminOverview";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { ShieldCheck, Activity, Loader2, Users, Calendar } from "lucide-react";

// Define interfaces
interface Task {
  id: string;
  title?: string;
  description?: string;
  priority?: number;
  status?: 'open' | 'completed' | 'in-progress';
  deadline?: string;
  createdAt?: string;
  assignedTo?: string | string[];
  assignedUsers?: string[];
  [key: string]: any;
}

interface UserData {
  id: string;
  email?: string;
  displayName?: string;
  lastActive?: string;
  createdAt?: string;
  [key: string]: any;
}

interface DailyTaskData {
  name: string;
  tasks: number;
  completed: number;
  date: string;
}

interface AccuracyData {
  name: string;
  accuracy: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
    loading: true
  });

  const [weeklyData, setWeeklyData] = useState<DailyTaskData[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [accuracyData, setAccuracyData] = useState<AccuracyData[]>([]);
  const [liveConnections, setLiveConnections] = useState(0);

  useEffect(() => {
    // Get last 7 days for chart labels
    const getLast7Days = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push({
          name: days[d.getDay()],
          date: d.toISOString().split('T')[0],
          tasks: 0,
          completed: 0
        });
      }
      return result;
    };

    const initialWeeklyData = getLast7Days();
    setWeeklyData(initialWeeklyData);

    // Listen to users collection
    const unsubUsers = onSnapshot(collection(db, "users"), (userSnap) => {
      const users = userSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as UserData));
      
      // Calculate live connections (users active in last 15 minutes)
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const live = users.filter((u: UserData) => 
        u.lastActive && u.lastActive > fifteenMinsAgo
      ).length;
      
      setLiveConnections(live);
      
      // Get 5 most recent users
      const recent = users
        .sort((a: UserData, b: UserData) => ((b.createdAt || '') as string).localeCompare((a.createdAt || '') as string))
        .slice(0, 5);
      setRecentUsers(recent);
      
      // Update total users count
      setStats(prev => ({ ...prev, totalUsers: userSnap.size }));
    });

    // Listen to tasks collection
    const unsubTasks = onSnapshot(collection(db, "tasks"), (taskSnap) => {
      const tasks = taskSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Task));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeTasks: tasks.filter((t: Task) => t.status !== "completed").length,
        completedTasks: tasks.filter((t: Task) => t.status === "completed").length,
        loading: false
      }));

      // Process weekly data from actual tasks
      const weekDays = [...weeklyData];
      
      tasks.forEach((task: Task) => {
        if (task.createdAt) {
          const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
          const dayIndex = weekDays.findIndex(d => d.date === taskDate);
          
          if (dayIndex !== -1) {
            weekDays[dayIndex].tasks += 1;
            if (task.status === 'completed') {
              weekDays[dayIndex].completed += 1;
            }
          }
        }
      });

      setWeeklyData(weekDays);

      // Generate accuracy data based on task completion rates
      const accuracyWeek = weekDays.map(day => ({
        name: day.name,
        accuracy: day.tasks > 0 ? Math.round((day.completed / day.tasks) * 100) : 0
      }));
      setAccuracyData(accuracyWeek);
    });

    return () => {
      unsubUsers();
      unsubTasks();
    };
  }, []); // Empty dependency array since we don't want to recreate listeners

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
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            System Performance <ShieldCheck className="text-accent-primary" size={28} />
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest">
            Live Administrative Control Panel
          </p>
        </div>
        
        {/* Live Connections Badge */}
        <div className="flex items-center gap-3 mt-4 md:mt-0 bg-accent-primary/10 px-4 py-2 rounded-2xl border border-accent-primary/20">
          <div className="relative">
            <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse absolute -top-1 -right-1"></div>
            <Users size={18} className="text-accent-primary" />
          </div>
          <span className="text-sm font-bold text-white">{liveConnections} Live Now</span>
        </div>
      </header>

      {/* Dynamic Data Overview */}
      <AdminOverview 
        totalUsers={stats.totalUsers} 
        activeTasks={stats.activeTasks} 
        efficiency={efficiencyScore}
        liveConnections={liveConnections}
      />

      {/* Recent Users Strip */}
      {recentUsers.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border-white/5 flex items-center gap-4 overflow-x-auto">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">New Users:</span>
          {recentUsers.map((u: UserData, i: number) => (
            <div key={u.id} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full whitespace-nowrap">
              <div className="w-5 h-5 bg-accent-primary/20 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-accent-primary">
                  {u.displayName?.[0] || u.email?.[0] || 'U'}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-300">
                {u.displayName || u.email?.split('@')[0] || 'User'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Visualization */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-accent-primary" />
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 italic">Heuristics & AI Analytics</h2>
        </div>
        <AnalyticsCharts weeklyData={weeklyData} accuracyData={accuracyData} />
      </section>
    </div>
  );
}