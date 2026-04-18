"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { AdminOverview } from "@/components/dashboard/AdminOverview";
import {
  ShieldCheck, Loader2, Users, Calendar,
  UserCog, Building2, ArrowRight, FileBarChart2,
  CheckCircle2, Clock, AlertTriangle, TrendingUp, UserCheck
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title?: string;
  status?: string;
  priority?: number;
  createdAt?: string;
  assignedTo?: string;
  [key: string]: any;
}

interface OrgUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  lastActive?: string;
  createdAt?: string;
  [key: string]: any;
}

export default function AdminDashboard() {
  const { organizationId, userData } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, activeTasks: 0, completedTasks: 0, loading: true });
  const [recentUsers, setRecentUsers] = useState<OrgUser[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<OrgUser[]>([]);
  const [liveConnections, setLiveConnections] = useState(0);

  useEffect(() => {
    if (!organizationId) return;

    const unsubUsers = onSnapshot(
      query(collection(db, "users"), where("organizationId", "==", organizationId)),
      (snap) => {
        const users = snap.docs.map(d => ({ id: d.id, ...d.data() } as OrgUser));
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        setLiveConnections(users.filter(u => u.lastActive && u.lastActive > fifteenMinsAgo).length);
        setRecentUsers([...users].sort((a, b) => ((b.createdAt || "") > (a.createdAt || "") ? 1 : -1)).slice(0, 5));
        setAllUsers(users);
        setStats(prev => ({ ...prev, totalUsers: snap.size }));
      }
    );

    const unsubTasks = onSnapshot(
      query(collection(db, "tasks"), where("organizationId", "==", organizationId)),
      (snap) => {
        const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
        setAllTasks(tasks);
        setStats(prev => ({
          ...prev,
          activeTasks: tasks.filter(t => t.status !== "completed").length,
          completedTasks: tasks.filter(t => t.status === "completed").length,
          loading: false,
        }));
      }
    );

    return () => { unsubUsers(); unsubTasks(); };
  }, [organizationId]);

  const efficiencyScore =
    stats.activeTasks + stats.completedTasks > 0
      ? Math.round((stats.completedTasks / (stats.activeTasks + stats.completedTasks)) * 100)
      : 0;

  // Compute report data
  const urgentTasks = allTasks.filter(t => t.priority === 3 && t.status !== "completed").length;
  const totalTasks = allTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((stats.completedTasks / totalTasks) * 100) : 0;

  const roleCounts = allUsers.reduce((acc, u) => {
    const r = u.role || "USER";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Last 7 days task breakdown — created vs completed per day
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    // compare local date string (YYYY-MM-DD)
    const localDateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const created = allTasks.filter(t => {
      if (!t.createdAt) return false;
      const ts = new Date(t.createdAt);
      const s = `${ts.getFullYear()}-${String(ts.getMonth()+1).padStart(2,"0")}-${String(ts.getDate()).padStart(2,"0")}`;
      return s === localDateStr;
    }).length;
    const completed = allTasks.filter(t => {
      if (t.status !== "completed") return false;
      const raw = t.updatedAt || t.createdAt;
      if (!raw) return false;
      const ts = new Date(raw);
      const s = `${ts.getFullYear()}-${String(ts.getMonth()+1).padStart(2,"0")}-${String(ts.getDate()).padStart(2,"0")}`;
      return s === localDateStr;
    }).length;
    return {
      label: d.toLocaleDateString("en", { weekday: "short" }),
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      created,
      completed,
    };
  });

  // Account not linked
  if (!organizationId) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-6 space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center">
          <ShieldCheck className="text-amber-400" size={32} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Account Not Linked</h2>
        <p className="text-gray-400 text-sm max-w-md leading-relaxed">
          Your account was created before the organization system. Delete it from{" "}
          <span className="text-white font-bold">Firebase Console → Authentication</span> and sign up again as Admin.
        </p>
      </div>
    );
  }

  if (stats.loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary mb-4" size={40} />
        <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">Loading Admin Console</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            Admin Console <ShieldCheck className="text-accent-primary" size={26} />
          </h1>
          <p className="text-gray-500 font-medium text-xs mt-1 uppercase tracking-widest">
            {userData?.orgName || "Organization"} · Control Panel
          </p>
        </div>
        <div className="flex items-center gap-2 bg-accent-primary/10 px-4 py-2 rounded-2xl border border-accent-primary/20">
          <div className="relative">
            <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse absolute -top-1 -right-1" />
            <Users size={16} className="text-accent-primary" />
          </div>
          <span className="text-sm font-bold text-white">{liveConnections} Live Now</span>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/users">
          <div className="glass-panel p-5 rounded-[2rem] hover:border-accent-primary/30 transition-all cursor-pointer group flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all shrink-0">
              <UserCog size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-tight">Manage Users</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Add, remove, change roles</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link href="/admin/org">
          <div className="glass-panel p-5 rounded-[2rem] hover:border-accent-primary/30 transition-all cursor-pointer group flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all shrink-0">
              <Building2 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-tight">Organization</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Invite code & org settings</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      <AdminOverview
        totalUsers={stats.totalUsers}
        activeTasks={stats.activeTasks}
        efficiency={efficiencyScore}
        liveConnections={liveConnections}
      />

      {/* Recent Users Strip */}
      {recentUsers.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 overflow-x-auto">
          <Calendar size={16} className="text-gray-500 shrink-0" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap shrink-0">Recent Members:</span>
          {recentUsers.map(u => (
            <div key={u.id} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full whitespace-nowrap shrink-0">
              <div className="w-5 h-5 bg-accent-primary/20 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-accent-primary uppercase">{u.name?.[0] || u.email?.[0] || "U"}</span>
              </div>
              <span className="text-xs font-medium text-gray-300">{u.name || u.email?.split("@")[0] || "User"}</span>
              <span className="text-[9px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full uppercase">{u.role || "USER"}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── REPORTS ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <FileBarChart2 size={18} className="text-accent-primary" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Reports & Insights</h2>
        </div>

        {/* Report Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Completion Rate */}
          <div className="glass-panel p-5 rounded-[2rem] space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-accent-success" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completion Rate</p>
            </div>
            <p className="text-3xl font-black text-white">{completionRate}<span className="text-lg text-gray-500">%</span></p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-success rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-[9px] text-gray-600">{stats.completedTasks} of {totalTasks} tasks done</p>
          </div>

          {/* Pending Tasks */}
          <div className="glass-panel p-5 rounded-[2rem] space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent-warning" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending Tasks</p>
            </div>
            <p className="text-3xl font-black text-white">{stats.activeTasks}</p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-warning rounded-full transition-all duration-700"
                style={{ width: totalTasks > 0 ? `${(stats.activeTasks / totalTasks) * 100}%` : "0%" }}
              />
            </div>
            <p className="text-[9px] text-gray-600">tasks still in progress</p>
          </div>

          {/* Urgent Tasks */}
          <div className="glass-panel p-5 rounded-[2rem] space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-accent-danger" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Urgent Tasks</p>
            </div>
            <p className="text-3xl font-black text-white">{urgentTasks}</p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-danger rounded-full transition-all duration-700"
                style={{ width: totalTasks > 0 ? `${(urgentTasks / totalTasks) * 100}%` : "0%" }}
              />
            </div>
            <p className="text-[9px] text-gray-600">critical priority, not done</p>
          </div>

          {/* Team Breakdown */}
          <div className="glass-panel p-5 rounded-[2rem] space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-blue-400" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Team Roles</p>
            </div>
            <div className="space-y-2">
              {[
                { role: "ADMIN", color: "bg-red-500" },
                { role: "MANAGER", color: "bg-blue-500" },
                { role: "USER", color: "bg-accent-primary" },
              ].map(({ role, color }) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{role}</span>
                  </div>
                  <span className="text-[10px] text-white font-black">{roleCounts[role] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Task Activity — Bar Chart */}
        <div className="glass-panel p-6 rounded-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">7-Day Task Activity</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-accent-primary/70" />
                <span className="text-[9px] text-gray-500 uppercase font-bold">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-accent-success/70" />
                <span className="text-[9px] text-gray-500 uppercase font-bold">Completed</span>
              </div>
            </div>
          </div>

          {(() => {
            const BAR_MAX_PX = 96; // pixel height of bar area
            const maxVal = Math.max(...last7Days.map(d => Math.max(d.created, d.completed)), 1);
            const totalActivity = last7Days.reduce((s, d) => s + d.created + d.completed, 0);
            return (
              <>
                {totalActivity === 0 && (
                  <p className="text-center text-gray-600 text-xs py-4 mb-2">
                    No task activity in the last 7 days. Assign tasks to see data here.
                  </p>
                )}
                <div className="flex items-end gap-3" style={{ height: `${BAR_MAX_PX + 40}px` }}>
                  {last7Days.map((day, i) => {
                    const createdPx = day.created > 0 ? Math.max(Math.round((day.created / maxVal) * BAR_MAX_PX), 8) : 0;
                    const completedPx = day.completed > 0 ? Math.max(Math.round((day.completed / maxVal) * BAR_MAX_PX), 8) : 0;
                    const isToday = i === 6;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end gap-0.5" style={{ height: `${BAR_MAX_PX}px` }}>
                          {/* Created bar */}
                          <div className="flex-1 flex flex-col justify-end h-full">
                            <div
                              className={`w-full rounded-t-md transition-all duration-700 ${isToday ? "bg-accent-primary" : "bg-accent-primary/40"}`}
                              style={{ height: `${createdPx}px` }}
                              title={`${day.created} created`}
                            />
                          </div>
                          {/* Completed bar */}
                          <div className="flex-1 flex flex-col justify-end h-full">
                            <div
                              className={`w-full rounded-t-md transition-all duration-700 ${isToday ? "bg-accent-success" : "bg-accent-success/40"}`}
                              style={{ height: `${completedPx}px` }}
                              title={`${day.completed} completed`}
                            />
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase mt-1 ${isToday ? "text-accent-primary" : "text-gray-600"}`}>
                          {day.label}
                        </span>
                        <span className="text-[8px] text-gray-700">{day.date}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary row */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-black text-white">{last7Days.reduce((s, d) => s + d.created, 0)}</p>
                    <p className="text-[9px] text-gray-600 uppercase font-bold">Tasks Created</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-accent-success">{last7Days.reduce((s, d) => s + d.completed, 0)}</p>
                    <p className="text-[9px] text-gray-600 uppercase font-bold">Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-accent-primary">
                      {last7Days.reduce((s, d) => s + d.created, 0) > 0
                        ? `${Math.round((last7Days.reduce((s, d) => s + d.completed, 0) / last7Days.reduce((s, d) => s + d.created, 0)) * 100)}%`
                        : "—"}
                    </p>
                    <p className="text-[9px] text-gray-600 uppercase font-bold">Completion Rate</p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
