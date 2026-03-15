"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, UserPlus, Search, Loader2, Check } from "lucide-react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export const AssignTaskModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const snap = await getDocs(collection(db, "users"));
        const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeamMembers(users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    if (isOpen) fetchUsers();
  }, [isOpen]);

  const filteredMembers = teamMembers.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId) return alert("Please select a team member first!");
    setIsSaving(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title, description, priority, deadline,
        assignedTo: assigneeId,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      onClose();
      setTitle(""); setDescription(""); setAssigneeId(""); setDeadline("");
    } catch (err) { 
      console.error(err); 
      alert("Permission denied. Check Firestore Rules.");
    } finally { 
      setIsSaving(false); 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.form 
            initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }}
            onSubmit={handleSave} 
            className="glass-panel p-8 md:p-10 rounded-[3rem] w-full max-w-3xl relative z-10 space-y-8 border border-white/5"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Assign Mission</h2>
              <button type="button" onClick={onClose} className="text-gray-500 hover:text-white p-2 bg-white/5 rounded-xl"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Member Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Select Assignee</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                  <input 
                    placeholder="Search by name or email..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-9 text-xs text-white outline-none focus:border-accent-primary"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {isLoadingUsers ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent-primary" /></div>
                  ) : filteredMembers.length === 0 ? (
                    <p className="text-center py-10 text-xs text-gray-600 italic">No members found.</p>
                  ) : (
                    filteredMembers.map(member => (
                      <button
                        key={member.id} type="button" onClick={() => setAssigneeId(member.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                          assigneeId === member.id ? "bg-accent-primary border-accent-primary shadow-lg shadow-accent-primary/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-[10px] uppercase">{member.name?.[0]}</div>
                          <div>
                            <p className="text-[11px] font-bold text-white">{member.name}</p>
                            <p className="text-[9px] text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        {assigneeId === member.id && <Check size={16} className="text-white" />}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Task Config */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Title</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-accent-primary" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Priority</label>
                    <select className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-xs outline-none" value={priority} onChange={e => setPriority(Number(e.target.value))}>
                      <option value={1}>Routine</option>
                      <option value={2}>Medium</option>
                      <option value={3}>Critical</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Deadline</label>
                    <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] outline-none" value={deadline} onChange={e => setDeadline(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                  <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none resize-none" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
            </div>

            <button disabled={isSaving || !assigneeId} className="w-full bg-white text-black py-5 rounded-[1.8rem] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-gray-200 transition-all uppercase text-sm disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Deploy Assignment
            </button>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};