"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  User, Mail, ShieldCheck, Save, Palette,
  CheckCircle2, Loader2, Moon, Sun, Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, role, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) setName(userDoc.data().name || "");
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
        name, updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { } finally { setIsSaving(false); }
  };

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">Settings</h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Manage your identity and preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Account + Appearance */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile Form */}
          <form onSubmit={handleUpdate} className="glass-panel p-8 rounded-[2.5rem] space-y-7">
            {/* Avatar row */}
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 w-16 h-16 bg-gradient-to-tr from-accent-primary to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-accent-primary/20 shrink-0">
                <span className="text-2xl font-black text-white uppercase">{name?.[0] || user?.email?.[0] || "U"}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{name || "TaskAI User"}</h3>
                <div className="flex items-center gap-2 text-accent-primary mt-1">
                  <ShieldCheck size={13} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{role} Account</span>
                </div>
                {userData?.orgName && (
                  <div className="flex items-center gap-2 text-gray-500 mt-0.5">
                    <Building2 size={12} />
                    <span className="text-[10px] font-bold">{userData.orgName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 outline-none focus:border-accent-primary/50 text-white transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    disabled value={user?.email || ""}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 pl-11 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={isSaving}
              className="flex items-center gap-2 bg-white text-black px-7 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all disabled:opacity-50 shadow-xl text-sm uppercase"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : saved ? <CheckCircle2 size={16} className="text-accent-success" /> : <Save size={16} />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </form>

          {/* Appearance / Theme */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3">
              <Palette className="text-accent-primary" size={22} />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Appearance</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => theme === "light" && toggleTheme()}
                className={cn(
                  "p-5 rounded-3xl text-left transition-all duration-300 border-2 relative overflow-hidden group",
                  theme === "dark"
                    ? "border-accent-primary bg-accent-primary/10 shadow-lg shadow-accent-primary/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                )}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#0a0a0a] flex items-center justify-center mb-4 shadow-md">
                  <Moon size={18} className="text-accent-primary" />
                </div>
                <p className="text-sm font-black text-white">Dark Mode</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Deep Midnight</p>
                {theme === "dark" && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </button>

              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => theme === "dark" && toggleTheme()}
                className={cn(
                  "p-5 rounded-3xl text-left transition-all duration-300 border-2 relative overflow-hidden group",
                  theme === "light"
                    ? "border-accent-primary bg-accent-primary/10 shadow-lg shadow-accent-primary/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                )}
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 shadow-md">
                  <Sun size={18} className="text-amber-500" />
                </div>
                <p className="text-sm font-black text-white">Light Mode</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Soft White</p>
                {theme === "light" && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </button>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon size={18} className="text-accent-primary" /> : <Sun size={18} className="text-amber-500" />}
                <div>
                  <p className="text-sm font-bold text-white">
                    {theme === "dark" ? "Dark Mode Active" : "Light Mode Active"}
                  </p>
                  <p className="text-[10px] text-gray-500">Click to switch theme</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={cn(
                  "relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none",
                  theme === "dark" ? "bg-accent-primary" : "bg-amber-400"
                )}
              >
                <motion.div
                  animate={{ x: theme === "dark" ? 2 : 30 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Account Status */}
        <div className="space-y-5">
          <div className="glass-panel p-7 rounded-[2.5rem] bg-gradient-to-b from-accent-primary/10 to-transparent">
            <h4 className="text-[10px] font-black text-accent-primary uppercase tracking-widest mb-5">Account Status</h4>
            <ul className="space-y-4">
              {[
                "Verified User",
                "Cloud Sync Active",
                "AI Prioritization V2",
                "Organization Linked",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <CheckCircle2 size={15} className="text-accent-primary shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-7 rounded-[2.5rem]">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Role</h4>
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl",
              role === "ADMIN" ? "bg-red-500/10 text-red-400" :
              role === "MANAGER" ? "bg-blue-500/10 text-blue-400" :
              "bg-accent-primary/10 text-accent-primary"
            )}>
              <ShieldCheck size={18} />
              <span className="font-black text-sm uppercase">{role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
