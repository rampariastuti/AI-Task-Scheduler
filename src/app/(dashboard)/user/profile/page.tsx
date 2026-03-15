"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Save, 
  Palette, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch real data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setName(userDoc.data().name || "");
      }
      setIsLoaded(true);
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: name,
        updatedAt: new Date().toISOString(),
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="text-4xl font-extrabold text-white italic tracking-tighter">SETTINGS</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">Manage your identity and preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-accent-primary to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-accent-primary/20">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{name || "TaskAI User"}</h3>
                <div className="flex items-center gap-2 text-accent-primary mt-1">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{role} Account</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-accent-primary/50 text-white transition-all"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input 
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 pl-12 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 shadow-xl"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              SAVE CHANGES
            </button>
          </form>

          {/* Theme Section */}
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-accent-primary" size={24} />
              <h3 className="text-xl font-bold text-white">Appearance</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button className="p-4 rounded-3xl bg-white/5 border-2 border-accent-primary text-left transition-all">
                <div className="w-8 h-8 rounded-full bg-accent-primary mb-3" />
                <p className="text-sm font-bold text-white">Deep Midnight</p>
                <p className="text-[10px] text-gray-500 uppercase mt-1">Active</p>
              </button>

              <button disabled className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 text-left opacity-40 cursor-not-allowed">
                <div className="w-8 h-8 rounded-full bg-gray-700 mb-3" />
                <p className="text-sm font-bold text-gray-400">Soft Gray</p>
                <p className="text-[10px] text-gray-600 uppercase mt-1">Coming Soon</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Status Summary */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-accent-primary/10 to-transparent">
            <h4 className="text-xs font-black text-accent-primary uppercase tracking-widest mb-4">Account Status</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                <CheckCircle2 size={16} className="text-accent-primary" /> Verified User
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                <CheckCircle2 size={16} className="text-accent-primary" /> Cloud Sync Active
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                <CheckCircle2 size={16} className="text-accent-primary" /> AI Prioritization V2
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}