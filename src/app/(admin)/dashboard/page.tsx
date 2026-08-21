'use client';

import { Building2, Briefcase, BookOpen, UserCheck, GraduationCap, ArrowUp, ArrowDown, Plus, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { trafficData, recentActivity, topContent } from '@/data/mock';
import { formatNumber, timeAgo } from '@/lib/utils';
import { useState, useEffect } from 'react';

const iconMap: Record<string, any> = {
  Building2,
  Briefcase,
  BookOpen,
  UserCheck,
  GraduationCap,
};

const statColors = [
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-info-light', text: 'text-info' },
];

const activityColors: Record<string, string> = {
  post: '#6366f1',
  comment: '#10b981',
  media: '#f59e0b',
  page: '#3b82f6',
  user: '#8b5cf6',
};

const statusBadgeClasses: Record<string, string> = {
  published: 'bg-success-light text-success',
  draft: 'bg-warning-light text-warning',
  archived: 'bg-muted/10 text-muted',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border-light p-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-muted" style={{ color: entry.color }}>
          {entry.dataKey === 'views' ? 'Views' : 'Visitors'}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<{name: string, stats: any[]} | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(resData => {
        if (resData.stats) setData(resData);
      });
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {data?.name || 'Loading...'}</h1>
          <p className="text-sm text-muted mt-1">{today}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data?.stats || []).map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          const colors = statColors[index % statColors.length];
          const isPositive = stat.change >= 0;

          return (
            <div
              key={stat.label}
              className="bg-surface rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                  {IconComponent && <IconComponent className={`w-5 h-5 ${colors.text}`} />}
                </div>
              </div>
              <p className="text-sm text-muted mt-3">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatNumber(stat.value)}</p>
            </div>
          );
        })}
      </div>

      {/* Traffic Chart */}
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Traffic Overview</h2>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ef" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7294' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7294' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#viewsGradient)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#visitorsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted">Views</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted">Visitors</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Activity + Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">Recent Activity</h2>
          <div className="space-y-5">
            {recentActivity.map((item, index) => (
              <div key={item.id} className="flex gap-3">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: activityColors[item.type] }}
                  />
                  {index < recentActivity.length - 1 && (
                    <div className="w-px flex-1 bg-border-light mt-1.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                      style={{ backgroundColor: activityColors[item.type] }}
                    >
                      {item.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{item.user}</span>{' '}
                        <span className="text-muted">{item.action}</span>{' '}
                        <span className="font-medium">{item.target}</span>
                      </p>
                      <p className="text-xs text-muted-light mt-0.5">{timeAgo(item.time)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">Top Content</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-3">Title</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide pb-3">Views</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {topContent.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 pr-3">
                      <p className="text-sm font-medium text-foreground truncate max-w-[220px]">
                        {item.title}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-semibold text-foreground">{formatNumber(item.views)}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClasses[item.status] || 'bg-muted/10 text-muted'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
