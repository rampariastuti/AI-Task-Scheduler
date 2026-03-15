"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();
  const { role, user } = useAuth();
  
  // Get items based on role, filtering out any 'System Logs' if they exist in NAV_ITEMS
  const menuItems = role 
    ? NAV_ITEMS[role as keyof typeof NAV_ITEMS].filter(item => item.label !== "System Logs") 
    : [];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-20 lg:w-64 h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-5 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-12 shrink-0">
        <div className="w-10 h-10 bg-accent-primary rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/20">
          <Sparkles className="text-white" size={20} />
        </div>
        <span className="font-black text-xl tracking-tighter hidden lg:block text-white uppercase italic">TaskAI</span>
      </div>

      {/* Navigation Links - Improved spacing to prevent merging */}
      <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} className="block">
              <div className={cn(
                "relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group cursor-pointer",
                isActive 
                  ? "text-white bg-accent-primary/10 border border-accent-primary/20" 
                  : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
              )}>
                <item.icon size={22} className={cn(isActive && "text-accent-primary")} />
                <span className="font-bold text-sm hidden lg:block tracking-tight">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-accent-primary/5 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="mt-auto border-t border-white/5 pt-8 space-y-6 shrink-0">
        <div className="flex items-center gap-3 px-2">
           <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-indigo-600 shrink-0 shadow-lg shadow-accent-primary/20" />
           <div className="hidden lg:block overflow-hidden">
             <p className="text-[11px] font-bold text-white truncate uppercase tracking-tight">
               {user?.email?.split('@')[0] || "Authorized"}
             </p>
             <p className="text-[10px] text-gray-500 font-medium truncate italic tracking-widest uppercase">
               {role || "External"}
             </p>
           </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-gray-500 hover:text-red-500 transition-colors rounded-2xl hover:bg-red-500/5 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm hidden lg:block uppercase tracking-tighter">Exit System</span>
        </button>
      </div>
    </aside>
  );
};