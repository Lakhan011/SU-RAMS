'use client';

import { useState } from 'react';
import { menuItems, pages, type MenuItem } from '@/data/mock';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Save,
  ChevronDown,
  Link as LinkIcon,
  Type,
  Layout,
  Check,
} from 'lucide-react';

const iconOptions = [
  { value: 'home', label: 'Home' },
  { value: 'info', label: 'Info' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'book', label: 'Book' },
  { value: 'mail', label: 'Mail' },
  { value: 'none', label: 'None' },
];

function MenuItemCard({
  item,
  isChild = false,
}: {
  item: MenuItem;
  isChild?: boolean;
}) {
  return (
    <div className={cn('space-y-2', isChild && 'ml-8')}>
      <div
        className={cn(
          'flex items-center gap-3 bg-surface rounded-lg border border-border p-4 shadow-xs',
          'hover:shadow-sm hover:border-primary/30 transition-all duration-200 group',
          isChild && 'border-l-2 border-l-primary/30'
        )}
      >
        <div className="cursor-grab text-muted hover:text-foreground transition-colors">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{item.label}</p>
          <p className="text-xs text-muted truncate">{item.url}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="p-1.5 rounded-md hover:bg-primary-light text-muted hover:text-primary transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-danger-light text-muted hover:text-danger transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {item.children?.map((child) => (
        <MenuItemCard key={child.id} item={child} isChild />
      ))}
    </div>
  );
}

export default function MenuBuilderPage() {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('none');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const togglePage = (pageId: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu Builder</h1>
          <p className="text-sm text-muted mt-1">
            Organize your site navigation structure
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
          <Save className="h-4 w-4" />
          Save Menu
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: Menu Structure */}
        <div className="flex-1">
          <div className="bg-surface rounded-xl border border-border shadow-xs">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Main Navigation
                </h2>
              </div>
              <span className="text-xs text-muted bg-background rounded-full px-2.5 py-1 font-medium">
                {menuItems.length} items
              </span>
            </div>
            <div className="p-5 space-y-3">
              {menuItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}

              {/* Add Menu Item button */}
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/40 text-muted hover:text-primary transition-all duration-200 group">
                <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-sm font-medium">Add Menu Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Add Menu Item Panel */}
        <div className="w-80 space-y-5 shrink-0">
          {/* Add Menu Item Form */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Add Menu Item
            </h3>
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Label
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light" />
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Menu item label"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/page-slug"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Icon
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-light pointer-events-none" />
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
                Add to Menu
              </button>
            </div>
          </div>

          {/* Available Pages */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Available Pages
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pages.map((page) => (
                <label
                  key={page.id}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-150',
                    selectedPages.includes(page.id)
                      ? 'bg-primary-light border border-primary/20'
                      : 'hover:bg-surface-hover border border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                      selectedPages.includes(page.id)
                        ? 'bg-primary border-primary'
                        : 'border-border hover:border-muted'
                    )}
                  >
                    {selectedPages.includes(page.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {page.title}
                    </p>
                    <p className="text-xs text-muted truncate">{page.slug}</p>
                  </div>
                </label>
              ))}
            </div>
            <button
              disabled={selectedPages.length === 0}
              className={cn(
                'w-full mt-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                selectedPages.length > 0
                  ? 'bg-primary hover:bg-primary-hover text-white hover:shadow-md active:scale-[0.98]'
                  : 'bg-background text-muted cursor-not-allowed'
              )}
            >
              Add Selected ({selectedPages.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
