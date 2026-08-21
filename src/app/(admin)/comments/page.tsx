'use client';

import { useState } from 'react';
import { comments, type Comment } from '@/data/mock';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

type TabStatus = 'all' | 'pending' | 'approved' | 'spam';

const avatarColors: Record<string, string> = {
  JS: 'bg-blue-500',
  AJ: 'bg-emerald-500',
  BW: 'bg-amber-500',
  CD: 'bg-violet-500',
  SB: 'bg-red-500',
  EM: 'bg-pink-500',
  FL: 'bg-teal-500',
  GK: 'bg-indigo-500',
};

const statusCounts = {
  all: comments.length,
  pending: comments.filter((c) => c.status === 'pending').length,
  approved: comments.filter((c) => c.status === 'approved').length,
  spam: comments.filter((c) => c.status === 'spam').length,
};

export default function CommentsPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [commentList, setCommentList] = useState<Comment[]>(comments);

  const filteredComments =
    activeTab === 'all'
      ? commentList
      : commentList.filter((c) => c.status === activeTab);

  const allSelected =
    filteredComments.length > 0 &&
    filteredComments.every((c) => selectedIds.has(c.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredComments.map((c) => c.id)));
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleApprove(id: number) {
    setCommentList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' as const } : c))
    );
  }

  function handleReject(id: number) {
    setCommentList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'spam' as const } : c))
    );
  }

  function handleDelete(id: number) {
    setCommentList((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleBulkApprove() {
    setCommentList((prev) =>
      prev.map((c) =>
        selectedIds.has(c.id) ? { ...c, status: 'approved' as const } : c
      )
    );
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    setCommentList((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
  }

  const tabs: { key: TabStatus; label: string; count: number; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', count: statusCounts.all, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'pending', label: 'Pending', count: statusCounts.pending, icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'approved', label: 'Approved', count: statusCounts.approved, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: 'spam', label: 'Spam', count: statusCounts.spam, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comments</h1>
          <p className="text-sm text-muted mt-1">Moderate and manage user comments</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(statusCounts).map(([key, count]) => (
            <div
              key={key}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full',
                key === 'all' && 'bg-primary-lighter text-primary',
                key === 'pending' && 'bg-warning-light text-amber-700',
                key === 'approved' && 'bg-success-light text-emerald-700',
                key === 'spam' && 'bg-danger-light text-red-700'
              )}
            >
              <span className="capitalize">{key}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-border shadow-xs w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedIds(new Set());
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            )}
          >
            {tab.icon}
            {tab.label}
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-border text-muted'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary-lighter border border-primary/20 rounded-xl px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} comment{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-primary/20" />
          <button
            onClick={handleBulkApprove}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-success-light"
          >
            <Check className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-danger-light"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}

      {/* Comment List */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Select All Bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-background/50">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer accent-[#6366f1]"
          />
          <span className="text-xs font-medium text-muted">
            {allSelected ? 'Deselect all' : 'Select all'}
          </span>
          <span className="ml-auto text-xs text-muted">
            {filteredComments.length} comment{filteredComments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Comments */}
        {filteredComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <MessageSquare className="w-10 h-10 mb-3 text-muted-light" />
            <p className="text-sm font-medium">No comments found</p>
            <p className="text-xs mt-1">Try switching to a different tab</p>
          </div>
        ) : (
          filteredComments.map((comment, idx) => (
            <div
              key={comment.id}
              className={cn(
                'group flex items-start gap-4 px-5 py-4 transition-colors duration-200 hover:bg-background/60',
                idx < filteredComments.length - 1 && 'border-b border-border-light',
                comment.status === 'pending' && 'border-l-3 border-l-warning',
                comment.status === 'spam' && 'border-l-3 border-l-danger'
              )}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.has(comment.id)}
                onChange={() => toggleSelect(comment.id)}
                className="w-4 h-4 mt-1.5 rounded border-border text-primary focus:ring-primary/30 cursor-pointer accent-[#6366f1] shrink-0"
              />

              {/* Avatar */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                  avatarColors[comment.avatar] || 'bg-primary'
                )}
              >
                {comment.avatar}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-sm font-semibold text-foreground', comment.status === 'spam' && 'text-muted')}>
                    {comment.author}
                  </span>
                  <span className="text-xs text-muted">{comment.email}</span>
                  {comment.status === 'pending' && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning-light text-amber-700">
                      Pending
                    </span>
                  )}
                  {comment.status === 'spam' && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-danger-light text-red-700">
                      Spam
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-sm mt-1 line-clamp-2 leading-relaxed',
                    comment.status === 'spam' ? 'text-muted line-through' : 'text-foreground/80'
                  )}
                >
                  {comment.content}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <span>on</span>
                  <a href="#" className="text-primary hover:text-primary-hover font-medium hover:underline transition-colors">
                    {comment.post}
                  </a>
                  <span className="text-border">•</span>
                  <span>{timeAgo(comment.date)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                {comment.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    className="p-2 rounded-lg text-muted hover:text-emerald-600 hover:bg-success-light transition-all duration-150"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {comment.status !== 'spam' && (
                  <button
                    onClick={() => handleReject(comment.id)}
                    className="p-2 rounded-lg text-muted hover:text-amber-600 hover:bg-warning-light transition-all duration-150"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 rounded-lg text-muted hover:text-red-600 hover:bg-danger-light transition-all duration-150"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
