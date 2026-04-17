"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserData {
  name?: string;
  email?: string;
  role: "ADMIN" | "MANAGER" | "USER";
  organizationId?: string;
  orgName?: string;
  createdAt?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  role: "ADMIN" | "MANAGER" | "USER" | null;
  organizationId: string | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  organizationId: null,
  userData: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "USER" | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setRole(data.role);
          setOrganizationId(data.organizationId || null);
          setUserData(data);

          // Update lastActive silently
          updateDoc(doc(db, "users", currentUser.uid), {
            lastActive: new Date().toISOString(),
          }).catch(() => {});
        }
      } else {
        setRole(null);
        setOrganizationId(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, organizationId, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
