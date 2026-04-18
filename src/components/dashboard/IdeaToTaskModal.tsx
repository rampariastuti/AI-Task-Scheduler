"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Lightbulb, Sparkles, Loader2, Save, AlertCircle,
  Calendar, Flag, FileText, Tag, RefreshCw
} from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { createTaskFromIdea } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface GeneratedTask {
  title: string;
  description: string;
  priority: number;
  deadline: string;
  tags: string[];
}

interface IdeaToTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdeaToTaskModal = ({ isOpen, onClose }: IdeaToTaskModalProps) => {
  const { user, organizationId } = useAuth();
  const [idea, setIdea] = useState("");
  const [step, setStep] = useState<"input" | "preview">("input");
  const [generated, setGenerated] = useState<GeneratedTask | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priorityConfig = {
    1: { label: "Low", color: "text-accent-primary bg-accent-primary/15 border-accent-primary/30" },
    2: { label: "Medium", color: "text-accent-warning bg-accent-warning/15 border-accent-warning/30" },
    3: { label: "Critical", color: "text-accent-danger bg-accent-danger/15 border-accent-danger/30" },
  };

  const handleGenerate = async () => {
    if (!idea.trim()) { setError("Please describe your idea."); return; }
    setError(null);
    setIsGenerating(true);
    try {
      const result = await createTaskFromIdea(idea.trim());
      setGenerated(result);
      setStep("preview");
    } catch {
      setError("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generated) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title: generated.title,
        description: generated.description,
        priority: generated.priority,
        deadline: generated.deadline,
        assignedTo: user.uid,
        organizationId: organizationId || "",
        status: "open",
        tags: generated.tags,
        createdAt: new Date().toISOString(),
        aiGenerated: true,
      });
      handleClose();
    } catch {
      setError("Failed to save task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIdea(""); setStep("input"); setGenerated(null);
    setError(null); setIsGenerating(false); setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            className="glass-panel rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-primary via-indigo-400 to-purple-500" />

            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/30">
                  <Lightbulb className="text-white" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">
                    AI Task Generator
                  </h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    {step === "input" ? "Describe your idea" : "Review AI-generated task"}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-600 hover:text-white transition-colors p-2 bg-white/5 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-8 pt-6 flex items-center gap-2">
              {["input", "preview"].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={cn(
                    "h-1.5 rounded-full flex-1 transition-all duration-500",
                    step === s || (step === "preview" && i === 0)
                      ? "bg-accent-primary" : "bg-white/10"
                  )} />
                </React.Fragment>
              ))}
            </div>

            <div className="p-8 space-y-6">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
                  >
                    <AlertCircle size={16} className="shrink-0" />{error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── STEP 1: Idea Input ── */}
              {step === "input" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Your Idea
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. 'Build a customer feedback dashboard', 'Set up CI/CD pipeline', 'Research competitor pricing'..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-accent-primary/50 transition-all resize-none leading-relaxed placeholder:text-gray-700"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                      }}
                    />
                    <p className="text-[9px] text-gray-700 ml-1">Press Ctrl+Enter to generate • The more detail, the better the task</p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !idea.trim()}
                    className="w-full bg-gradient-to-r from-accent-primary to-purple-600 py-4 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-40 uppercase text-sm tracking-tight"
                  >
                    {isGenerating ? (
                      <><Loader2 size={18} className="animate-spin" /> AI is thinking...</>
                    ) : (
                      <><Sparkles size={18} /> Generate Task with AI</>
                    )}
                  </button>
                </div>
              )}

              {/* ── STEP 2: Preview ── */}
              {step === "preview" && generated && (
                <div className="space-y-5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={12} /> Title
                    </label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-accent-primary/50 transition-all"
                      value={generated.title}
                      onChange={(e) => setGenerated({ ...generated, title: e.target.value })}
                    />
                  </div>

                  {/* Priority + Deadline row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Flag size={12} /> Priority
                      </label>
                      <select
                        className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent-primary/50 text-sm"
                        value={generated.priority}
                        onChange={(e) => setGenerated({ ...generated, priority: Number(e.target.value) })}
                      >
                        <option value={1}>Low</option>
                        <option value={2}>Medium</option>
                        <option value={3}>Critical</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> Deadline
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent-primary/50 text-sm"
                        value={generated.deadline}
                        onChange={(e) => setGenerated({ ...generated, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Priority badge */}
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold",
                    priorityConfig[generated.priority as 1 | 2 | 3].color
                  )}>
                    <Sparkles size={12} />
                    AI assigned: {priorityConfig[generated.priority as 1 | 2 | 3].label} Priority
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                    <textarea
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-300 text-sm outline-none focus:border-accent-primary/50 transition-all resize-none leading-relaxed"
                      value={generated.description}
                      onChange={(e) => setGenerated({ ...generated, description: e.target.value })}
                    />
                  </div>

                  {/* Tags */}
                  {generated.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag size={12} className="text-gray-600" />
                      {generated.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setStep("input"); setError(null); }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase"
                    >
                      <RefreshCw size={14} /> Regenerate
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-slate-900 text-slate-50 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl uppercase disabled:opacity-60"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSaving ? "Saving..." : "Save Task"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
