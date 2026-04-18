"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Sparkles, Menu, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();
  const { role, user, userData } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = role ? NAV_ITEMS[role as keyof typeof NAV_ITEMS] : [];

  const handleLogout = async () => {
    try { await signOut(auth); } catch { }
    setMobileOpen(false);
  };

  const roleColors: Record<string, string> = {
    ADMIN: "from-red-500 to-orange-500",
    MANAGER: "from-blue-500 to-indigo-500",
    USER: "from-accent-primary to-purple-500",
  };

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Brand */}
      <div className={cn(
        "flex items-center gap-3 mb-10 shrink-0",
        collapsed ? "justify-center px-0" : "px-2"
      )}>
        <div className="w-10 h-10 bg-accent-primary rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/20 shrink-0">
          <Sparkles className="text-white" size={20} />
        </div>
        {!collapsed && (
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">TaskAI</span>
        )}
      </div>

      {/* Org name */}
      {!collapsed && userData?.orgName && (
        <div className="mb-6 px-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Organization</p>
            <p className="text-sm font-bold text-white truncate mt-0.5">{userData.orgName}</p>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <div className={cn(
                "relative flex items-center gap-4 rounded-2xl transition-all duration-200 group cursor-pointer",
                collapsed ? "justify-center px-3 py-4" : "px-4 py-4",
                isActive
                  ? "text-white bg-accent-primary/10 border border-accent-primary/20"
                  : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
              )}>
                <item.icon size={20} className={cn("shrink-0", isActive && "text-accent-primary")} />
                {!collapsed && (
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-accent-primary/5 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "mt-auto border-t border-white/5 pt-6 space-y-4 shrink-0",
        collapsed ? "items-center flex flex-col" : ""
      )}>
        {/* User info */}
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2")}>
          {/* Avatar — photo if available, else colored initial */}
          {(userData?.photoURL || user?.photoURL) ? (
            <img
              src={userData?.photoURL || user?.photoURL || ""}
              alt="Profile"
              className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-lg ring-1 ring-white/10"
            />
          ) : (
            <div className={cn(
              "w-9 h-9 rounded-xl bg-gradient-to-tr shrink-0 shadow-lg flex items-center justify-center",
              roleColors[role || "USER"] || "from-accent-primary to-purple-500"
            )}>
              <span className="text-white text-xs font-black uppercase">
                {(userData?.name || user?.displayName || user?.email || "U")[0].toUpperCase()}
              </span>
            </div>
          )}
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-[11px] font-bold text-white truncate uppercase tracking-tight">
                {userData?.name || user?.displayName || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-[10px] text-gray-500 font-medium italic tracking-widest uppercase">
                {role || "User"}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 text-gray-500 hover:text-red-400 transition-colors rounded-2xl hover:bg-red-500/5 group",
            collapsed ? "p-3 justify-center w-full" : "px-4 py-3 w-full"
          )}
        >
          <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
          {!collapsed && (
            <span className="font-bold text-sm uppercase tracking-tighter">Sign Out</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE TOGGLE BUTTON ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#111] border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-xl"
      >
        <Menu size={20} />
      </button>

      {/* ── MOBILE OVERLAY DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-white/5 z-50 flex flex-col p-6"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-white p-2 bg-white/5 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
              <NavContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR (icon-only on md, full on lg) ── */}
      <aside className="hidden lg:flex w-20 xl:w-64 h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/5 flex-col p-5 z-30 shrink-0">
        {/* Icon-only on lg, full on xl */}
        <div className="xl:hidden flex flex-col h-full">
          <NavContent collapsed={true} />
        </div>
        <div className="hidden xl:flex flex-col h-full">
          <NavContent collapsed={false} />
        </div>
      </aside>
    </>
  );
};
