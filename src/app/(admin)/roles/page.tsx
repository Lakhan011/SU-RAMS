'use client';

import { useState } from 'react';
import { roles, permissionLabels, type Role } from '@/data/mock';
import { cn } from '@/lib/utils';
import {
  Shield,
  Plus,
  Users,
  Pencil,
  Crown,
  ShieldCheck,
  BookOpen,
  UserCircle,
} from 'lucide-react';

const roleIcons: Record<string, typeof Shield> = {
  Administrator: Crown,
  Editor: ShieldCheck,
  Author: BookOpen,
  Subscriber: UserCircle,
};

const roleColors: Record<string, { bg: string; text: string; badge: string }> = {
  Administrator: {
    bg: 'bg-primary-light',
    text: 'text-primary',
    badge: 'bg-primary/10 text-primary',
  },
  Editor: {
    bg: 'bg-info-light',
    text: 'text-info',
    badge: 'bg-info/10 text-info',
  },
  Author: {
    bg: 'bg-success-light',
    text: 'text-success',
    badge: 'bg-success/10 text-success',
  },
  Subscriber: {
    bg: 'bg-warning-light',
    text: 'text-warning',
    badge: 'bg-warning/10 text-warning',
  },
};

function PermissionToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0',
        enabled ? 'bg-primary' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  );
}

function RoleCard({ role }: { role: Role }) {
  const [permissions, setPermissions] = useState(role.permissions);
  const RoleIcon = roleIcons[role.name] || Shield;
  const colors = roleColors[role.name] || roleColors['Subscriber'];

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = Object.keys(permissions).length;

  return (
    <div className="bg-surface rounded-xl border border-border shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-5 border-b border-border-light">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                colors.bg,
                colors.text
              )}
            >
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {role.name}
              </h3>
              <p className="text-xs text-muted mt-0.5">{role.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                colors.badge
              )}
            >
              <Users className="h-3 w-3" />
              {role.usersCount} users
            </span>
          </div>
        </div>
        {/* Permission progress */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-500"
              style={{ width: `${(enabledCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted font-medium">
            {enabledCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Permissions grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(permissions).map(([key, value]) => (
            <div
              key={key}
              className={cn(
                'flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-colors duration-150',
                value ? 'bg-primary-lighter' : 'bg-background'
              )}
            >
              <span className="text-sm text-foreground">
                {permissionLabels[key] || key}
              </span>
              <PermissionToggle
                enabled={value}
                onChange={() => togglePermission(key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border-light bg-background/50">
        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
          <Pencil className="h-3.5 w-3.5" />
          Edit Role
        </button>
      </div>
    </div>
  );
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Roles & Permissions
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage user roles and access control
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </div>
  );
}
