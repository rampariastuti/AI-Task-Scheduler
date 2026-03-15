"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Trash2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: number;
  displayPriority?: number;
  status: string;
  deadline?: string;
  isEscalated?: boolean;
}

export const TaskCard = ({ id, title, description, displayPriority, priority, status, deadline, isEscalated }: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDone = status === "completed";
  const currentPriority = displayPriority || priority;

  const toggleStatus = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "tasks", id), { status: isDone ? "open" : "completed" });
    } catch (err) { console.error(err); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task forever?")) return;
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-panel p-6 rounded-[2.5rem] flex flex-col justify-between min-h-[240px] relative transition-all group border border-white/5",
        isEscalated && !isDone && "border-accent-danger/40 shadow-[0_0_25px_rgba(239,68,68,0.1)]",
        isDone && "opacity-40 grayscale-[0.8]"
      )}
    >
      {isEscalated && !isDone && (
        <div className="absolute top-5 right-5 text-accent-danger animate-pulse flex items-center gap-1">
          <AlertTriangle size={16} /> <span className="text-[10px] font-black tracking-tighter uppercase">URGENT</span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={cn(
            "text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
            currentPriority === 3 ? "bg-accent-danger/20 text-accent-danger" : 
            currentPriority === 2 ? "bg-accent-warning/20 text-accent-warning" : 
            "bg-accent-primary/20 text-accent-primary"
          )}>
            {currentPriority === 3 ? "Critical" : currentPriority === 2 ? "Mid-Level" : "Low Priority"}
          </span>
          <button onClick={handleDelete} className="text-gray-700 hover:text-accent-danger transition-colors p-1">
            <Trash2 size={16} />
          </button>
        </div>

        <h3 className={cn("text-xl font-bold text-white mb-2 leading-tight", isDone && "line-through")}>{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 pt-4 border-t border-white/5">
        {deadline && (
          <div className="text-[10px] font-bold text-gray-600 flex items-center gap-2 uppercase">
            <Clock size={12} /> 
            <span className={isEscalated ? "text-accent-danger" : ""}>
              Due: {new Date(deadline).toLocaleDateString()}
            </span>
          </div>
        )}
        
        <button 
          onClick={toggleStatus}
          disabled={isUpdating}
          className={cn(
            "w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2",
            isDone ? "bg-accent-success/10 text-accent-success hover:bg-accent-success/20" : "bg-white text-black hover:bg-gray-200"
          )}
        >
          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : isDone ? <><CheckCircle2 size={14} /> Completed</> : "Mark as Done"}
        </button>
      </div>
    </motion.div>
  );
}; 