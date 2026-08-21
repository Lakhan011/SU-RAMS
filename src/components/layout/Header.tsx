"use client";

import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, role: string, initials: string} | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.name) setUser(data);
      })
      .catch(err => console.error(err));

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
      {/* Left spacing for alignment if needed, or empty div to push Right Section to the end */}
      <div className="flex-1" />

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
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

        <div className="w-px h-6 bg-border-light hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-surface-hover transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white">
              {user?.initials || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-foreground leading-none mb-1">{user?.name || 'User'}</p>
              <p className="text-xs text-muted leading-tight">{user?.role || 'Loading...'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border-light">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted">{user?.email || 'user@sharda.edu'}</p>
              </div>
              <div className="py-1.5">
                {[
                  { icon: User, label: "My Profile" },
                  { icon: Settings, label: "Settings" },
                ].map((item, i) => (
                  <button key={i} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors duration-150">
                    <item.icon className="w-4 h-4 text-muted" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-border-light py-1.5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-danger hover:bg-danger-light transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
