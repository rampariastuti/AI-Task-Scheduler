"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Users, BrainCircuit, Calendar, Tag } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const CreateTaskForm = ({ eventId }: { eventId?: string }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkill: "",
    deadline: "",
    volunteersNeeded: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "tasks"), {
        ...formData,
        eventId: eventId || "general",
        status: "open",
        assignedUsers: [],
        createdAt: new Date().toISOString(),
      });
      alert("Task created successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-accent-success/20 rounded-lg text-accent-success">
          <CheckSquare size={20} />
        </div>
        <h2 className="text-xl font-bold">New Task Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400">Task Title</label>
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-accent-primary outline-none"
            placeholder="e.g. Logo Design"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400">Required Skill</label>
          <select 
            className="w-full bg-secondary border border-white/10 rounded-xl p-3 focus:border-accent-primary outline-none text-white"
            onChange={(e) => setFormData({...formData, requiredSkill: e.target.value})}
          >
            <option value="">Select Skill</option>
            <option value="UI/UX">UI/UX Design</option>
            <option value="Next.js">Next.js Development</option>
            <option value="Firebase">Firebase Backend</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400">Description</label>
        <textarea 
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-accent-primary outline-none"
          placeholder="Describe the task expectations..."
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Calendar size={12} /> Deadline
          </label>
          <input 
            type="date"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none"
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Users size={12} /> Volunteers
          </label>
          <input 
            type="number"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none"
            onChange={(e) => setFormData({...formData, volunteersNeeded: parseInt(e.target.value)})}
          />
        </div>

        <div className="flex items-end">
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">
            Save Task
          </button>
        </div>
      </div>
    </form>
  );
};