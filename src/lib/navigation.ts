import {
  LayoutDashboard,
  UserCircle,
  Users,
  ShieldCheck,
  Settings,
  UserCog,
  Building2,
  ScrollText,
} from "lucide-react";

export const NAV_ITEMS = {
  USER: [
    { label: "My Workspace", href: "/user", icon: LayoutDashboard },
    { label: "Profile", href: "/user/profile", icon: UserCircle },
  ],

  MANAGER: [
    { label: "Team Command", href: "/manager", icon: Users },
    { label: "Profile", href: "/user/profile", icon: Settings },
  ],

  ADMIN: [
    { label: "Admin Console", href: "/admin", icon: ShieldCheck },
    { label: "Manage Users", href: "/admin/users", icon: UserCog },
    { label: "Activity Log", href: "/admin/logs", icon: ScrollText },
    { label: "Organization", href: "/admin/org", icon: Building2 },
    { label: "Profile", href: "/user/profile", icon: UserCircle },
  ],
};

export type Role = keyof typeof NAV_ITEMS;
