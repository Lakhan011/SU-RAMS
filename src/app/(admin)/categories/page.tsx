'use client';

import { useState } from 'react';
import { categories, tags, type Category } from '@/data/mock';
import { cn } from '@/lib/utils';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Tag,
  Hash,
} from 'lucide-react';

function CategoryItem({
  category,
  depth = 0,
}: {
  category: Category;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const FolderIcon = expanded && hasChildren ? FolderOpen : Folder;

  return (
    <div>
      <div
        className={cn(
          'group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-primary-lighter/60',
          depth > 0 && 'ml-4'
        )}
      >
        {/* Connecting line for children */}
        {depth > 0 && (
          <div className="absolute -left-0 top-0 h-full w-px bg-border" />
        )}
        {depth > 0 && (
          <div className="absolute -left-0 top-1/2 h-px w-4 bg-border" />
        )}

        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}

        <FolderIcon className="h-4.5 w-4.5 flex-shrink-0 text-primary" />

        <span className="flex-1 text-sm font-medium text-foreground">
          {category.name}
        </span>

        <span className="rounded-full bg-primary-lighter px-2.5 py-0.5 text-xs font-medium text-primary transition-opacity group-hover:opacity-0">
          {category.postCount}
        </span>

        {/* Hover actions */}
        <div className="absolute right-2 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-primary">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="relative ml-4 border-l border-border pl-0">
          {category.children!.map((child) => (
            <CategoryItem key={child.id} category={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesTagsPage() {
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Categories & Tags
        </h1>
        <p className="mt-1 text-sm text-muted">
          Organize your content with categories and tags
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Panel — Categories */}
        <div className="flex-1 rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-lighter">
                <Folder className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Categories
              </h2>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.97]">
              <Plus className="h-3.5 w-3.5" />
              Add Category
            </button>
          </div>

          {/* Category tree */}
          <div className="p-4 space-y-0.5">
            {categories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>

          {/* Add category form */}
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-lighter"
              />
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover active:scale-[0.97]">
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel — Tags */}
        <div className="w-full lg:w-96 rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-lighter">
                <Hash className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Tags</h2>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.97]">
              <Plus className="h-3.5 w-3.5" />
              Add Tag
            </button>
          </div>

          {/* Tag chips */}
          <div className="flex flex-wrap gap-2.5 p-5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="group inline-flex items-center gap-1.5 rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary-lighter hover:shadow-sm"
              >
                <Tag className="h-3 w-3 opacity-60" />
                {tag.name}
                <span className="text-primary/60">({tag.postCount})</span>
                <button className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/40 transition-all duration-200 hover:bg-primary/10 hover:text-primary">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add tag form */}
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New tag name..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-lighter"
              />
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover active:scale-[0.97]">
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
