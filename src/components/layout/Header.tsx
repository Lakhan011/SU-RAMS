"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLayoutStore } from "@/store/useLayoutStore";
import { usePathname } from "next/navigation";

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { title, subtitle, primaryAction } = useLayoutStore();
  const pathname = usePathname();
  const isScholarDetailPage = pathname.startsWith('/scholars/') && pathname !== '/scholars';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
      {/* Left Section: Dynamic Page Title and Subtitle */}
      <div className="flex flex-col justify-center h-full">
        {title && <h1 className="text-lg font-bold text-foreground leading-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-muted leading-tight mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Section: Dynamic Actions and Notifications */}
      <div className="flex items-center gap-4">
        
        {/* Dynamic Page Action (e.g., Add Button) */}
        {primaryAction && (
          <div className="mr-2">
            {primaryAction}
          </div>
        )}

        {/* Notifications */}
        {!isScholarDetailPage && (
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-surface-hover"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border-light flex justify-between items-center bg-background">
                  <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                  <button className="text-xs text-primary hover:text-primary-hover font-medium">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-3 border-b border-border-light hover:bg-surface-hover transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-foreground">New system update</p>
                      <p className="text-xs text-muted mt-0.5">Version 2.4.1 is now available for deployment.</p>
                      <p className="text-[10px] text-muted-light mt-1.5 font-medium">2 hours ago</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
