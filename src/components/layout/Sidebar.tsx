"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronDown,
  Building2,
  Shield,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD", "SUPERVISOR", "SCHOLAR", "STUDENT"] },
  { name: "Ph.D. Scholars", href: "/scholars", icon: GraduationCap, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD", "SUPERVISOR", "SCHOLAR", "STUDENT"] },
  { name: "Users", href: "/users", icon: Users, allowed: ["SUPER_ADMIN", "RDC_ADMIN"] },
  {
    name: "System Settings",
    icon: Settings,
    allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD"],
    children: [
      { name: "Schools", href: "/schools", icon: Building2, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC"] },
      { name: "Departments", href: "/departments", icon: Briefcase, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR"] },
      { name: "Courses", href: "/courses", icon: BookOpen, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD"] },
      { name: "User Types", href: "/roles", icon: Shield, allowed: ["SUPER_ADMIN", "RDC_ADMIN"] },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, role: string, initials: string, rawRole: string} | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "System Settings": false,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.rawRole) setUser(data);
      })
      .catch(() => {});
  }, []);

  const toggleGroup = (name: string) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedGroups((prev) => ({ ...prev, [name]: true }));
    } else {
      setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const userRole = user?.rawRole;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-white border-r border-border-light flex flex-col transition-all duration-300 ease-in-out shadow-sm",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-border-light shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <img src="/logo-sharda.png" alt="Sharda Logo" className={cn("h-8 object-contain transition-all duration-300", collapsed ? "w-8 object-left" : "w-auto")} />
          <span className={cn("font-bold text-lg text-foreground whitespace-nowrap transition-all duration-300", collapsed && "opacity-0 w-0 hidden")}>
            - RAMS
          </span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className={cn("border-b border-border-light p-4 flex items-center transition-all duration-300", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-primary-light">
          {user?.initials || 'U'}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted truncate">{user?.role || 'Loading...'}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          if (!userRole || !item.allowed.includes(userRole)) return null;

          if (item.children) {
            const visibleChildren = item.children.filter(child => child.allowed.includes(userRole));
            if (visibleChildren.length === 0) return null;

            const isGroupActive = visibleChildren.some(child => pathname === child.href || pathname.startsWith(child.href + "/"));
            const isExpanded = expandedGroups[item.name];

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-[5px] text-[13.5px] font-medium transition-all duration-200 group relative",
                    isGroupActive && !isExpanded
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors duration-200", isGroupActive ? "text-primary" : "text-sidebar-text group-hover:text-sidebar-text-active")} />
                    <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>
                      {item.name}
                    </span>
                  </div>
                  {!collapsed && (
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
                    </div>
                  )}
                </button>

                {(!collapsed && isExpanded) && (
                  <div className="pl-4 space-y-1 mt-1">
                    {visibleChildren.map((child) => {
                      const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.name}
                          href={child.href!}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-[5px] text-[13px] font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-white shadow-md shadow-primary/25"
                              : "text-muted hover:text-foreground hover:bg-surface-hover"
                          )}
                        >
                          <child.icon className={cn("w-[16px] h-[16px] shrink-0", isActive ? "text-white" : "text-sidebar-text")} />
                          <span className="whitespace-nowrap">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-[13.5px] font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors duration-200", isActive ? "text-white" : "text-sidebar-text group-hover:text-sidebar-text-active")} />
              <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>{item.name}</span>
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 pb-4 space-y-1 shrink-0 border-t border-border-light pt-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[5px] text-danger hover:text-white hover:bg-danger transition-all duration-200 group relative"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span className={cn("whitespace-nowrap font-medium text-[13.5px] transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>Sign Out</span>
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              Sign Out
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
            </div>
          )}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2.5 rounded-[5px] text-muted hover:text-foreground hover:bg-surface-hover transition-all duration-200"
        >
          <ChevronLeft className={cn("w-[18px] h-[18px] transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}