'use client';

import { useState } from 'react';
import { mediaItems, type MediaItem } from '@/data/mock';
import { cn } from '@/lib/utils';
import {
  Search,
  UploadCloud,
  Image,
  Film,
  FileText,
  Music,
  Eye,
  Copy,
  Trash2,
  LayoutGrid,
  List,
  Plus,
} from 'lucide-react';

const typeFilters = ['All', 'Images', 'Videos', 'Documents', 'Audio'] as const;
type TypeFilter = (typeof typeFilters)[number];

const typeMap: Record<Exclude<TypeFilter, 'All'>, MediaItem['type']> = {
  Images: 'image',
  Videos: 'video',
  Documents: 'document',
  Audio: 'audio',
};

function getFileIcon(type: MediaItem['type']) {
  switch (type) {
    case 'image':
      return Image;
    case 'video':
      return Film;
    case 'document':
      return FileText;
    case 'audio':
      return Music;
  }
}

export default function MediaLibraryPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<TypeFilter>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      activeFilter === 'All' || item.type === typeMap[activeFilter];
    return matchesSearch && matchesType;
  });

  const storageUsed = 2.4;
  const storageTotal = 10;
  const storagePercent = (storageUsed / storageTotal) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 w-48 overflow-hidden rounded-full bg-primary-lighter">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <span className="text-sm text-muted">
              {storageUsed} GB of {storageTotal} GB used
            </span>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.97]">
          <Plus className="h-4 w-4" />
          Upload Files
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-lighter"
            />
          </div>
          <div className="flex items-center rounded-lg border border-border bg-surface p-1">
            {typeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                  activeFilter === filter
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface-hover'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-2 transition-all duration-200',
              viewMode === 'grid'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md p-2 transition-all duration-200',
              viewMode === 'list'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upload dropzone */}
      <div className="group cursor-pointer rounded-xl border-2 border-dashed border-primary/30 bg-primary-lighter/50 px-6 py-10 text-center transition-all duration-300 hover:border-primary/60 hover:bg-primary-lighter">
        <UploadCloud className="mx-auto h-10 w-10 text-primary/60 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Drag and drop files here
        </p>
        <p className="mt-1 text-sm text-muted">or click to browse</p>
        <p className="mt-2 text-xs text-muted-light">
          Supports: JPG, PNG, SVG, MP4, PDF, MP3
        </p>
      </div>

      {/* File count */}
      <p className="text-sm text-muted">{filteredItems.length} files</p>

      {/* Grid view */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => {
          const FileIcon = getFileIcon(item.type);
          return (
            <div
              key={item.id}
              className="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
            >
              {/* Preview area */}
              <div className="relative h-40 overflow-hidden" style={{ backgroundColor: item.color + '18' }}>
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: item.color + '22' }}
                >
                  <FileIcon
                    className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: item.color }}
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 backdrop-blur-0 transition-all duration-300 group-hover:bg-black/50 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm transition-all duration-200 hover:bg-white hover:scale-110">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm transition-all duration-200 hover:bg-white hover:scale-110">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-red-500 shadow-sm transition-all duration-200 hover:bg-white hover:scale-110">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-3.5">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <span>{item.size}</span>
                  {item.dimensions && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-muted/40" />
                      <span>{item.dimensions}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
