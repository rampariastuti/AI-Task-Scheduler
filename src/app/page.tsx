"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Zap, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-accent-primary/30">
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">TaskAI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent-primary/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold mb-6">
              <Sparkles size={12} /> Now with AI Scheduling v2.0
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gradient">
              AI-Powered Task Management for Smart Teams
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Automatically assign, manage, and optimize tasks using advanced Artificial Intelligence. Built for high-performance organizations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-accent-primary hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 group transition-all">
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
            </div>
          </motion.div>

          {/* Feature Highlight Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
          >
            <div className="glass-panel p-8 rounded-3xl text-left hover:border-accent-primary/30 transition-all">
              <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary w-fit mb-4">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Smart Match</h3>
              <p className="text-sm text-gray-400">AI predicts the best volunteer based on skills, history, and availability.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl text-left hover:border-accent-success/30 transition-all">
              <div className="p-3 bg-accent-success/10 rounded-xl text-accent-success w-fit mb-4">
                <Shield size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Secure Auth</h3>
              <p className="text-sm text-gray-400">Enterprise-grade security for your organizational data and user privacy.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl text-left hover:border-accent-warning/30 transition-all">
              <div className="p-3 bg-accent-warning/10 rounded-xl text-accent-warning w-fit mb-4">
                <Target size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Live Insights</h3>
              <p className="text-sm text-gray-400">Monitor task success rates and system performance in real-time.</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 3. Social Proof / Footer */}
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-gray-500 text-sm">© 2026 TaskAI. All rights reserved.</p>
      </footer>
    </div>
  );
}