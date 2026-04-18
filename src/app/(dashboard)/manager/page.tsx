"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { AssignTaskModal } from "@/components/dashboard/AssignTaskModal";
import {
  Users, BarChart3, Plus, ClipboardList,
  Loader2, TrendingUp, Search, X, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgMember {
  id: string;
  name?: string;
  email?: string;
  role?: string;
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
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "team">("tasks");

  // Fetch org members
  useEffect(() => {
    if (!organizationId) return;
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("organizationId", "==", organizationId))
        );
        const map: Record<string, string> = {};
        const list: OrgMember[] = [];
        snap.forEach(d => {
          const u = d.data() as OrgMember;
          map[d.id] = u.name || u.email || "Unknown";
          list.push({ id: d.id, name: u.name, email: u.email, role: u.role });
        });
        setUsersMap(map);
        setMembers(list);
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
      where("organizationId", "==", organizationId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as TaskData))
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      const enhanced: EnhancedTask[] = data.map(task => {
        let names: string[] = [];
        if (task.assignedTo && typeof task.assignedTo === "string") {
          names = [usersMap[task.assignedTo] || "Unknown"];
        } else if (task.assignedUsers) {
          names = task.assignedUsers.map((uid: string) => usersMap[uid] || "Unknown");
        } else if (Array.isArray(task.assignedTo)) {
          names = task.assignedTo.map((uid: string) => usersMap[uid] || "Unknown");
        }
        return { ...task, assignedUserNames: names };
      });
      setAllTasks(enhanced);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user, organizationId, usersMap]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const urgentTasks = allTasks.filter(t => t.priority === 3 && t.status !== "completed").length;

  const getAssigneeId = (task: TaskData): string | null => {
    if (task.assignedTo && typeof task.assignedTo === "string") return task.assignedTo;
    if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) return task.assignedTo[0];
    if (task.assignedUsers && task.assignedUsers.length > 0) return task.assignedUsers[0];
    return null;
  };

  // Set of admin UIDs — their tasks should be hidden from manager view
  const adminIds = useMemo(
    () => new Set(members.filter(m => m.role === "ADMIN").map(m => m.id)),
    [members]
  );

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      const assigneeId = getAssigneeId(t);
      // hide tasks assigned to admins
      if (assigneeId && adminIds.has(assigneeId)) return false;
      const matchSearch =
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedUserNames?.some(n => n.toLowerCase().includes(search.toLowerCase()));
      const matchMember = selectedMember ? assigneeId === selectedMember : true;
      return matchSearch && matchMember;
    });
  }, [allTasks, search, selectedMember, adminIds]);

  // Per-member task stats — exclude ADMIN role
  const memberStats = useMemo(() => {
    return members
      .filter(m => m.role !== "ADMIN")
      .map(m => {
        const memberTasks = allTasks.filter(t => getAssigneeId(t) === m.id);
        const done = memberTasks.filter(t => t.status === "completed").length;
        const urgent = memberTasks.filter(t => t.priority === 3 && t.status !== "completed").length;
        return { ...m, total: memberTasks.length, done, urgent };
      });
  }, [members, allTasks]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            Team Hub <Users className="text-accent-primary" size={22} />
          </h1>
          <p className="text-gray-500 font-medium text-[10px] uppercase tracking-widest mt-1">
            {userData?.orgName || "Organization"} · {members.length} members
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent-primary text-slate-50 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-accent-primary/20 transition-all hover:scale-105 w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Assign Task
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: totalTasks, icon: ClipboardList, color: "blue" },
          { label: "Completed", value: completedTasks, icon: TrendingUp, color: "green" },
          { label: "Pending", value: pendingTasks, icon: Users, color: "amber" },
          { label: "Urgent", value: urgentTasks, icon: BarChart3, color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel p-5 rounded-[2rem] flex items-center gap-4 transition-all">
            <div className={`p-3 rounded-xl shrink-0 bg-${color}-500/10 text-${color}-500`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">{label}</p>
              <h4 className="text-2xl font-bold text-white leading-tight">{value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {[
          { key: "tasks", label: "All Tasks", count: filteredTasks.length },
          { key: "team", label: "Team Members", count: members.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "tasks" | "team")}
            className={cn(
              "px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px",
              activeTab === key
                ? "border-accent-primary text-white"
                : "border-transparent text-gray-600 hover:text-gray-400"
            )}
          >
            {label}
            <span className={cn(
              "ml-2 px-2 py-0.5 rounded-full text-[9px]",
              activeTab === key ? "bg-accent-primary/20 text-accent-primary" : "bg-white/5 text-gray-600"
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── TEAM MEMBERS TAB ── */}
      {activeTab === "team" && (
        <div>
          {usersLoading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-accent-primary" size={40} />
              <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Loading team...</p>
            </div>
          ) : memberStats.length === 0 ? (
            <div className="glass-panel p-16 text-center rounded-[3rem]">
              <Users className="mx-auto text-gray-800 mb-4" size={48} />
              <p className="text-gray-500 font-bold">No team members yet.</p>
              <p className="text-gray-700 text-xs mt-2">Ask your admin to invite members to the organization.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberStats.map(m => {
                const completionRate = m.total > 0 ? Math.round((m.done / m.total) * 100) : 0;
                const roleColor = m.role === "MANAGER"
                  ? "text-purple-400 bg-purple-500/10"
                  : "text-blue-400 bg-blue-500/10";
                return (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedMember(m.id); setActiveTab("tasks"); }}
                    className="glass-panel p-5 rounded-[2rem] cursor-pointer hover:border-accent-primary/20 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center font-black text-lg text-accent-primary shrink-0">
                        {(m.name || m.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-white truncate">{m.name || "Unnamed"}</p>
                        <p className="text-[10px] text-gray-500 truncate">{m.email}</p>
                        <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block", roleColor)}>
                          {m.role}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white/5 rounded-xl p-2 text-center">
                        <p className="text-lg font-black text-white">{m.total}</p>
                        <p className="text-[9px] text-gray-600 uppercase">Total</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 text-center">
                        <p className="text-lg font-black text-accent-success">{m.done}</p>
                        <p className="text-[9px] text-gray-600 uppercase">Done</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 text-center">
                        <p className="text-lg font-black text-accent-danger">{m.urgent}</p>
                        <p className="text-[9px] text-gray-600 uppercase">Urgent</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-gray-600 uppercase font-bold">Completion</span>
                        <span className="text-[9px] font-black text-white">{completionRate}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-primary rounded-full transition-all"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[9px] text-accent-primary mt-3 font-bold uppercase tracking-wider group-hover:underline">
                      View tasks →
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TASKS TAB ── */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          {/* Search + member filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search tasks or members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-white outline-none focus:border-accent-primary/50 transition-all"
              />
            </div>
            {selectedMember && (
              <div className="flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/20 px-4 py-2 rounded-2xl shrink-0">
                <span className="text-xs font-bold text-accent-primary">
                  {usersMap[selectedMember] || "Member"}
                </span>
                <button onClick={() => setSelectedMember(null)} className="text-accent-primary hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Member quick-filter pills */}
          {members.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {members.filter(m => m.role !== "ADMIN").map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMember(selectedMember === m.id ? null : m.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all",
                    selectedMember === m.id
                      ? "bg-accent-primary text-slate-50"
                      : "bg-white/5 text-gray-500 hover:text-gray-900 border border-white/10"
                  )}
                >
                  <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[9px] font-black">
                    {(m.name || m.email || "?")[0].toUpperCase()}
                  </span>
                  {m.name?.split(" ")[0] || m.email?.split("@")[0] || "User"}
                </button>
              ))}
            </div>
          )}

          {loading || usersLoading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-accent-primary" size={40} />
              <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-panel p-16 sm:p-20 text-center rounded-[3rem] border-dashed border-white/5">
              <ClipboardList className="mx-auto text-gray-800 mb-4" size={48} />
              <p className="text-gray-500 font-bold">
                {selectedMember ? `No tasks for ${usersMap[selectedMember] || "this member"}.` : "No tasks found."}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 text-accent-primary text-sm font-bold hover:underline flex items-center gap-2 mx-auto"
              >
                <Plus size={16} /> Assign a task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} {...task} assignedUserNames={task.assignedUserNames} isManagerView={true} />
              ))}
            </div>
          )}
        </div>
      )}

      <AssignTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
