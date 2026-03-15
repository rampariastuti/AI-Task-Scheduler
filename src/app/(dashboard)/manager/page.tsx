"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, getDocs } from "firebase/firestore";
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

// Interface for User data
interface UserData {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  [key: string]: any;
}

// Interface for Task data from Firestore
interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: 'open' | 'completed' | 'in-progress';
  deadline?: string;
  createdAt?: string;
  assignedTo?: string | string[];
  assignedUsers?: string[];
  eventId?: string;
  requiredSkill?: string;
  volunteersNeeded?: number;
  [key: string]: any;
}

// Extended Task interface with display names
interface EnhancedTask extends TaskData {
  assignedUserNames: string[];
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<Record<string, string>>({}); // Map userId -> userName
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  // Fetch users for displaying names
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersMap: Record<string, string> = {};
        usersSnapshot.forEach((doc) => {
          const userData = doc.data() as UserData;
          usersMap[doc.id] = userData.displayName || userData.email || "Unknown User";
        });
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as TaskData));
        
        // Enhance tasks with user names for display
        const enhancedData: EnhancedTask[] = data.map(task => {
          let assignedUserNames: string[] = [];
          
          // Handle different assignment field names
          if (task.assignedTo && typeof task.assignedTo === 'string') {
            assignedUserNames = [users[task.assignedTo] || "Unknown User"];
          } else if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
            assignedUserNames = task.assignedUsers.map((uid: string) => users[uid] || "Unknown User");
          } else if (task.assignedTo && Array.isArray(task.assignedTo)) {
            assignedUserNames = task.assignedTo.map((uid: string) => users[uid] || "Unknown User");
          }
          
          return {
            ...task,
            assignedUserNames,
          };
        });
        
        setAllTasks(enhancedData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, users]);

  // Calculate stats
  const totalTasks: number = allTasks.length;
  const completedTasks: number = allTasks.filter(t => t.status === "completed").length;
  const pendingTasks: number = totalTasks - completedTasks;
  const urgentTasks: number = allTasks.filter(t => t.priority === 3 && t.status !== "completed").length;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            TEAM COMMAND <Users className="text-accent-primary" size={24} />
          </h1>
          <p className="text-gray-500 font-medium text-xs uppercase tracking-widest mt-1">
            Global task oversight and resource allocation
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-accent-primary/20 transition-all hover:scale-105"
          aria-label="Assign new team task"
        >
          <Plus size={18} /> Assign Team Task
        </button>
      </header>

      {/* Manager Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:border-accent-primary/20 transition-all col-span-1">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Load</p>
            <h4 className="text-3xl font-bold text-white">
              {totalTasks} <span className="text-sm text-gray-500">tasks</span>
            </h4>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:border-accent-success/20 transition-all col-span-1">
          <div className="p-4 bg-accent-success/10 rounded-2xl text-accent-success">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completed</p>
            <h4 className="text-3xl font-bold text-white">
              {completedTasks} <span className="text-sm text-gray-500">done</span>
            </h4>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:border-accent-warning/20 transition-all col-span-1">
          <div className="p-4 bg-accent-warning/10 rounded-2xl text-accent-warning">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending</p>
            <h4 className="text-3xl font-bold text-white">
              {pendingTasks} <span className="text-sm text-gray-500">active</span>
            </h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:border-accent-danger/20 transition-all col-span-1">
          <div className="p-4 bg-accent-danger/10 rounded-2xl text-accent-danger">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Urgent</p>
            <h4 className="text-3xl font-bold text-white">
              {urgentTasks} <span className="text-sm text-gray-500">critical</span>
            </h4>
          </div>
        </div>
      </div>

      {/* All Tasks Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">
            Global Task Feed {!usersLoading && `• ${Object.keys(users).length} team members`}
          </h2>
          <div className="h-px flex-1 bg-white/5 ml-6" />
        </div>

        {loading || usersLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-accent-primary" size={40} />
            <p className="text-gray-600 text-xs font-black uppercase tracking-widest">
              Loading team data...
            </p>
          </div>
        ) : allTasks.length === 0 ? (
          <div className="glass-panel p-20 text-center rounded-[3rem] border-dashed border-white/5">
            <BarChart3 className="mx-auto text-gray-800 mb-4" size={56} />
            <p className="text-gray-500 font-bold italic">No team activities recorded yet.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 text-accent-primary text-sm font-bold hover:underline flex items-center gap-2 mx-auto"
            >
              <Plus size={16} /> Assign your first task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                {...task} 
                assignedUserNames={task.assignedUserNames}
              />
            ))}
          </div>
        )}
      </section>

      <AssignTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}