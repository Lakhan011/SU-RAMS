'use client';

import { useState } from 'react';
import { pages as cmsPages } from '@/data/mock';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Link,
  ImageIcon,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  UploadCloud,
  ChevronDown,
  Calendar,
} from 'lucide-react';

const templates = ['Homepage', 'Default', 'Landing', 'Contact', 'Legal'];

const toolbarGroups = [
  [
    { icon: Bold, label: 'Bold' },
    { icon: Italic, label: 'Italic' },
    { icon: Underline, label: 'Underline' },
  ],
  [
    { icon: Link, label: 'Link' },
    { icon: ImageIcon, label: 'Image' },
    { icon: Code, label: 'Code' },
  ],
  [
    { icon: List, label: 'Bullet List' },
    { icon: ListOrdered, label: 'Numbered List' },
    { icon: Quote, label: 'Quote' },
    { icon: Minus, label: 'Divider' },
  ],
  [
    { icon: AlignLeft, label: 'Left' },
    { icon: AlignCenter, label: 'Center' },
    { icon: AlignRight, label: 'Right' },
  ],
];

export default function NewPagePage() {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('Default');
  const [parentPage, setParentPage] = useState('none');
  const [status, setStatus] = useState('draft');
  const [visibility, setVisibility] = useState('public');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const parentPages = cmsPages.filter((p) => !p.parent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">New Page</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-surface-hover">
            Preview
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98]">
            Publish
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Main Content */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Template + Parent selectors */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted">Template</label>
              <div className="relative">
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-white py-2.5 pl-4 pr-10 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
                >
                  {templates.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted">Parent Page</label>
              <div className="relative">
                <select
                  value={parentPage}
                  onChange={(e) => setParentPage(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-white py-2.5 pl-4 pr-10 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
                >
                  <option value="none">None (Top Level)</option>
                  {parentPages.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title..."
              className="w-full text-2xl font-bold text-foreground placeholder:text-muted-light outline-none bg-transparent"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-border px-4 py-2.5 flex-wrap">
              <div className="relative">
                <select className="appearance-none rounded-md border border-border-light bg-surface-hover px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-all focus:border-primary cursor-pointer pr-7">
                  <option>Paragraph</option>
                  <option>Heading 1</option>
                  <option>Heading 2</option>
                  <option>Heading 3</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              </div>

              <div className="mx-1.5 h-6 w-px bg-border-light" />

              {toolbarGroups.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5">
                  {group.map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      title={label}
                      onClick={() => setActiveTool(activeTool === label ? null : label)}
                      className={cn(
                        'rounded-md p-2 text-muted transition-all hover:bg-surface-hover hover:text-foreground',
                        activeTool === label && 'bg-primary-light text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                  {gi < toolbarGroups.length - 1 && (
                    <div className="mx-1.5 h-6 w-px bg-border-light" />
                  )}
                </div>
              ))}
            </div>

            {/* Content area */}
            <div className="min-h-[420px] p-6 text-foreground space-y-4">
              <p className="text-base leading-relaxed">
                Start building your page content here. Use the toolbar above to format your text,
                add images, links, and more.
              </p>

              <h2 className="text-xl font-bold">Welcome Section</h2>
              <p className="text-base leading-relaxed text-muted">
                This is a placeholder for your page content. Pages can contain any combination of
                text, images, embedded media, and custom components. Arrange your content to create
                a compelling and informative experience for your visitors.
              </p>

              <div className="rounded-lg border border-border-light bg-surface-hover p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Image or Media Block</p>
                <p className="text-xs text-muted-light mt-1">
                  Click to add an image, video, or embedded content
                </p>
              </div>

              <h2 className="text-xl font-bold">Features</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted">
                <li>Responsive design that works on all devices</li>
                <li>Fast loading times with optimized assets</li>
                <li>SEO-friendly structure and metadata</li>
                <li>Accessible to all users</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 shrink-0 space-y-5">
          {/* Publish Settings */}
          <div className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-light px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">Publish Settings</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-9 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Visibility</label>
                <div className="relative">
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-9 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="password">Password Protected</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Publish Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    defaultValue="2026-06-04"
                    className="w-full rounded-lg border border-border bg-white py-2 pl-3 pr-9 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98]">
                  Publish
                </button>
                <button className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-surface-hover">
                  Save Draft
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-light px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">Featured Image</h3>
            </div>
            <div className="p-5">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-10 px-4 text-center transition-colors hover:border-primary hover:bg-primary-lighter cursor-pointer group">
                <UploadCloud className="h-10 w-10 text-muted-light group-hover:text-primary transition-colors mb-3" />
                <p className="text-sm font-medium text-foreground">Click to upload</p>
                <p className="text-xs text-muted-light mt-1">or drag and drop</p>
                <p className="text-xs text-muted-light mt-0.5">PNG, JPG, WebP up to 5MB</p>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-light px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">SEO</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Meta Title</label>
                <input
                  type="text"
                  placeholder="Enter meta title..."
                  className="w-full rounded-lg border border-border bg-white py-2 px-3 text-sm text-foreground placeholder:text-muted-light outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter meta description..."
                  className="w-full rounded-lg border border-border bg-white py-2 px-3 text-sm text-foreground placeholder:text-muted-light outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">URL Slug</label>
                <div className="flex items-center rounded-lg border border-border bg-white overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <span className="bg-surface-hover px-3 py-2 text-xs text-muted border-r border-border">
                    /
                  </span>
                  <input
                    type="text"
                    placeholder="page-url-slug"
                    className="flex-1 py-2 px-3 text-sm text-foreground placeholder:text-muted-light outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
