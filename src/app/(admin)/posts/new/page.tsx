'use client';

import { useState } from 'react';
import { categories } from '@/data/mock';
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
  X,
  ChevronDown,
  Calendar,
} from 'lucide-react';

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

const initialTags = ['React', 'Next.js', 'TypeScript'];

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [visibility, setVisibility] = useState('public');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  function toggleCategory(id: number) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">New Post</h1>
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
          {/* Title Input */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
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
                Welcome to the post editor. Start writing your content here. This editor supports{' '}
                <strong>bold text</strong>, <em>italic text</em>, and{' '}
                <span className="text-primary underline cursor-pointer">inline links</span>.
              </p>

              <h2 className="text-xl font-bold">Getting Started</h2>
              <p className="text-base leading-relaxed text-muted">
                Use the toolbar above to format your content. You can add headings, lists, quotes,
                images, and code blocks to create rich, engaging articles for your readers.
              </p>

              <blockquote className="border-l-4 border-primary pl-4 italic text-muted">
                &ldquo;The best way to predict the future is to create it.&rdquo; — Peter Drucker
              </blockquote>

              <ul className="list-disc pl-6 space-y-1 text-muted">
                <li>Create compelling headlines that grab attention</li>
                <li>Use images and media to break up text</li>
                <li>Write with your audience in mind</li>
                <li>Optimize for search engines with proper meta tags</li>
              </ul>

              <div className="rounded-lg bg-gray-900 p-4">
                <code className="text-sm text-green-400">
                  {'const greeting = "Hello, World!";'}
                  <br />
                  {'console.log(greeting);'}
                </code>
              </div>
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
                    <option value="scheduled">Scheduled</option>
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

          {/* Categories */}
          <div className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-light px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">Categories</h3>
            </div>
            <div className="max-h-52 overflow-y-auto p-5 space-y-2">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="h-4 w-4 rounded border-border text-primary accent-primary"
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-light ml-auto">{cat.postCount}</span>
                  </label>
                  {cat.children?.map((child) => (
                    <label
                      key={child.id}
                      className="flex items-center gap-2.5 pl-6 mt-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(child.id)}
                        onChange={() => toggleCategory(child.id)}
                        className="h-4 w-4 rounded border-border text-primary accent-primary"
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {child.name}
                      </span>
                      <span className="text-xs text-muted-light ml-auto">{child.postCount}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-light px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">Tags</h3>
            </div>
            <div className="p-5 space-y-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add a tag and press Enter"
                className="w-full rounded-lg border border-border bg-white py-2 px-3 text-sm text-foreground placeholder:text-muted-light outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="rounded-full p-0.5 hover:bg-primary/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
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
                    /blog/
                  </span>
                  <input
                    type="text"
                    placeholder="post-url-slug"
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
