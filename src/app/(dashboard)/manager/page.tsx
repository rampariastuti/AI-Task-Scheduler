"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { AssignTaskModal } from "@/components/dashboard/AssignTaskModal";
import {
  Users, BarChart3, Plus, ClipboardList,
  Loader2, TrendingUp, Search
} from "lucide-react";

interface OrgUser {
  id: string;
  displayName?: string;
  name?: string;
  email?: string;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: "open" | "completed" | "in-progress";
  deadline?: string;
  createdAt?: string;
  assignedTo?: string | string[];
  assignedUsers?: string[];
  organizationId?: string;
  [key: string]: any;
}

interface EnhancedTask extends TaskData {
  assignedUserNames: string[];
}

export default function ManagerDashboard() {
  const { user, organizationId, userData } = useAuth();
  const [allTasks, setAllTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch org users
  useEffect(() => {
    if (!organizationId) return;
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("organizationId", "==", organizationId))
        );
        const map: Record<string, string> = {};
        snap.forEach(d => {
          const u = d.data() as OrgUser;
          map[d.id] = u.name || u.displayName || u.email || "Unknown";
        });
        setUsers(map);
      } catch { } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [organizationId]);

  // Listen to org tasks
  useEffect(() => {
    if (!user || !organizationId) return;
    const q = query(
      collection(db, "tasks"),
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as TaskData));
      const enhanced: EnhancedTask[] = data.map(task => {
        let names: string[] = [];
        if (task.assignedTo && typeof task.assignedTo === "string") {
          names = [users[task.assignedTo] || "Unknown"];
        } else if (task.assignedUsers) {
          names = task.assignedUsers.map((uid: string) => users[uid] || "Unknown");
        } else if (Array.isArray(task.assignedTo)) {
          names = task.assignedTo.map((uid: string) => users[uid] || "Unknown");
        }
        return { ...task, assignedUserNames: names };
      });
      setAllTasks(enhanced);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user, organizationId, users]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const urgentTasks = allTasks.filter(t => t.priority === 3 && t.status !== "completed").length;

  const filteredTasks = allTasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.assignedUserNames?.some(n => n.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            Team Command <Users className="text-accent-primary" size={22} />
          </h1>
          <p className="text-gray-500 font-medium text-[10px] uppercase tracking-widest mt-1">
            {userData?.orgName || "Organization"} · Resource Allocation
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-accent-primary/20 transition-all hover:scale-105 w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Assign Task
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Load", value: totalTasks, unit: "tasks", icon: ClipboardList, color: "blue" },
          { label: "Completed", value: completedTasks, unit: "done", icon: TrendingUp, color: "green" },
          { label: "Pending", value: pendingTasks, unit: "active", icon: Users, color: "amber" },
          { label: "Urgent", value: urgentTasks, unit: "critical", icon: BarChart3, color: "red" },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className={`glass-panel p-5 rounded-[2rem] flex items-center gap-4 hover:border-${color}-500/20 transition-all`}>
            <div className={`p-3 bg-${color}-500/10 rounded-xl text-${color}-500 shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">{label}</p>
              <h4 className="text-2xl font-bold text-white leading-tight">
                {value} <span className="text-xs text-gray-500">{unit}</span>
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent-primary transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search tasks or team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-white outline-none focus:border-accent-primary/50 transition-all"
        />
      </div>

      {/* Task Feed */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
            Team Tasks {!usersLoading && `· ${Object.keys(users).length} members`}
          </h2>
          <div className="h-px flex-1 bg-white/5 ml-4" />
        </div>

        {loading || usersLoading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-accent-primary" size={40} />
            <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Loading team data...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-panel p-16 sm:p-20 text-center rounded-[3rem] border-dashed border-white/5">
            <BarChart3 className="mx-auto text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold">No tasks found.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 text-accent-primary text-sm font-bold hover:underline flex items-center gap-2 mx-auto"
            >
              <Plus size={16} /> Assign your first task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} {...task} assignedUserNames={task.assignedUserNames} />
            ))}
          </div>
        )}
      </section>

      <AssignTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
