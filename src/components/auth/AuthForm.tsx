"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, Sparkles, ArrowRight,
  Shield, Users, UserCircle, AlertCircle, Building2,
  KeyRound, CheckCircle2, Copy, ChevronLeft
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, addDoc, collection
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type View = "login" | "signup" | "forgot";

export const AuthForm = () => {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [orgCode, setOrgCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const resetForm = () => {
    setEmail(""); setPassword(""); setName(""); setOrgCode("");
    setOrgName(""); setErrorMsg(null); setSuccessMsg(null);
  };

  const validatePassword = (pass: string) => {
    return /[A-Z]/.test(pass) && /[a-z]/.test(pass) && pass.length >= 6;
  };

  // ── FORGOT PASSWORD ──────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrorMsg("Please enter your email address."); return; }
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Reset link sent! Check your inbox (and spam folder).");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setErrorMsg("No account found with this email.");
      } else {
        setErrorMsg("Failed to send reset email. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      const userRole = userDoc.data()?.role || "USER";
      router.push(userRole === "ADMIN" ? "/admin" : userRole === "MANAGER" ? "/manager" : "/user");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setErrorMsg("Incorrect email or password.");
      } else if (err.code === "auth/user-not-found") {
        setErrorMsg("No account found. Please sign up.");
      } else {
        setErrorMsg("Login failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP ───────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name) { setErrorMsg("Please enter your full name."); return; }
    if (!validatePassword(password)) {
      setErrorMsg("Password needs 6+ chars, 1 uppercase, and 1 lowercase.");
      return;
    }
    if (role === "ADMIN" && !orgName) {
      setErrorMsg("Please enter your organization name.");
      return;
    }
    if ((role === "MANAGER" || role === "USER") && !orgCode) {
      setErrorMsg("Please enter the organization code provided by your admin.");
      return;
    }

    setLoading(true);
    try {
      if (role === "ADMIN") {
        // Admin creates a new organization
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const orgRef = await addDoc(collection(db, "organizations"), {
          name: orgName,
          adminId: res.user.uid,
          adminEmail: email,
          createdAt: new Date().toISOString(),
        });

        await setDoc(doc(db, "users", res.user.uid), {
          name, email, role,
          organizationId: orgRef.id,
          orgName,
          createdAt: new Date().toISOString(),
        });
        router.push("/admin");

      } else {
        // Manager / User joins existing org
        const orgDoc = await getDoc(doc(db, "organizations", orgCode.trim()));
        if (!orgDoc.exists()) {
          setErrorMsg("Invalid organization code. Ask your admin for the correct code.");
          setLoading(false);
          return;
        }
        const org = orgDoc.data();
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          name, email, role,
          organizationId: orgCode.trim(),
          orgName: org.name,
          createdAt: new Date().toISOString(),
        });
        router.push(role === "MANAGER" ? "/manager" : "/user");
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("Email already in use. Try logging in.");
      } else {
        setErrorMsg(error.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md p-8 sm:p-10 glass-panel rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-primary/20 blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-14 h-14 bg-accent-primary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-accent-primary/30"
          >
            {view === "forgot" ? <KeyRound className="text-white" size={26} /> : <Sparkles className="text-white" size={26} />}
          </motion.div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            {view === "login" ? "System Login" : view === "signup" ? "Create Account" : "Reset Password"}
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            {view === "login" ? "Identity Verification" : view === "signup" ? "Choose your access level" : "We'll email you a reset link"}
          </p>
        </div>

        {/* Error / Success Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold flex items-center gap-3"
            >
              <AlertCircle size={16} className="shrink-0" />{errorMsg}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold flex items-center gap-3"
            >
              <CheckCircle2 size={16} className="shrink-0" />{successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FORGOT PASSWORD FORM ── */}
        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Your Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="email" required placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              disabled={loading || !!successMsg}
              className="w-full bg-white text-black font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-2xl mt-2 uppercase text-sm tracking-tight disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => { setView("login"); resetForm(); }}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em] mt-2"
            >
              <ChevronLeft size={14} /> Back to Login
            </button>
          </form>
        )}

        {/* ── LOGIN FORM ── */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input type="email" required placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => { setView("forgot"); resetForm(); }}
                  className="text-[10px] font-bold text-accent-primary hover:text-indigo-400 transition-colors uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input type="password" required placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-2xl mt-4 uppercase text-sm tracking-tight disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
              <ArrowRight size={18} />
            </button>
            <div className="mt-6 text-center">
              <button type="button" onClick={() => { setView("signup"); resetForm(); }}
                className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                Don't have an account? Sign Up
              </button>
            </div>
          </form>
        )}

        {/* ── SIGNUP FORM ── */}
        {view === "signup" && (
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Select Role</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "USER", icon: UserCircle, label: "User" },
                  { id: "MANAGER", icon: Users, label: "Manager" },
                  { id: "ADMIN", icon: Shield, label: "Admin" },
                ].map((r) => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300",
                      role === r.id
                        ? "bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20"
                        : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                    )}
                  >
                    <r.icon size={18} className="mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{r.label}</span>
                  </button>
                ))}
              </div>
              {role === "ADMIN" && (
                <p className="text-[9px] text-amber-500/80 ml-1 font-bold">
                  Admin creates a new organization. You'll get an org code to share with your team.
                </p>
              )}
              {(role === "MANAGER" || role === "USER") && (
                <p className="text-[9px] text-blue-400/80 ml-1 font-bold">
                  You'll join an existing organization using the code provided by your admin.
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required placeholder="Your full name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            {/* Org Name (Admin) or Org Code (Manager/User) */}
            {role === "ADMIN" ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input required placeholder="e.g. Acme Corp, My Startup"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all"
                    value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Organization Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input required placeholder="Paste org code from your admin"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all font-mono text-sm"
                    value={orgCode} onChange={(e) => setOrgCode(e.target.value)} />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input type="email" required placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input type="password" required placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50 transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <p className="text-[9px] text-gray-600 ml-1 mt-1">Min. 6 chars, 1 uppercase, 1 lowercase</p>
            </div>

            <button disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-2xl mt-4 uppercase text-sm tracking-tight disabled:opacity-60"
            >
              {loading ? "Setting up..." : "Create Account"}
              <ArrowRight size={18} />
            </button>
            <div className="mt-6 text-center">
              <button type="button" onClick={() => { setView("login"); resetForm(); }}
                className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                Already have an account? Log In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
