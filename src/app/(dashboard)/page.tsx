"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardRootPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (role === "ADMIN") router.push("/admin");
      else if (role === "MANAGER") router.push("/manager");
      else if (role === "USER") router.push("/user");
      else router.push("/login");
    }
  }, [role, loading, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-accent-primary" size={40} />
    </div>
  );
}