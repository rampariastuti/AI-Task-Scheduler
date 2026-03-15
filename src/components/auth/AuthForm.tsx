"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, Sparkles, ArrowRight, 
  Shield, Users, UserCircle, AlertCircle 
} from "lucide-react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  fetchSignInMethodsForEmail 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // 1. Password Complexity Check
  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const isLongEnough = pass.length >= 6;
    return hasUpperCase && hasLowerCase && isLongEnough;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Front-end Validation Logic
    if (!isLogin) {
      if (!validatePassword(password)) {
        setErrorMsg("Password needs 6+ chars, 1 uppercase, and 1 lowercase.");
        setLoading(false);
        return;
      }
      if (!name) {
        setErrorMsg("Please enter your full name.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // LOGIN LOGIC
        try {
          const res = await signInWithEmailAndPassword(auth, email, password);
          const userDoc = await getDoc(doc(db, "users", res.user.uid));
          const userRole = userDoc.data()?.role || "USER";
          router.push(userRole === "ADMIN" ? "/admin" : userRole === "MANAGER" ? "/manager" : "/user");
        } catch (err: any) {
          // Firebase V9+ uses 'invalid-credential' for security, but we map it for UX
          if (err.code === "auth/invalid-credential") {
            setErrorMsg("Incorrect password or account does not exist.");
          } else if (err.code === "auth/user-not-found") {
            setErrorMsg("Account not found. Please sign up first.");
          } else {
            setErrorMsg("Login failed. Please check your credentials.");
          }
        }
      } else {
        // SIGNUP LOGIC
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        });
        router.push(role === "ADMIN" ? "/admin" : role === "MANAGER" ? "/manager" : "/user");
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("Email already exists. Try logging in.");
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-10 glass-panel rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-primary/20 blur-[80px]" />
      
      <div className="relative z-10">
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-14 h-14 bg-accent-primary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-accent-primary/30"
          >
            <Sparkles className="text-white" size={28} />
          </motion.div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            {isLogin ? "System Login" : "Create Account"}
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            {isLogin ? "Identity Verification" : "Choose your access level"}
          </p>
        </div>

        {/* Dynamic UI Error Message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold flex items-center gap-3 italic"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <>
              {/* Role Selection Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Define Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "USER", icon: UserCircle, label: "User" },
                    { id: "MANAGER", icon: Users, label: "Manager" },
                    { id: "ADMIN", icon: Shield, label: "Admin" }
                  ].map((r) => (
                    <button
                      key={r.id} type="button" onClick={() => setRole(r.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300",
                        role === r.id ? "bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20" : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                      )}
                    >
                      <r.icon size={18} className="mb-1" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Full Name</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                   <input required placeholder="" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Email Path</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input type="email" required placeholder="name@company.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input type="password" required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-accent-primary/50" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {!isLogin && (
              <p className="text-[9px] text-gray-600 ml-1 mt-1 italic">Min. 6 chars, 1 Uppercase, 1 Lowercase</p>
            )}
          </div>

          <button disabled={loading} className="w-full bg-white text-black font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 group transition-all hover:bg-gray-200 shadow-2xl mt-4 uppercase text-sm tracking-tight">
            {loading ? "Decrypting..." : isLogin ? "Access Dashboard" : "Deploy Profile"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
            {isLogin ? "Request New Account?" : "Return to Secure Login"}
          </button>
        </div>
      </div>
    </div>
  );
};  