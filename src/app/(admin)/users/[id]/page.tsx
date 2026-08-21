'use client';

import { use } from 'react';
import { users } from '@/data/mock';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import {
  ArrowLeft,
  Pencil,
  Mail,
  Shield,
  Calendar,
  Clock,
  FileText,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

const avatarGradients: Record<string, string> = {
  SC: 'from-indigo-500 to-purple-500',
  JW: 'from-blue-500 to-cyan-500',
  MR: 'from-emerald-500 to-teal-500',
  DP: 'from-amber-500 to-orange-500',
  EB: 'from-pink-500 to-rose-500',
  AT: 'from-violet-500 to-fuchsia-500',
  LW: 'from-sky-500 to-blue-500',
  MS: 'from-red-500 to-orange-500',
  NP: 'from-teal-500 to-emerald-500',
  OR: 'from-lime-500 to-green-500',
};

const roleBadge: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'bg-primary-lighter', text: 'text-primary' },
  editor: { bg: 'bg-info-light', text: 'text-blue-700' },
  author: { bg: 'bg-success-light', text: 'text-emerald-700' },
  subscriber: { bg: 'bg-background', text: 'text-muted' },
};

const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-success-light', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-background', text: 'text-gray-500', dot: 'bg-gray-400' },
  suspended: { bg: 'bg-danger-light', text: 'text-red-700', dot: 'bg-red-500' },
};

// Mock activity log for the user profile
const activityLog = [
  { id: 1, action: 'Published a new post', target: 'Getting Started with Next.js 15', time: '2026-06-04T11:30:00Z', color: 'bg-emerald-500' },
  { id: 2, action: 'Updated page', target: 'About Us', time: '2026-06-04T09:15:00Z', color: 'bg-blue-500' },
  { id: 3, action: 'Approved comment by', target: 'John Smith', time: '2026-06-03T16:45:00Z', color: 'bg-amber-500' },
  { id: 4, action: 'Uploaded media', target: 'hero-banner.jpg', time: '2026-06-03T14:20:00Z', color: 'bg-violet-500' },
  { id: 5, action: 'Created new post', target: 'Tailwind CSS v4 Migration Guide', time: '2026-06-02T10:00:00Z', color: 'bg-indigo-500' },
  { id: 6, action: 'Updated user role for', target: 'alex@example.com', time: '2026-06-01T08:30:00Z', color: 'bg-pink-500' },
];

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const user = users.find((u) => u.id === Number(id));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted">
        <p className="text-lg font-semibold">User not found</p>
        <Link
          href="/users"
          className="mt-4 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
        >
          ← Back to Users
        </Link>
      </div>
    );
  }

  const role = roleBadge[user.role] || roleBadge.subscriber;
  const status = statusBadge[user.status] || statusBadge.active;

  const infoFields = [
    { icon: <Mail className="w-4 h-4" />, label: 'Full Name', value: user.name },
    { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user.email },
    { icon: <Shield className="w-4 h-4" />, label: 'Role', value: user.role, capitalize: true },
    { icon: <Calendar className="w-4 h-4" />, label: 'Join Date', value: formatDate(user.joinDate) },
    { icon: <Clock className="w-4 h-4" />, label: 'Last Active', value: timeAgo(user.lastActive) },
    { icon: <FileText className="w-4 h-4" />, label: 'Total Posts', value: String(user.posts) },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button */}
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary font-medium transition-colors duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Users
      </Link>

      {/* Profile Header Card */}
      <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div
            className={cn(
              'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-lg shrink-0',
              avatarGradients[user.avatar] || 'from-gray-400 to-gray-500'
            )}
          >
            {user.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize',
                  role.bg,
                  role.text
                )}
              >
                {user.role}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize',
                  status.bg,
                  status.text
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {user.status}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] shrink-0">
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              User Information
            </h2>
          </div>
          <div className="divide-y divide-border-light">
            {infoFields.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-background/40 transition-colors duration-150"
              >
                <span className="text-sm text-muted">{field.label}</span>
                <span
                  className={cn(
                    'text-sm font-medium text-foreground',
                    field.capitalize && 'capitalize'
                  )}
                >
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-light" />

              <div className="space-y-5">
                {activityLog.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-4 pl-6">
                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm shrink-0',
                        item.color
                      )}
                    />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="text-muted">{item.action}</span>{' '}
                        <span className="font-medium">{item.target}</span>
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {timeAgo(item.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
