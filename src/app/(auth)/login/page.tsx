import Link from "next/link";
import { AuthForm } from "../../../components/auth/AuthForm";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div
      data-theme="light"
      style={{
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f9ff 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background blobs */}
      <div style={{ position: "absolute", top: -160, left: -160, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -120, right: -120, width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Top bar */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
            <Sparkles color="white" size={17} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", letterSpacing: "-0.5px", fontStyle: "italic" }}>TaskAI</span>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, color: "#6366f1",
            textDecoration: "none", padding: "8px 16px", borderRadius: 10,
            border: "1px solid rgba(99,102,241,0.25)", background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* Centered form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: "100%", maxWidth: 420,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            borderRadius: 32,
            padding: "40px 36px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 24px 64px rgba(99,102,241,0.10), 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
          }}
        >
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
