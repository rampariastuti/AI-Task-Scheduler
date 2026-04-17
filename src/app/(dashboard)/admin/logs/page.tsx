"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  ScrollText, Loader2, CheckCircle2, Plus, UserPlus,
  AlertTriangle, Clock, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  type: "task_created" | "task_completed" | "user_joined" | "task_urgent";
  title: string;
  subtitle: string;
  timestamp: string;
  icon: "task" | "done" | "user" | "urgent";
}

export default function ActivityLogPage() {
  const { organizationId, userData } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "tasks" | "users" | "urgent">("all");

  useEffect(() => {
    if (!organizationId) return;

    let tasksLoaded = false, usersLoaded = false;
    const checkDone = () => { if (tasksLoaded && usersLoaded) setLoading(false); };

    const unsubTasks = onSnapshot(
      query(collection(db, "tasks"), where("organizationId", "==", organizationId)),
      snap => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        tasksLoaded = true; checkDone();
      }
    );

    const unsubUsers = onSnapshot(
      query(collection(db, "users"), where("organizationId", "==", organizationId)),
      snap => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        usersLoaded = true; checkDone();
      }
    );

    return () => { unsubTasks(); unsubUsers(); };
  }, [organizationId]);

  // Build log entries from tasks + users data
  const logs: LogEntry[] = useMemo(() => {
    const entries: LogEntry[] = [];

    tasks.forEach(t => {
      entries.push({
        id: `task-created-${t.id}`,
        type: "task_created",
        title: `Task Created: "${t.title}"`,
        subtitle: `Priority ${t.priority === 3 ? "Critical" : t.priority === 2 ? "Medium" : "Low"} · ${t.status === "completed" ? "Completed" : "Pending"}`,
        timestamp: t.createdAt || new Date().toISOString(),
        icon: "task",
      });

      if (t.status === "completed") {
        entries.push({
          id: `task-done-${t.id}`,
          type: "task_completed",
          title: `Task Completed: "${t.title}"`,
          subtitle: "Marked as done by assignee",
          timestamp: t.updatedAt || t.createdAt || new Date().toISOString(),
          icon: "done",
        });
      }

      if (t.priority === 3 && t.status !== "completed") {
        entries.push({
          id: `task-urgent-${t.id}`,
          type: "task_urgent",
          title: `Urgent Task Active: "${t.title}"`,
          subtitle: t.deadline
            ? `Deadline: ${new Date(t.deadline).toLocaleDateString()}`
            : "No deadline set",
          timestamp: t.createdAt || new Date().toISOString(),
          icon: "urgent",
        });
      }
    });

    users.forEach(u => {
      entries.push({
        id: `user-joined-${u.id}`,
        type: "user_joined",
        title: `${u.name || u.email?.split("@")[0] || "User"} joined the organization`,
        subtitle: `Role: ${u.role || "USER"} · ${u.email}`,
        timestamp: u.createdAt || new Date().toISOString(),
        icon: "user",
      });
    });

    return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [tasks, users]);

  const filtered = logs.filter(l => {
    if (filter === "all") return true;
    if (filter === "tasks") return l.type === "task_created" || l.type === "task_completed";
    if (filter === "users") return l.type === "user_joined";
    if (filter === "urgent") return l.type === "task_urgent";
    return true;
  });

  const ICON_MAP = {
    task: { icon: Plus, bg: "bg-blue-500/10", color: "text-blue-400" },
    done: { icon: CheckCircle2, bg: "bg-accent-success/10", color: "text-accent-success" },
    user: { icon: UserPlus, bg: "bg-purple-500/10", color: "text-purple-400" },
    urgent: { icon: AlertTriangle, bg: "bg-accent-danger/10", color: "text-accent-danger" },
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString();
    } catch { return ts; }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
          Activity Log <ScrollText className="text-accent-primary" size={24} />
        </h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
          {userData?.orgName} · {logs.length} events recorded
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All Events" },
          { key: "tasks", label: "Tasks" },
          { key: "users", label: "Members" },
          { key: "urgent", label: "Urgent" },
        ].map(({ key, label }) => (
          <button key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all",
              filter === key
                ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                : "bg-white/5 text-gray-500 hover:text-white border border-white/10"
            )}
          >
            {key === "urgent" && <AlertTriangle size={11} />}
            {label}
            {key !== "all" && (
              <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[9px]">
                {key === "tasks" ? logs.filter(l => l.type === "task_created" || l.type === "task_completed").length
                 : key === "users" ? logs.filter(l => l.type === "user_joined").length
                 : logs.filter(l => l.type === "task_urgent").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-accent-primary" size={40} />
          <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Loading activity...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-[3rem]">
          <ScrollText className="mx-auto text-gray-800 mb-4" size={48} />
          <p className="text-gray-600 font-bold">No activity yet.</p>
          <p className="text-gray-700 text-xs mt-2">Events will appear as your team creates and completes tasks.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5" />

          <div className="space-y-3">
            {filtered.map((entry, i) => {
              const { icon: Icon, bg, color } = ICON_MAP[entry.icon];
              return (
                <div key={entry.id} className="relative flex items-start gap-4 pl-16">
                  {/* Icon dot on timeline */}
                  <div className={cn(
                    "absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    bg
                  )}>
                    <Icon size={18} className={color} />
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "flex-1 glass-panel p-4 rounded-2xl hover:border-white/10 transition-all",
                    entry.type === "task_urgent" && "border-accent-danger/20 bg-accent-danger/5"
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white leading-snug">{entry.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{entry.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock size={11} className="text-gray-700" />
                        <span className="text-[10px] text-gray-600 whitespace-nowrap">{formatTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
