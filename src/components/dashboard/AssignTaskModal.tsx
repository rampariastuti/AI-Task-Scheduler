"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Search, Loader2, Check, Sparkles, BrainCircuit } from "lucide-react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getAIPriority } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

const PRIORITY_CONFIG = {
  1: { label: "Low", color: "text-accent-primary bg-accent-primary/10 border-accent-primary/20" },
  2: { label: "Medium", color: "text-accent-warning bg-accent-warning/10 border-accent-warning/20" },
  3: { label: "Critical", color: "text-accent-danger bg-accent-danger/10 border-accent-danger/20" },
};

export const AssignTaskModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { organizationId, user: currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [aiPriority, setAiPriority] = useState<number | null>(null);
  const [loadingPriority, setLoadingPriority] = useState(false);

  useEffect(() => {
    if (!isOpen || !organizationId) return;
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("organizationId", "==", organizationId))
        );
        // Only Managers and Users — not Admins
        const members = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as TeamMember))
          .filter(m => m.role !== "ADMIN");
        setTeamMembers(members);
      } catch { } finally { setIsLoadingUsers(false); }
    };
    fetchUsers();
  }, [isOpen, organizationId]);

  // Auto-generate AI priority when title+description are filled (debounced)
  useEffect(() => {
    if (!title.trim() || !description.trim()) { setAiPriority(null); return; }
    const timer = setTimeout(async () => {
      setLoadingPriority(true);
      const p = await getAIPriority(title, description);
      setAiPriority(p);
      setLoadingPriority(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [title, description]);

  const filteredMembers = teamMembers.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId) return alert("Please select a team member.");
    setIsSaving(true);
    const finalPriority = aiPriority || 2;
    try {
      await addDoc(collection(db, "tasks"), {
        title, description,
        priority: finalPriority,
        deadline,
        assignedTo: assigneeId,
        organizationId: organizationId || "",
        status: "open",
        createdAt: new Date().toISOString(),
        aiAssignedPriority: true,
      });
      onClose();
      setTitle(""); setDescription(""); setAssigneeId("");
      setDeadline(""); setAiPriority(null);
    } catch {
      alert("Failed to assign task. Check Firestore rules.");
    } finally { setIsSaving(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.form
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            onSubmit={handleSave}
            className="glass-panel p-6 sm:p-8 rounded-[3rem] w-full max-w-3xl relative z-10 space-y-6 border border-white/5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Assign Mission</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">AI will assign priority automatically</p>
              </div>
              <button type="button" onClick={onClose} className="text-gray-500 hover:text-white p-2 bg-white/5 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Member Selection — Managers & Users only */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Select Assignee <span className="text-gray-700">(Managers & Users)</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                  <input
                    placeholder="Search by name or email..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-9 text-xs text-white outline-none focus:border-accent-primary"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {isLoadingUsers ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-accent-primary" size={24} /></div>
                  ) : filteredMembers.length === 0 ? (
                    <p className="text-center py-8 text-xs text-gray-600 italic">No members found.</p>
                  ) : filteredMembers.map(member => (
                    <button key={member.id} type="button" onClick={() => setAssigneeId(member.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left",
                        assigneeId === member.id
                          ? "bg-accent-primary border-accent-primary shadow-lg shadow-accent-primary/20"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] uppercase shrink-0">
                          {member.name?.[0] || member.email?.[0] || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{member.name || "Unnamed"}</p>
                          <p className="text-[9px] text-gray-500 truncate">{member.email}</p>
                          <p className="text-[9px] text-gray-600 uppercase">{member.role}</p>
                        </div>
                      </div>
                      {assigneeId === member.id && <Check size={14} className="text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Config */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Task Title</label>
                  <input required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-accent-primary"
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Task title..."
                  />
                </div>

                {/* AI Priority badge */}
                <div className="flex items-center gap-3 min-h-[36px]">
                  <BrainCircuit size={14} className="text-accent-primary shrink-0" />
                  {loadingPriority ? (
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <Loader2 size={12} className="animate-spin" /> AI assigning priority...
                    </div>
                  ) : aiPriority ? (
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase",
                      PRIORITY_CONFIG[aiPriority as 1|2|3].color
                    )}>
                      <Sparkles size={10} />
                      AI Priority: {PRIORITY_CONFIG[aiPriority as 1|2|3].label}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-600 italic">Fill title & description → AI assigns priority</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Deadline</label>
                  <input type="datetime-local"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white outline-none focus:border-accent-primary"
                    value={deadline} onChange={e => setDeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                  <textarea rows={4}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none resize-none focus:border-accent-primary"
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what needs to be done..."
                  />
                  <p className="text-[9px] text-gray-700 ml-1">AI reads title + description to auto-assign priority</p>
                </div>
              </div>
            </div>

            <button disabled={isSaving || !assigneeId}
              className="w-full bg-white text-black py-4 rounded-[1.8rem] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-gray-200 transition-all uppercase text-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              {isSaving ? "Assigning..." : "Deploy Assignment"}
            </button>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};
