"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export const AddTaskModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, organizationId } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        priority: Number(priority),
        deadline,
        assignedTo: user.uid,
        organizationId: organizationId || "",
        status: "open",
        createdAt: new Date().toISOString(),
      });
      onClose();
      setTitle(""); setDescription(""); setDeadline(""); setPriority(1);
    } catch (err) {
      console.error(err);
      alert("Error saving task.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.form
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            onSubmit={handleSave}
            className="glass-panel p-8 sm:p-10 rounded-[3rem] w-full max-w-xl relative z-10 space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Create Task</h2>
              <button type="button" onClick={onClose} className="text-gray-500 hover:text-white p-2 bg-white/5 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Task Name</label>
                <input
                  required
                  placeholder="Enter task name..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent-primary/50 transition-all"
                  value={title} onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Priority</label>
                  <select
                    className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent-primary/50"
                    value={priority} onChange={e => setPriority(Number(e.target.value))}
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent-primary/50"
                    value={deadline} onChange={e => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Description</label>
                <textarea
                  placeholder="Add context or notes..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent-primary/50 resize-none"
                  value={description} onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={isSaving}
              className="w-full bg-accent-primary py-4 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-accent-primary/20 uppercase disabled:opacity-60"
            >
              <Sparkles size={18} />
              {isSaving ? "Saving..." : "Deploy Task"}
            </button>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};
