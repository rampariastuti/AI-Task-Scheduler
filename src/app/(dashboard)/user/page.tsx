"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { UserStats } from "@/components/dashboard/UserStats";
import { AddTaskModal } from "@/components/dashboard/AddTaskModal";
import { getTaskRecommendation } from "@/lib/gemini";
import { Plus, Sparkles, Loader2, BrainCircuit, Search, LayoutGrid } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState("Analyzing workload...");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", user.uid),
      orderBy("priority", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
      setLoading(false);

      // Fetch AI Feedback based on current tasks
      const insight = await getTaskRecommendation(data);
      setAiInsight(insight);
    });

    return () => unsubscribe();
  }, [user]);

  const processedTasks = useMemo(() => {
    const filtered = tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.map(task => {
      if (!task.deadline || task.status === "completed") return { ...task, isEscalated: false };
      const hoursLeft = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
      const isEscalated = hoursLeft > 0 && hoursLeft < 24;
      return { ...task, displayPriority: isEscalated ? 3 : task.priority, isEscalated };
    });
  }, [tasks, searchQuery]);

  const completedTasks = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            WORKSPACE <Sparkles className="text-accent-primary" size={24} />
          </h1>
          <p className="text-gray-500 mt-1 font-bold text-xs uppercase tracking-widest">Intelligent Execution Environment</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-xl uppercase italic"
        >
          <Plus size={18} /> New Task
        </button>
      </header>

      <UserStats completedCount={completedTasks} totalCount={tasks.length} />

      {/* AI FEEDBACK BANNER */}
      <div className="glass-panel p-6 rounded-[2.5rem] border-accent-primary/30 bg-accent-primary/5 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="w-16 h-16 bg-accent-primary rounded-3xl flex items-center justify-center shadow-lg shadow-accent-primary/30 shrink-0">
          <BrainCircuit className="text-white" size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-accent-primary uppercase tracking-[0.3em] mb-1">AI Tactical Feedback</p>
          <h3 className="text-base md:text-xl font-bold text-white italic leading-tight">
            "{aiInsight}"
          </h3>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent-primary transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Filter missions by keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-white outline-none focus:border-accent-primary/50 transition-all italic font-medium"
        />
      </div>

      <section>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-accent-primary" size={40} />
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Syncing Data...</p>
          </div>
        ) : processedTasks.length === 0 ? (
          <div className="glass-panel p-20 text-center rounded-[3rem] border-dashed border-white/5">
            <LayoutGrid className="mx-auto text-gray-800 mb-4" size={56} />
            <p className="text-gray-600 font-bold italic">No active missions matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        )}
      </section>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}