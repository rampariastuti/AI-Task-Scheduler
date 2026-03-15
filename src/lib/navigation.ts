import { 
  LayoutDashboard, 
  CheckSquare, 
  UserCircle, 
  Users, 
  ShieldCheck, 
  Settings,
  BarChart3,
  ListTodo
} from "lucide-react";

export const NAV_ITEMS = {
  // 1. Navigation for standard Users
  USER: [
    {
      label: "My Workspace",
      href: "/user",
      icon: LayoutDashboard,
    },
    {
      label: "Profile Settings",
      href: "/user/profile",
      icon: UserCircle,
    }
  ],

  // 2. Navigation for Managers
  MANAGER: [
    {
      label: "Team Command",
      href: "/manager",
      icon: Users,
    },
   
  
    {
      label: "Settings",
      href: "/user/profile", // Shared profile page
      icon: Settings,
    }
  ],

  ADMIN: [
  {
    label: "Admin Console",
    href: "/admin", // This must match your folder: src/app/(dashboard)/admin/page.tsx
    icon: ShieldCheck,
  },
  
],
};

// Helper type for TypeScript safety
export type Role = keyof typeof NAV_ITEMS;