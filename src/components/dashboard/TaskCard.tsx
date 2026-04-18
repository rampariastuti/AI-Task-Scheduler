"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Trash2, Clock, AlertTriangle,
  Loader2, X, BrainCircuit, User, Sparkles, Pencil, Save
} from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { getSingleTaskAnalysis, getAIPriority, type TaskAnalysis } from "@/lib/gemini";

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
  isManagerView?: boolean; // explicit — false means read-only user view
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
  isManagerView = false,
}: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<TaskAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editDeadline, setEditDeadline] = useState(
    deadline ? new Date(deadline).toISOString().slice(0, 16) : ""
  );
  const [editPriority, setEditPriority] = useState<number>(priority);
  const [loadingPriority, setLoadingPriority] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isDone = status === "completed";
  const p = displayPriority || priority;

  const assignedDisplay = (() => {
    if (assignedToName) return assignedToName;
    if (assignedUserNames?.length) return assignedUserNames.length === 1 ? assignedUserNames[0] : `${assignedUserNames.length} members`;
    if (assignedUsers?.length) return `${assignedUsers.length} user(s)`;
    return null;
  })();

  // Re-run AI priority when title or description changes in edit form (debounced)
  useEffect(() => {
    if (!isEditOpen) return;
    if (!editTitle.trim() || !editDescription.trim()) return;
    const timer = setTimeout(async () => {
      setLoadingPriority(true);
      const p = await getAIPriority(editTitle, editDescription);
      setEditPriority(p);
      setLoadingPriority(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [editTitle, editDescription, isEditOpen]);

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "tasks", id), {
        status: isDone ? "open" : "completed",
        updatedAt: new Date().toISOString(),
      });
    } catch { } finally { setIsUpdating(false); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this task?")) return;
    try { await deleteDoc(doc(db, "tasks", id)); } catch { }
  };

  const openAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAIOpen(true);
    if (aiResponse) return;
    setLoadingAI(true);
    try {
      const resp = await getSingleTaskAnalysis({ title, description, priority: p, status, deadline });
      setAiResponse(resp);
    } catch {
      setAiResponse(null);
    } finally { setLoadingAI(false); }
  };

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(title);
    setEditDescription(description);
    setEditDeadline(deadline ? new Date(deadline).toISOString().slice(0, 16) : "");
    setEditPriority(priority);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      await updateDoc(doc(db, "tasks", id), {
        title: editTitle.trim(),
        description: editDescription.trim(),
        deadline: editDeadline || null,
        priority: editPriority,
        updatedAt: new Date().toISOString(),
      });
      setIsEditOpen(false);
    } catch { } finally { setIsSavingEdit(false); }
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
          <div className={cn(
            "absolute top-5 text-accent-danger flex items-center gap-1",
            isManagerView ? "right-20" : "right-5"
          )}>
            <AlertTriangle size={14} className="animate-pulse" />
            <span className="text-[9px] font-black tracking-tighter uppercase">Urgent</span>
          </div>
        )}

        {/* Manager-only controls: edit + delete */}
        {isManagerView && (
          <div className="absolute top-5 right-5 flex items-center gap-1">
            <button
              onClick={openEdit}
              className="text-gray-600 hover:text-accent-primary transition-colors p-1"
              title="Edit task"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-700 hover:text-accent-danger transition-colors p-1"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <div className="space-y-3">
          {/* Priority badge */}
          <span className={cn(
            "inline-flex items-center text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
            PRIORITY_COLOR[p] || PRIORITY_COLOR[1]
          )}>
            {PRIORITY_LABEL[p] || "Low"} Priority
          </span>

          {/* Title */}
          <h3 className={cn(
            "text-lg font-black text-white leading-tight",
            isManagerView ? "pr-12" : "pr-2",
            isDone && "line-through opacity-60"
          )}>
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
            <button
              onClick={openAI}
              disabled={isDone}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/20 disabled:opacity-40"
            >
              <BrainCircuit size={13} /> AI Analysis
            </button>

            <button
              onClick={toggleStatus}
              disabled={isUpdating}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all",
                isDone
                  ? "bg-accent-success/10 text-accent-success border border-accent-success/20 hover:bg-accent-success/20"
                  : "bg-slate-900 text-slate-50 hover:bg-slate-800"
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

      {/* ── EDIT TASK MODAL (manager only) ── */}
      <AnimatePresence>
        {isEditOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditOpen(false)}
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleSaveEdit}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center">
                    <Pencil className="text-accent-primary" size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white uppercase tracking-tight">Edit Task</h2>
                    <p className="text-[10px] text-gray-500">AI will reassign priority on changes</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsEditOpen(false)} className="text-gray-500 hover:text-white p-2 bg-white/5 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Task Title</label>
                  <input
                    required
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-accent-primary/50 transition-all"
                    placeholder="Task title..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none resize-none focus:border-accent-primary/50 transition-all"
                    placeholder="Task description..."
                  />
                </div>

                {/* AI Priority — live update */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl min-h-[44px]">
                  <BrainCircuit size={14} className="text-accent-primary shrink-0" />
                  {loadingPriority ? (
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <Loader2 size={11} className="animate-spin" /> Reassigning priority...
                    </div>
                  ) : (
                    <span className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-full uppercase border",
                      PRIORITY_COLOR[editPriority] || PRIORITY_COLOR[2]
                    )}>
                      <Sparkles size={9} className="inline mr-1" />
                      AI Priority: {PRIORITY_LABEL[editPriority] || "Medium"}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-700 ml-auto">updates as you type</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={11} /> Deadline / Timeline
                  </label>
                  <input
                    type="datetime-local"
                    value={editDeadline}
                    onChange={e => setEditDeadline(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white outline-none focus:border-accent-primary/50 transition-all"
                  />
                  {editDeadline && (
                    <button type="button" onClick={() => setEditDeadline("")} className="text-[9px] text-gray-600 hover:text-accent-danger transition-colors ml-1">
                      Clear deadline
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 bg-white/5 text-gray-400 rounded-2xl text-sm font-black hover:bg-white/10 transition-colors uppercase border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || loadingPriority}
                  className="flex-1 py-3 bg-slate-900 text-slate-50 rounded-2xl text-sm font-black hover:bg-slate-800 transition-colors uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ── AI ANALYSIS MODAL ── */}
      <AnimatePresence>
        {isAIOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAIOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
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
                <button onClick={() => setIsAIOpen(false)} className="text-gray-500 hover:text-white p-2 bg-white/5 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-accent-primary/10 rounded-3xl flex items-center justify-center">
                        <BrainCircuit className="text-accent-primary" size={32} />
                      </div>
                      <Loader2 className="animate-spin text-accent-primary absolute -top-1 -right-1" size={20} />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Analyzing task...</p>
                    <p className="text-gray-700 text-xs">This takes a few seconds</p>
                  </div>
                ) : !aiResponse ? (
                  <div className="py-16 text-center text-gray-600 text-sm">Unable to analyze. Try again.</div>
                ) : (
                  <div className="space-y-4">
                    {/* Quick stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 p-3 rounded-2xl text-center">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Priority</p>
                        <p className={cn("font-black text-sm",
                          p === 3 ? "text-accent-danger" : p === 2 ? "text-accent-warning" : "text-accent-primary"
                        )}>{PRIORITY_LABEL[p]}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl text-center">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Effort</p>
                        <p className={cn("font-black text-sm",
                          aiResponse.effort === "High" ? "text-accent-danger" :
                          aiResponse.effort === "Medium" ? "text-accent-warning" : "text-accent-primary"
                        )}>{aiResponse.effort}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl text-center">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="font-black text-sm text-white">{isDone ? "Done" : "Active"}</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-accent-primary/5 border border-accent-primary/15 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-accent-primary" />
                        <p className="text-[9px] font-black text-accent-primary uppercase tracking-widest">Summary</p>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{aiResponse.summary}</p>
                    </div>

                    {/* Priority reason */}
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Why This Priority</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{aiResponse.priorityReason}</p>
                    </div>

                    {/* Time note */}
                    <div className="bg-white/5 p-4 rounded-2xl flex gap-3">
                      <Clock size={15} className="text-accent-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Timeline</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{aiResponse.timeNote}</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {aiResponse.recommendations.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Recommended Steps</p>
                        <div className="space-y-2">
                          {aiResponse.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="w-5 h-5 rounded-full bg-accent-primary/20 text-accent-primary text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-gray-300 text-sm leading-relaxed">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned to (manager view) */}
                    {isManagerView && assignedDisplay && (
                      <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                        <User size={14} className="text-gray-500 shrink-0" />
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
                  onClick={() => setIsAIOpen(false)}
                  className="w-full py-3 bg-slate-900 text-slate-50 rounded-2xl text-sm font-black hover:bg-slate-800 transition-colors uppercase"
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
