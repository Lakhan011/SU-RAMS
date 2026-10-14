import { create } from 'zustand';
import React from 'react';

interface LayoutState {
  title: string;
  subtitle: string;
  primaryAction: React.ReactNode | null;
  setHeader: (title: string, subtitle?: string, primaryAction?: React.ReactNode) => void;
  resetHeader: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  title: '',
  subtitle: '',
  primaryAction: null,
  setHeader: (title, subtitle = '', primaryAction = null) => 
    set({ title, subtitle, primaryAction }),
  resetHeader: () => 
    set({ title: '', subtitle: '', primaryAction: null }),
}));
