"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { AssignTaskModal } from "../../../components/dashboard/AssignTaskModal";
import { 
  Users, 
  BarChart3, 
  Plus, 
  ClipboardList, 
  Loader2, 
  TrendingUp 
} from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch ALL tasks for the manager's overview
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllTasks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Team Command</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Global task oversight and resource allocation.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
        >
          <Plus size={20} /> ASSIGN TEAM TASK
        </button>
      </header>

      {/* Manager Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500"><ClipboardList /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Load</p>
            <h4 className="text-2xl font-bold text-white">{totalTasks} Tasks</h4>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-4">
          <div className="p-4 bg-accent-success/10 rounded-2xl text-accent-success"><TrendingUp /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Team Velocity</p>
            <h4 className="text-2xl font-bold text-white">{completedTasks} Done</h4>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-4">
          <div className="p-4 bg-accent-warning/10 rounded-2xl text-accent-warning"><Users /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Active Queue</p>
            <h4 className="text-2xl font-bold text-white">{pendingTasks} Pending</h4>
          </div>
        </div>
      </div>

      {/* All Tasks Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Global Task Feed</h2>
          <div className="h-px flex-1 bg-white/5 mx-6" />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-primary" /></div>
        ) : allTasks.length === 0 ? (
          <div className="glass-panel p-20 text-center rounded-[3rem] border-dashed">
            <BarChart3 className="mx-auto text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 italic">No team activities recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        )}
      </section>

      <AssignTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}