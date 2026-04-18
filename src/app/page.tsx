"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Zap, Target, CheckCircle2 } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Smart Task Matching",
    desc: "AI automatically assigns tasks to the right team members based on skills, workload, and history.",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    glow: "rgba(99,102,241,0.12)",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Three-tier access control — Admin, Manager, and User — with enterprise-grade security.",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.12)",
  },
  {
    icon: Target,
    title: "Real-Time Analytics",
    desc: "Live dashboards showing task completion rates, team performance, and AI-driven insights.",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.12)",
  },
];

const STATS = [
  { value: "3×", label: "Faster task assignment" },
  { value: "AI", label: "Priority scoring engine" },
  { value: "100%", label: "Real-time sync" },
];

const BADGES = ["AI Priority Scoring", "Real-time Sync", "Multi-role Access", "Gemini AI"];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}>
              <Sparkles color="white" size={17} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", letterSpacing: "-0.5px", fontStyle: "italic" }}>TaskAI</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>Sign In</Link>
            <Link href="/login" style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
              padding: "10px 22px", borderRadius: 50, fontSize: 14, fontWeight: 700,
              textDecoration: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.35)"
            }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 148, paddingBottom: 100,
        background: "linear-gradient(160deg,#f0f4ff 0%,#faf5ff 45%,#fff7f0 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -120, left: "5%", width: 700, height: 700, background: "radial-gradient(circle,rgba(99,102,241,0.11) 0%,transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: "5%", width: 500, height: 500, background: "radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center", padding: "0 24px", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 18px", borderRadius: 50, marginBottom: 28,
              background: "rgba(99,102,241,0.09)", border: "1px solid rgba(99,102,241,0.22)",
            }}>
              <Sparkles size={13} color="#6366f1" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Scheduling v2.0</span>
            </div>

            <h1 style={{
              fontSize: "clamp(44px,8vw,78px)", fontWeight: 900, letterSpacing: "-2.5px",
              lineHeight: 1.03, marginBottom: 24,
              background: "linear-gradient(135deg,#0f172a 0%,#6366f1 55%,#8b5cf6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              AI-Powered Task Management for Smart Teams
            </h1>

            <p style={{ fontSize: "clamp(16px,2.5vw,20px)", color: "#64748b", maxWidth: 580, margin: "0 auto 44px", lineHeight: 1.65 }}>
              Automatically assign, manage, and optimize tasks using advanced Artificial Intelligence. Built for high-performance organizations.
            </p>

            <Link href="/login" style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
              padding: "17px 44px", borderRadius: 18, fontSize: 16, fontWeight: 800,
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 12px 44px rgba(99,102,241,0.42)", letterSpacing: "-0.3px",
            }}>
              Get Started Free <ArrowRight size={19} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 48 }}
          >
            {BADGES.map(badge => (
              <span key={badge} style={{
                padding: "8px 16px", borderRadius: 50, fontSize: 12, fontWeight: 600, color: "#475569",
                background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <CheckCircle2 size={13} color="#10b981" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "96px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Why TaskAI</p>
            <h2 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.5px", marginBottom: 14 }}>
              Everything your team needs
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              Three powerful modules working together to supercharge your organization.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {FEATURES.map(({ icon: Icon, title, desc, gradient, glow }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                style={{
                  background: "#fff", borderRadius: 24, padding: 32,
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: `0 6px 30px ${glow}, 0 1px 4px rgba(0,0,0,0.05)`,
                }}
              >
                <div style={{ width: 56, height: 56, background: gradient, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: `0 8px 24px ${glow}` }}>
                  <Icon color="white" size={26} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 20, color: "#0f172a", marginBottom: 10, letterSpacing: "-0.5px" }}>{title}</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#9333ea 100%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 52 }}>Built for performance</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 40, textAlign: "center" }}>
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 58, fontWeight: 900, color: "#ffffff", letterSpacing: "-3px", lineHeight: 1 }}>{value}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 10, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", background: "#f8faff", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.2px", marginBottom: 16 }}>
            Ready to transform your team?
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 40, lineHeight: 1.65 }}>
            Join organizations that use AI to stay ahead. Free to start.
          </p>
          <Link href="/login" style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            padding: "18px 52px", borderRadius: 18, fontSize: 16, fontWeight: 800,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10,
            boxShadow: "0 12px 44px rgba(99,102,241,0.38)",
          }}>
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0f172a", padding: "44px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles color="white" size={15} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 16, color: "#fff", fontStyle: "italic" }}>TaskAI</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>© 2026 TaskAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
