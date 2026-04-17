"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  Building2, Copy, CheckCircle2, Loader2, Save,
  KeyRound, Users, ShieldCheck, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrgSettingsPage() {
  const { organizationId, userData } = useAuth();
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    getDoc(doc(db, "organizations", organizationId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setOrgData(data);
        setOrgName(data.name || "");
      }
      setLoading(false);
    });
  }, [organizationId]);

  const handleCopy = () => {
    if (!organizationId) return;
    navigator.clipboard.writeText(organizationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!organizationId || !orgName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "organizations", organizationId), { name: orgName.trim() });
      setToast("Organization name updated!");
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast("Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-2xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border bg-green-500/10 border-green-500/20 text-green-400"
          >
            <CheckCircle2 size={16} />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header>
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
          Organization <Building2 className="text-accent-primary" size={24} />
        </h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
          Manage your org settings and invite code
        </p>
      </header>

      {/* Org Code Card */}
      <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <KeyRound className="text-amber-400" size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">Invite Code</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Share with team members to join</p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
          <code className="text-amber-400 font-mono text-sm break-all flex-1">
            {organizationId}
          </code>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shrink-0"
          >
            {copied ? <CheckCircle2 size={14} className="text-accent-success" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-[10px] text-amber-400/80 font-bold leading-relaxed">
            New managers and users will enter this code during signup to join your organization.
            Keep it safe — anyone with this code can join.
          </p>
        </div>
      </div>

      {/* Org Name */}
      <div className="glass-panel p-8 rounded-[2.5rem] space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center">
            <Building2 className="text-purple-400" size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">Org Name</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Visible to all members</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Organization Name</label>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent-primary/50 transition-all font-bold"
            placeholder="e.g. Acme Corp"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || orgName === orgData?.name}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all shadow-xl uppercase disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Org Stats */}
      <div className="glass-panel p-8 rounded-[2.5rem] space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">Org Info</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Created</p>
            <p className="text-sm font-bold text-white">
              {orgData?.createdAt ? new Date(orgData.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Admin</p>
            <p className="text-sm font-bold text-white truncate">{orgData?.adminEmail || userData?.email || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
