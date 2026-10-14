'use client';

import { Building2, Briefcase, BookOpen, UserCheck, GraduationCap, Users } from 'lucide-react';
import { formatNumber, timeAgo, formatRoleName } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useLayoutStore } from '@/store/useLayoutStore';

const iconMap: Record<string, any> = {
  Building2,
  Briefcase,
  BookOpen,
  UserCheck,
  GraduationCap,
  Users
};

const statColors = [
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-info-light', text: 'text-info' },
];

export default function DashboardPage() {
  const setHeader = useLayoutStore((state) => state.setHeader);
  const resetHeader = useLayoutStore((state) => state.resetHeader);

  const [data, setData] = useState<{
    name: string;
    stats: any[];
    recentScholars: any[];
    recentUsers: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(resData => {
        if (resData.stats) {
          setData(resData);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (data?.name) {
      setHeader(`Welcome back, ${data.name}`, today);
    } else {
      setHeader('Dashboard', today);
    }

    return () => resetHeader();
  }, [data?.name, setHeader, resetHeader]);

  if (loading) {
    return <div className="p-6 text-center text-muted text-sm">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {(data?.stats || []).map((stat, index) => {
          const IconComponent = iconMap[stat.icon] || Users;
          const colors = statColors[index % statColors.length];

          return (
            <div
              key={stat.label}
              className="bg-surface rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-[5px] ${colors.bg}`}>
                  <IconComponent className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
              <p className="text-sm text-muted mt-3">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatNumber(stat.value)}</p>
            </div>
          );
        })}
      </div>

      {/* Two Columns: Recent Scholars + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Scholars */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Recently Registered Scholars
          </h2>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-3 px-2">Scholar</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-3 px-2">Program</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide pb-3 px-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentScholars?.map((scholar) => (
                  <tr
                    key={scholar.id}
                    className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 px-2">
                      <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                        {scholar.firstName} {scholar.lastName}
                      </p>
                      <p className="text-xs text-muted truncate max-w-[200px]">{scholar.email}</p>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-sm font-medium text-foreground">{scholar.program || 'N/A'}</p>
                      <p className="text-xs text-muted">{scholar.department?.departmentCode || 'No Dept'}</p>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm text-muted">{timeAgo(scholar.createdAt)}</span>
                    </td>
                  </tr>
                ))}
                {(!data?.recentScholars || data.recentScholars.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-muted">No recent scholars found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Recently Added Users
          </h2>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-3 px-2">User</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-3 px-2">Role</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide pb-3 px-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentUsers?.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 px-2">
                      <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted truncate max-w-[200px]">{user.email}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-xs font-semibold bg-primary-light text-primary border border-primary/20 whitespace-nowrap">
                        {formatRoleName(user.role?.name)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm text-muted whitespace-nowrap">{timeAgo(user.createdAt)}</span>
                    </td>
                  </tr>
                ))}
                {(!data?.recentUsers || data.recentUsers.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-muted">No recent users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
