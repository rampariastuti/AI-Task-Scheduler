"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Sparkles, UserPlus, Loader2 } from "lucide-react";

export const AISelectionTool = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI API Call
    setTimeout(() => {
      setRecommendations([
        { id: 1, name: "Shrey Thakkar", score: 98, reason: "Expert in Flutter & Firebase" },
        { id: 2, name: "Stuti S.", score: 85, reason: "Matches 3/4 required skills" }
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="mt-8 space-y-4">
      <button 
        onClick={handleAIAnalyze}
        disabled={isAnalyzing}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-primary to-indigo-400 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-accent-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
      >
        {isAnalyzing ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} />}
        {isAnalyzing ? "AI is analyzing volunteers..." : "Generate AI Assignment Recommendations"}
      </button>

      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <Sparkles size={14} className="text-accent-primary" />
              TOP AI MATCHES
            </h3>
            {recommendations.map((rec) => (
              <div key={rec.id} className="glass-panel p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold">
                    {rec.score}%
                  </div>
                  <div>
                    <p className="font-bold text-white">{rec.name}</p>
                    <p className="text-xs text-gray-400">{rec.reason}</p>
                  </div>
                </div>
                <button className="p-2 bg-white/5 rounded-lg hover:bg-accent-primary hover:text-white transition-all">
                  <UserPlus size={18} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};