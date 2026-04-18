"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
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
  const [saved, setSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setIsLoaded(true);
    } else if (user) {
      setName(user.displayName || "");
      setIsLoaded(true);
    }
  }, [userData, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateDoc(doc(db, "users", user.uid), { name: name.trim(), updatedAt: new Date().toISOString() }),
        updateProfile(user, { displayName: name.trim() }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { } finally { setIsSaving(false); }
  };

  const initials = (name || userData?.name || user?.email || "U")[0].toUpperCase();
  const roleColor = role === "ADMIN" ? "from-red-500 to-orange-500"
    : role === "MANAGER" ? "from-blue-500 to-indigo-500"
    : "from-accent-primary to-purple-500";

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <header>
        <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">Profile Settings</h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Manage your identity and preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile form */}
          <form onSubmit={handleUpdate} className="glass-panel p-8 rounded-[2.5rem] space-y-7">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl shrink-0 bg-gradient-to-tr",
                roleColor
              )}>
                <span className="text-3xl font-black text-white">{initials}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-white truncate">{name || "TaskAI User"}</h3>
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
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 outline-none focus:border-accent-primary/50 text-white transition-all text-sm"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    disabled value={user?.email || ""}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 pl-11 text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
                <p className="text-[9px] text-gray-700 ml-1">Email cannot be changed</p>
              </div>
            </div>

            <button
              type="submit" disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 text-slate-50 px-7 py-3.5 rounded-2xl font-black hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl text-sm uppercase"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} />
                : saved ? <CheckCircle2 size={16} className="text-accent-success" />
                : <Save size={16} />}
              {saved ? "Saved!" : isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Appearance */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3">
              <Palette className="text-accent-primary" size={20} />
              <h3 className="text-base font-black text-white uppercase tracking-tight">Appearance</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => theme === "light" && toggleTheme()}
                className={cn(
                  "p-5 rounded-3xl text-left transition-all duration-300 border-2 relative",
                  theme === "dark"
                    ? "border-accent-primary bg-accent-primary/10 shadow-lg shadow-accent-primary/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                )}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#080d1a] flex items-center justify-center mb-4 shadow-md">
                  <Moon size={18} className="text-accent-primary" />
                </div>
                <p className="text-sm font-black text-white">Dark Mode</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Midnight Navy</p>
                {theme === "dark" && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => theme === "dark" && toggleTheme()}
                className={cn(
                  "p-5 rounded-3xl text-left transition-all duration-300 border-2 relative",
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

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon size={18} className="text-accent-primary" /> : <Sun size={18} className="text-amber-500" />}
                <div>
                  <p className="text-sm font-bold text-white">{theme === "dark" ? "Dark Mode Active" : "Light Mode Active"}</p>
                  <p className="text-[10px] text-gray-500">Click to toggle</p>
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

        {/* Right column */}
        <div className="space-y-5">
          <div className="glass-panel p-7 rounded-[2.5rem] bg-gradient-to-b from-accent-primary/10 to-transparent">
            <h4 className="text-[10px] font-black text-accent-primary uppercase tracking-widest mb-5">Account Status</h4>
            <ul className="space-y-4">
              {["Verified User", "Cloud Sync Active", "AI Prioritization V2", "Organization Linked"].map(item => (
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
            <p className="text-[9px] text-gray-700 mt-3 leading-relaxed">
              Role is assigned by your organization admin and cannot be changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
