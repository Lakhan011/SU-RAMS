'use client';

import { useState } from 'react';
import { analyticsData } from '@/data/mock';
import { cn } from '@/lib/utils';
import {
  Eye,
  Users,
  Clock,
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const statCards = [
  {
    label: 'Total Views',
    value: '284,930',
    change: 18.7,
    icon: Eye,
    color: 'bg-primary-light text-primary',
  },
  {
    label: 'Unique Visitors',
    value: '182,400',
    change: 12.3,
    icon: Users,
    color: 'bg-success-light text-success',
  },
  {
    label: 'Avg. Session',
    value: '3m 24s',
    change: 5.1,
    icon: Clock,
    color: 'bg-info-light text-info',
  },
  {
    label: 'Bounce Rate',
    value: '34.2%',
    change: -2.4,
    icon: TrendingDown,
    color: 'bg-warning-light text-warning',
  },
];

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-06-04');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted mt-1">
            Track your site performance and visitor insights
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-lg border border-border px-3 py-2 shadow-xs">
          <Calendar className="h-4 w-4 text-muted" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-sm text-foreground outline-none border-none"
          />
          <span className="text-muted text-sm">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-sm text-foreground outline-none border-none"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-xl border border-border p-5 shadow-xs hover:shadow-sm transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                  stat.color
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                  stat.change >= 0
                    ? 'text-success bg-success-light'
                    : 'text-danger bg-danger-light'
                )}
              >
                {stat.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart - Page Views */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Page Views
              </h2>
              <p className="text-sm text-muted mt-0.5">Monthly traffic overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-muted">Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
                <span className="text-muted">Visitors</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData.pageViews}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e6ef"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7294' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7294' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e6ef',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#viewsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#a5b4fc"
                  strokeWidth={2}
                  fill="url(#visitorsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Traffic Sources */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Traffic Sources
            </h2>
            <p className="text-sm text-muted mt-0.5">Where visitors come from</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {analyticsData.sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e6ef',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                    fontSize: '13px',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2.5">
            {analyticsData.sources.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm text-foreground">{source.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {source.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Top Pages</h2>
          <p className="text-sm text-muted mt-0.5">
            Most visited pages on your site
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Page URL
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Views
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Unique Visitors
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Bounce Rate
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Avg. Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {analyticsData.topPages.map((page, index) => (
                <tr
                  key={page.page}
                  className="hover:bg-surface-hover transition-colors duration-150"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted bg-background rounded-md px-2 py-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                        {page.page}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-foreground font-medium">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-foreground">
                    {page.uniqueVisitors.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            page.bounceRate > 40
                              ? 'bg-warning'
                              : page.bounceRate > 30
                                ? 'bg-info'
                                : 'bg-success'
                          )}
                          style={{ width: `${page.bounceRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground">{page.bounceRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-foreground">
                    {page.avgTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Demographics */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-xs">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">
            Visitor Demographics
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Geographic distribution of visitors
          </p>
        </div>
        <div className="space-y-4">
          {analyticsData.demographics.map((item) => (
            <div key={item.country} className="flex items-center gap-4">
              <span className="text-2xl w-8">{item.flag}</span>
              <span className="text-sm font-medium text-foreground w-36">
                {item.country}
              </span>
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-500"
                  style={{ width: `${item.visitors}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground w-12 text-right">
                {item.visitors}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
