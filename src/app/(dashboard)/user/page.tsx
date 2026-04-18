"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { getTaskRecommendation } from "@/lib/gemini";
import {
  Sparkles, Loader2, BrainCircuit, Search,
  LayoutGrid, CheckCircle2, Clock, AlertTriangle, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserDashboard() {
  const { user, userData } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState("Analyzing your workload...");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "completed">("all");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", user.uid),
      orderBy("priority", "desc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(data);
      setLoading(false);
      const insight = await getTaskRecommendation(data);
      setAiInsight(insight);
    });
    return unsub;
  }, [user]);

  const processedTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchSearch =
          t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter =
          filterStatus === "all" ? true :
          filterStatus === "completed" ? t.status === "completed" :
          t.status !== "completed";
        return matchSearch && matchFilter;
      })
      .map(task => {
        if (!task.deadline || task.status === "completed") return { ...task, isEscalated: false };
        const hoursLeft = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
        const isEscalated = hoursLeft > 0 && hoursLeft < 24;
        return { ...task, displayPriority: isEscalated ? 3 : task.priority, isEscalated };
      });
  }, [tasks, searchQuery, filterStatus]);

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const activeCount = tasks.filter(t => t.status !== "completed").length;
  const urgentCount = tasks.filter(t => t.priority === 3 && t.status !== "completed").length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const stats = [
    { label: "Active", value: activeCount, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-accent-success", bg: "bg-accent-success/10" },
    { label: "Urgent", value: urgentCount, icon: AlertTriangle, color: "text-accent-danger", bg: "bg-accent-danger/10" },
    { label: "Done Rate", value: `${completionRate}%`, icon: Zap, color: "text-accent-primary", bg: "bg-accent-primary/10" },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            My Tasks <Sparkles className="text-accent-primary" size={22} />
          </h1>
          <p className="text-gray-500 mt-1 font-bold text-[10px] uppercase tracking-widest">
            {userData?.orgName || "Organization"} · Tasks assigned to you
          </p>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-panel p-4 rounded-[1.8rem] flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
              <p className={cn("text-xl font-black leading-tight", color)}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Feedback Banner */}
      <div className="glass-panel p-5 rounded-[2rem] border border-accent-primary/20 bg-accent-primary/5 flex items-start gap-4">
        <div className="w-11 h-11 bg-accent-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent-primary/30 shrink-0">
          <BrainCircuit className="text-white" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-accent-primary uppercase tracking-[0.3em] mb-1">AI Insight</p>
          <p className="text-sm font-bold text-white italic leading-snug">"{aiInsight}"</p>
        </div>
        {urgentCount > 0 && (
          <div className="shrink-0 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-[10px] font-black uppercase flex items-center gap-1.5">
            <AlertTriangle size={11} />
            {urgentCount} Urgent
          </div>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent-primary transition-colors" size={16} />
          <input
            type="text" placeholder="Search tasks..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-sm text-white outline-none focus:border-accent-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "open", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={cn(
                "flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                filterStatus === f
                  ? "bg-accent-primary text-slate-50 shadow-lg shadow-accent-primary/20"
                  : "bg-white/5 text-gray-500 hover:text-gray-900 border border-white/10"
              )}
            >{f === "open" ? "Active" : f === "all" ? "All" : "Done"}</button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <section>
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-accent-primary" size={40} />
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Loading tasks...</p>
          </div>
        ) : processedTasks.length === 0 ? (
          <div className="glass-panel p-16 sm:p-20 text-center rounded-[3rem] border-dashed border-white/5">
            <LayoutGrid className="mx-auto text-gray-800 mb-4" size={48} />
            <p className="text-gray-600 font-bold">
              {tasks.length === 0 ? "No tasks assigned yet." : "No tasks match your search."}
            </p>
            <p className="text-gray-700 text-xs mt-2">
              {tasks.length === 0 ? "Your manager will assign tasks to you." : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedTasks.map(task => <TaskCard key={task.id} {...task} />)}
          </div>
        )}
      </section>
    </div>
  );
}
