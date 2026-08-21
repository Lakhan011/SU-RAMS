'use client';

import { useState, useMemo } from 'react';
import { pages as cmsPages } from '@/data/mock';
import { cn, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  ExternalLink,
  CornerDownRight,
} from 'lucide-react';

const templateColors: Record<string, string> = {
  Homepage: 'bg-purple-50 text-purple-600',
  Default: 'bg-gray-50 text-gray-600',
  Landing: 'bg-blue-50 text-blue-600',
  Contact: 'bg-green-50 text-green-600',
  Legal: 'bg-amber-50 text-amber-600',
};

export default function PagesPage() {
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // Group pages into parents and children
  const organizedPages = useMemo(() => {
    const parents = cmsPages.filter((p) => !p.parent);
    return parents.map((parent) => ({
      ...parent,
      children: cmsPages.filter((p) => p.parent === parent.title),
    }));
  }, []);

  const filteredPages = useMemo(() => {
    if (!search) return organizedPages;
    const q = search.toLowerCase();
    return organizedPages
      .map((parent) => ({
        ...parent,
        children: parent.children.filter(
          (c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
        ),
      }))
      .filter(
        (parent) =>
          parent.title.toLowerCase().includes(q) ||
          parent.slug.toLowerCase().includes(q) ||
          parent.children.length > 0
      );
  }, [search, organizedPages]);

  const totalCount = cmsPages.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <span className="inline-flex items-center justify-center rounded-full bg-primary-light text-primary text-xs font-semibold px-2.5 py-0.5">
            {totalCount}
          </span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          New Page
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-light outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50">
                <th className="px-5 py-3.5 text-left font-semibold text-muted">Title</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Template</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Status</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Author</th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted">Last Modified</th>
                <th className="w-12 px-4 py-3.5 text-left font-semibold text-muted"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredPages.map((page) => (
                <PageRows
                  key={page.id}
                  page={page}
                  children={page.children}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3.5">
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">{totalCount}</span> pages total
          </p>
        </div>
      </div>
    </div>
  );
}

function PageRows({
  page,
  children,
  openMenu,
  setOpenMenu,
}: {
  page: (typeof cmsPages)[number] & { children: typeof cmsPages };
  children: typeof cmsPages;
  openMenu: number | null;
  setOpenMenu: (id: number | null) => void;
}) {
  return (
    <>
      <PageRow page={page} isChild={false} openMenu={openMenu} setOpenMenu={setOpenMenu} />
      {children.map((child) => (
        <PageRow
          key={child.id}
          page={child}
          isChild={true}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />
      ))}
    </>
  );
}

function PageRow({
  page,
  isChild,
  openMenu,
  setOpenMenu,
}: {
  page: (typeof cmsPages)[number];
  isChild: boolean;
  openMenu: number | null;
  setOpenMenu: (id: number | null) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-surface-hover group">
      <td className={cn('px-5 py-3.5', isChild && 'pl-10')}>
        <div className="flex items-center gap-2">
          {isChild && (
            <CornerDownRight className="h-3.5 w-3.5 text-muted-light shrink-0" />
          )}
          <div>
            <p className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
              {page.title}
            </p>
            <p className="text-xs text-muted-light mt-0.5">{page.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
            templateColors[page.template] ?? 'bg-gray-50 text-gray-600'
          )}
        >
          {page.template}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              page.status === 'published' ? 'bg-success' : 'bg-warning'
            )}
          />
          <span className="text-foreground capitalize">{page.status}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-muted whitespace-nowrap">{page.author}</td>
      <td className="px-4 py-3.5 text-muted whitespace-nowrap">
        {formatDate(page.lastModified)}
      </td>
      <td className="px-4 py-3.5">
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === page.id ? null : page.id)}
            className="rounded-lg p-1.5 text-muted-light transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {openMenu === page.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
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
                <button className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors">
                  <ExternalLink className="h-3.5 w-3.5 text-muted" />
                  View Live
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
  );
}
