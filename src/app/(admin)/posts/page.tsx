'use client';

import { useState, useMemo } from 'react';
import { posts, type PostStatus } from '@/data/mock';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const statusConfig: Record<PostStatus, { label: string; className: string }> = {
  published: { label: 'Published', className: 'bg-success-light text-success' },
  draft: { label: 'Draft', className: 'bg-warning-light text-warning' },
  scheduled: { label: 'Scheduled', className: 'bg-info-light text-info' },
  archived: { label: 'Archived', className: 'bg-surface-hover text-muted' },
};

const categoryColors: Record<string, string> = {
  CSS: 'bg-purple-50 text-purple-600',
  React: 'bg-blue-50 text-blue-600',
  Backend: 'bg-green-50 text-green-600',
  TypeScript: 'bg-indigo-50 text-indigo-600',
  Performance: 'bg-orange-50 text-orange-600',
  AI: 'bg-pink-50 text-pink-600',
};

export default function PostsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category));
    return Array.from(cats).sort();
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [search, statusFilter, categoryFilter]);

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  function toggleAll() {
    setSelected(allSelected ? [] : filtered.map((p) => p.id));
  }

  function toggleOne(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Posts</h1>
          <span className="inline-flex items-center justify-center rounded-full bg-primary-light text-primary text-xs font-semibold px-2.5 py-0.5">
            {posts.length}
          </span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-4 rounded-xl bg-primary-light border border-primary/20 px-5 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium text-primary">
            {selected.length} selected
          </span>
          <div className="h-4 w-px bg-primary/20" />
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-danger/90">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
          <div className="relative">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover">
              Change Status
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => setSelected([])}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-light outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-white py-2.5 pl-4 pr-10 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-white py-2.5 pl-4 pr-10 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50">
                <th className="w-12 px-4 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Title</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Author</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Category</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Status</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Date</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Views</th>
                <th className="w-12 px-4 py-3.5 text-left font-semibold text-muted"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className={cn(
                    'transition-colors hover:bg-surface-hover group',
                    selected.includes(post.id) && 'bg-primary-lighter'
                  )}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(post.id)}
                      onChange={() => toggleOne(post.id)}
                      className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <div>
                      <p className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-light mt-0.5 truncate">
                        {post.excerpt}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-semibold shrink-0">
                        {post.authorAvatar}
                      </div>
                      <span className="text-foreground whitespace-nowrap">{post.author}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        categoryColors[post.category] ?? 'bg-gray-50 text-gray-600'
                      )}
                    >
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        statusConfig[post.status].className
                      )}
                    >
                      {statusConfig[post.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted whitespace-nowrap">
                    {formatDate(post.date)}
                  </td>
                  <td className="px-4 py-3.5 text-muted whitespace-nowrap">
                    {formatNumber(post.views)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                        className="rounded-lg p-1.5 text-muted-light transition-colors hover:bg-surface-hover hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === post.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-surface py-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                            <button className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors">
                              <Edit className="h-3.5 w-3.5 text-muted" />
                              Edit
                            </button>
                            <button className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors">
                              <Eye className="h-3.5 w-3.5 text-muted" />
                              View
                            </button>
                            <button className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors">
                              <Copy className="h-3.5 w-3.5 text-muted" />
                              Duplicate
                            </button>
                            <div className="my-1.5 border-t border-border-light" />
                            <button className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-danger hover:bg-danger-light transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
          <p className="text-sm text-muted">
            Showing <span className="font-medium text-foreground">1–{filtered.length}</span> of{' '}
            <span className="font-medium text-foreground">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              disabled
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
