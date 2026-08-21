"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD", "SUPERVISOR"] },
  { name: "Ph.D. Scholars", href: "/scholars", icon: GraduationCap, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD", "SUPERVISOR"] },
  { name: "Users", href: "/users", icon: Users, allowed: ["SUPER_ADMIN", "RDC_ADMIN"] },
  {
    name: "System Settings",
    icon: Settings,
    allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD"],
    children: [
      { name: "Schools", href: "/schools", icon: Building2, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC"] },
      { name: "Departments", href: "/departments", icon: Briefcase, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR"] },
      { name: "Courses", href: "/courses", icon: BookOpen, allowed: ["SUPER_ADMIN", "RDC_ADMIN", "VC", "DEAN", "COORDINATOR", "HOD"] },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "System Settings": false,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.rawRole) setUserRole(data.rawRole);
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-border-light flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-border-light">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/logo-sharda.png" alt="Sharda Logo" className={cn("h-8 object-contain transition-all duration-300", collapsed ? "w-8 object-left" : "w-auto")} />
        </div>
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
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-200 group relative",
                    isGroupActive && !isExpanded
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover"
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
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-white shadow-md shadow-primary/25"
                              : "text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover"
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover"
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

      <div className="px-3 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2.5 rounded-lg text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover transition-all duration-200"
        >
          <ChevronLeft className={cn("w-[18px] h-[18px] transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}