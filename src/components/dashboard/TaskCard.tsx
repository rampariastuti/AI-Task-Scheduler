"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Trash2, Clock, AlertTriangle, Loader2, X, BrainCircuit, User } from "lucide-react"; // Added User icon
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { getSingleTaskAnalysis } from "@/lib/gemini";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: number;
  displayPriority?: number;
  status: string;
  deadline?: string;
  isEscalated?: boolean;
  assignedTo?: string | string[]; // Can be single user ID or array
  assignedUsers?: string[]; // Alternative field name
  assignedToName?: string; // For display name
  assignedUserNames?: string[]; // For multiple users
}

export const TaskCard = ({ 
  id, 
  title, 
  description, 
  displayPriority, 
  priority, 
  status, 
  deadline, 
  isEscalated,
  assignedTo,
  assignedUsers,
  assignedToName,
  assignedUserNames
}: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const isDone = status === "completed";
  const currentPriority = displayPriority || priority;

  // Determine if this is manager view (has assignment info)
  const isManagerView = !!(assignedTo || assignedUsers || assignedToName || assignedUserNames);

  // Get assigned users for display
  const getAssignedDisplay = () => {
    if (assignedToName) return assignedToName;
    if (assignedUserNames && assignedUserNames.length > 0) {
      return assignedUserNames.length === 1 
        ? assignedUserNames[0] 
        : `${assignedUserNames.length} team members`;
    }
    if (assignedUsers && assignedUsers.length > 0) {
      return `${assignedUsers.length} user(s) assigned`;
    }
    if (assignedTo) {
      return typeof assignedTo === 'string' ? 'Assigned' : `${assignedTo.length} user(s)`;
    }
    return null;
  };

  const assignedDisplay = getAssignedDisplay();

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "tasks", id), { status: isDone ? "open" : "completed" });
    } catch (err) { console.error(err); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this task forever?")) return;
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (err) { console.error(err); }
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
    generateAIResponse();
  };

  const generateAIResponse = async () => {
    setLoadingAI(true);
    try {
      const response = await getSingleTaskAnalysis({
        title: title,
        description: description,
        priority: currentPriority,
        status: status,
        deadline: deadline
      });
      setAiResponse(response);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setAiResponse(`Unable to analyze task "${title}" at the moment. Please try again later.`);
    } finally {
      setLoadingAI(false);
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return "Critical";
      case 2: return "Mid-Level";
      default: return "Low Priority";
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return "bg-accent-danger/20 text-accent-danger";
      case 2: return "bg-accent-warning/20 text-accent-warning";
      default: return "bg-accent-primary/20 text-accent-primary";
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleCardClick}
        className={cn(
          "glass-panel p-6 rounded-[2.5rem] flex flex-col justify-between min-h-[260px] relative transition-all group border border-white/5 cursor-pointer hover:scale-[1.02] hover:shadow-xl",
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
              getPriorityColor(currentPriority)
            )}>
              {getPriorityText(currentPriority)}
            </span>
            <button onClick={handleDelete} className="text-gray-700 hover:text-accent-danger transition-colors p-1">
              <Trash2 size={16} />
            </button>
          </div>

          <h3 className={cn("text-xl font-bold text-white mb-2 leading-tight pr-6", isDone && "line-through")}>{title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">{description}</p>
          
          {/* Assignment Info - Only shown in manager view */}
          {isManagerView && assignedDisplay && (
            <div className="flex items-center gap-2 mt-2 bg-white/5 p-2 rounded-xl">
              <User size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-300 truncate">
                {assignedDisplay}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4 pt-4 border-t border-white/5">
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

      {/* AI Response Modal (same as before) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-secondary border border-white/10 rounded-[2.5rem] max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center">
                  <BrainCircuit className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Task Analysis</h2>
                  <p className="text-xs text-gray-500">{title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-165px)]">
              {loadingAI ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="animate-spin text-accent-primary" size={40} />
                  <p className="text-gray-500 text-sm font-medium">AI is analyzing your task...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="glass-panel p-6 rounded-2xl bg-white/5">
                    <p className="text-white whitespace-pre-line leading-relaxed">{aiResponse}</p>
                  </div>

                  {/* Task Details Summary */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Priority</p>
                      <p className={cn(
                        "font-bold",
                        currentPriority === 3 ? "text-accent-danger" :
                          currentPriority === 2 ? "text-accent-warning" :
                            "text-accent-primary"
                      )}>
                        {getPriorityText(currentPriority)}
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="font-bold text-white">{isDone ? "Completed" : "In Progress"}</p>
                    </div>
                    {deadline && (
                      <div className="bg-white/5 p-4 rounded-xl col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Deadline</p>
                        <p className="font-bold text-white">{new Date(deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                    {/* Show assignment in modal for manager view */}
                    {isManagerView && assignedDisplay && (
                      <div className="bg-white/5 p-4 rounded-xl col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                        <p className="font-bold text-white flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          {assignedDisplay}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};