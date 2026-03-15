"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  className?: string;
}

export const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className 
}: DashboardCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className={cn(
      "p-6 rounded-[2.5rem] bg-secondary/50 backdrop-blur-md border border-white/5 hover:border-accent-primary/30 transition-all group relative overflow-hidden",
      className
    )}
  >
    {/* Ambient Glow Background Effect */}
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-primary/5 rounded-full blur-3xl group-hover:bg-accent-primary/10 transition-colors" />

    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
          {title}
        </p>
        <h3 className="text-3xl font-black tracking-tighter text-white italic">
          {value}
        </h3>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl text-accent-primary group-hover:scale-110 group-hover:bg-accent-primary/10 transition-all duration-300">
        <Icon size={24} />
      </div>
    </div>

    {trend !== undefined && (
      <div className="mt-6 flex items-center gap-2 relative z-10">
        <span className={cn(
          "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter",
          trend > 0 ? "bg-accent-success/10 text-accent-success" : "bg-accent-danger/10 text-accent-danger"
        )}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          Interval Shift
        </span>
      </div>
    )}
  </motion.div>
);