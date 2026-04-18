"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  UserCog, Loader2, Search, Shield, Users, UserCircle,
  Trash2, CheckCircle2, AlertCircle, UserPlus, Copy, X, KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrgUser {
  id: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "MANAGER" | "USER";
  createdAt?: string;
  lastActive?: string;
}

const ROLE_CONFIG = {
  ADMIN: { icon: Shield, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  MANAGER: { icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  USER: { icon: UserCircle, color: "text-accent-primary bg-accent-primary/10 border-accent-primary/20" },
};

export default function ManageUsersPage() {
  const { organizationId, user: currentUser, userData: currentUserData } = useAuth();
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "MANAGER" | "USER">("ALL");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!organizationId) return;
    const q = query(collection(db, "users"), where("organizationId", "==", organizationId));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as OrgUser)));
      setLoading(false);
    });
    return unsub;
  }, [organizationId]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser?.uid) { showToast("Cannot change your own role.", "error"); return; }
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      showToast(`Role updated to ${newRole}`);
    } catch { showToast("Failed to update role.", "error"); }
    finally { setUpdatingId(null); }
  };

  const handleRemoveUser = async (userId: string, name?: string) => {
    if (userId === currentUser?.uid) { showToast("Cannot remove yourself.", "error"); return; }
    if (!confirm(`Remove ${name || "this user"} from the organization?`)) return;
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, "users", userId), { organizationId: null, orgName: null, role: "USER" });
      showToast(`${name || "User"} removed.`);
    } catch { showToast("Failed to remove user.", "error"); }
    finally { setUpdatingId(null); }
  };

  const handleCopyCode = () => {
    if (!organizationId) return;
    navigator.clipboard.writeText(organizationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOnline = (lastActive?: string) =>
    lastActive ? Date.now() - new Date(lastActive).getTime() < 15 * 60 * 1000 : false;

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn(
              "fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border",
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-[3rem] w-full max-w-lg relative z-10 p-8 space-y-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center">
                    <UserPlus className="text-accent-primary" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Add User</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Share the invite code</p>
                  </div>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Org Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <KeyRound size={12} /> Organization Invite Code
                </label>
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-4">
                  <code className="text-amber-400 font-mono text-sm flex-1 break-all">{organizationId}</code>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shrink-0"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-accent-success" /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">How to add a team member</p>
                {[
                  { step: "1", text: "Share the invite code above with your team member" },
                  { step: "2", text: `They go to the app and click "Don't have an account? Sign Up"` },
                  { step: "3", text: "They select their role (Manager or User), enter the code, and register" },
                  { step: "4", text: "They'll appear in this list automatically once signed up" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-black text-accent-primary">{step}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-snug">{text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full bg-accent-primary py-4 rounded-2xl font-black text-slate-50 text-sm uppercase flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Code Copied!" : "Copy Invite Code"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            Manage Users <UserCog className="text-accent-primary" size={24} />
          </h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
            {currentUserData?.orgName} · {users.length} member{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-accent-primary text-slate-50 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-indigo-500 transition-all shadow-lg shadow-accent-primary/20 w-full sm:w-auto justify-center"
        >
          <UserPlus size={16} /> Add User
        </button>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent-primary transition-colors" size={18} />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-white outline-none focus:border-accent-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "ADMIN", "MANAGER", "USER"] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                roleFilter === r ? "bg-accent-primary text-slate-50 shadow-lg shadow-accent-primary/20" : "bg-white/5 text-gray-500 hover:text-gray-900 border border-white/10"
              )}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-accent-primary" size={40} />
          <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Loading team...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-[3rem]">
          <Users className="mx-auto text-gray-800 mb-4" size={48} />
          <p className="text-gray-600 font-bold mb-4">No users found.</p>
          <button onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 text-accent-primary text-sm font-bold hover:underline mx-auto">
            <UserPlus size={16} /> Add your first team member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => {
            const roleConf = ROLE_CONFIG[u.role || "USER"];
            const online = isOnline(u.lastActive);
            const isMe = u.id === currentUser?.uid;
            return (
              <motion.div key={u.id} layout
                className="glass-panel p-5 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-white/10 transition-all"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary/30 to-purple-500/20 flex items-center justify-center">
                    <span className="text-lg font-black text-white uppercase">
                      {u.name?.[0] || u.email?.[0] || "U"}
                    </span>
                  </div>
                  {online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-accent-success rounded-full border-2 border-[#0a0a0a]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white text-sm">{u.name || "Unnamed"}</p>
                    {isMe && <span className="text-[9px] bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full font-bold uppercase">You</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={cn("text-[9px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider", roleConf.color)}>
                      {u.role || "USER"}
                    </span>
                    <span className={cn("text-[9px] font-bold uppercase", online ? "text-accent-success" : "text-gray-700")}>
                      {online ? "● Online" : "○ Offline"}
                    </span>
                    {u.createdAt && (
                      <span className="text-[9px] text-gray-700">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isMe && (
                  <div className="flex items-center gap-2 shrink-0">
                    {updatingId === u.id ? (
                      <Loader2 className="animate-spin text-accent-primary" size={20} />
                    ) : (
                      <>
                        <select
                          value={u.role || "USER"}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent-primary/50 cursor-pointer"
                        >
                          <option value="USER">User</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveUser(u.id, u.name)}
                          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
