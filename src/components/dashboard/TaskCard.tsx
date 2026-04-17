"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Trash2, Clock, AlertTriangle,
  Loader2, X, BrainCircuit, User, Sparkles
} from "lucide-react";
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
  assignedTo?: string | string[];
  assignedUsers?: string[];
  assignedToName?: string;
  assignedUserNames?: string[];
}

const PRIORITY_LABEL: Record<number, string> = { 3: "Critical", 2: "Medium", 1: "Low" };
const PRIORITY_COLOR: Record<number, string> = {
  3: "bg-accent-danger/20 text-accent-danger border-accent-danger/30",
  2: "bg-accent-warning/20 text-accent-warning border-accent-warning/30",
  1: "bg-accent-primary/20 text-accent-primary border-accent-primary/30",
};

export const TaskCard = ({
  id, title, description, displayPriority, priority,
  status, deadline, isEscalated,
  assignedTo, assignedUsers, assignedToName, assignedUserNames,
}: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const isDone = status === "completed";
  const p = displayPriority || priority;
  const isManagerView = !!(assignedTo || assignedUsers || assignedToName || assignedUserNames);

  const assignedDisplay = (() => {
    if (assignedToName) return assignedToName;
    if (assignedUserNames?.length) return assignedUserNames.length === 1 ? assignedUserNames[0] : `${assignedUserNames.length} members`;
    if (assignedUsers?.length) return `${assignedUsers.length} user(s)`;
    return null;
  })();

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try { await updateDoc(doc(db, "tasks", id), { status: isDone ? "open" : "completed" }); }
    catch { } finally { setIsUpdating(false); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this task?")) return;
    try { await deleteDoc(doc(db, "tasks", id)); } catch { }
  };

  const openAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
    if (aiResponse) return; // cached
    setLoadingAI(true);
    try {
      const resp = await getSingleTaskAnalysis({ title, description, priority: p, status, deadline });
      setAiResponse(resp);
    } catch {
      setAiResponse(`Unable to analyze "${title}". Try again later.`);
    } finally { setLoadingAI(false); }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "glass-panel p-6 rounded-[2.5rem] flex flex-col justify-between min-h-[260px] relative transition-all border group",
          isEscalated && !isDone && "border-accent-danger/40 shadow-[0_0_25px_rgba(239,68,68,0.08)]",
          isDone ? "opacity-40 grayscale-[0.7] border-white/5" : "border-white/5 hover:border-white/10"
        )}
      >
        {/* Urgent badge */}
        {isEscalated && !isDone && (
          <div className="absolute top-5 right-14 text-accent-danger flex items-center gap-1">
            <AlertTriangle size={14} className="animate-pulse" />
            <span className="text-[9px] font-black tracking-tighter uppercase">Urgent</span>
          </div>
        )}

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="absolute top-5 right-5 text-gray-700 hover:text-accent-danger transition-colors p-1"
        >
          <Trash2 size={15} />
        </button>

        <div className="space-y-3">
          {/* Priority badge */}
          <span className={cn(
            "inline-flex items-center text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
            PRIORITY_COLOR[p] || PRIORITY_COLOR[1]
          )}>
            {PRIORITY_LABEL[p] || "Low"} Priority
          </span>

          {/* Title */}
          <h3 className={cn("text-lg font-black text-white leading-tight pr-6", isDone && "line-through opacity-60")}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>

          {/* Assigned (manager view) */}
          {isManagerView && assignedDisplay && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl mt-1">
              <User size={12} className="text-gray-500 shrink-0" />
              <span className="text-[11px] font-medium text-gray-300 truncate">{assignedDisplay}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 space-y-3 pt-4 border-t border-white/5">
          {deadline && (
            <div className={cn(
              "text-[10px] font-bold flex items-center gap-2 uppercase",
              isEscalated && !isDone ? "text-accent-danger" : "text-gray-600"
            )}>
              <Clock size={11} />
              Due: {new Date(deadline).toLocaleDateString()}
            </div>
          )}

          <div className="flex gap-2">
            {/* Understand Task button → triggers AI */}
            <button
              onClick={openAI}
              disabled={isDone}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/20 disabled:opacity-40"
            >
              <BrainCircuit size={13} /> Understand Task
            </button>

            {/* Mark done */}
            <button
              onClick={toggleStatus}
              disabled={isUpdating}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all",
                isDone
                  ? "bg-accent-success/10 text-accent-success border border-accent-success/20 hover:bg-accent-success/20"
                  : "bg-white text-black hover:bg-gray-200"
              )}
            >
              {isUpdating
                ? <Loader2 size={13} className="animate-spin" />
                : isDone
                  ? <><CheckCircle2 size={13} /> Done</>
                  : "Mark Done"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent-primary/20">
                    <BrainCircuit className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">AI Task Analysis</h2>
                    <p className="text-[10px] text-gray-500 truncate max-w-[240px]">{title}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white p-2 bg-white/5 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-accent-primary/10 rounded-3xl flex items-center justify-center">
                        <BrainCircuit className="text-accent-primary" size={32} />
                      </div>
                      <Loader2 className="animate-spin text-accent-primary absolute -top-1 -right-1" size={20} />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">AI is analyzing your task...</p>
                    <p className="text-gray-700 text-xs">This takes a few seconds</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="glass-panel p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-accent-primary" />
                        <p className="text-[10px] font-black text-accent-primary uppercase tracking-widest">AI Summary</p>
                      </div>
                      <p className="text-white text-sm whitespace-pre-line leading-relaxed">{aiResponse}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Priority</p>
                        <p className={cn("font-black text-sm",
                          p === 3 ? "text-accent-danger" : p === 2 ? "text-accent-warning" : "text-accent-primary"
                        )}>{PRIORITY_LABEL[p]}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="font-black text-sm text-white">{isDone ? "Completed" : "In Progress"}</p>
                      </div>
                      {deadline && (
                        <div className="bg-white/5 p-4 rounded-2xl col-span-2 sm:col-span-1">
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Deadline</p>
                          <p className="font-black text-sm text-white">{new Date(deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {isManagerView && assignedDisplay && (
                      <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-2">
                        <User size={14} className="text-gray-500" />
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest">Assigned To</p>
                          <p className="font-bold text-sm text-white">{assignedDisplay}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 bg-white text-black rounded-2xl text-sm font-black hover:bg-gray-200 transition-colors uppercase"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
