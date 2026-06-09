import { create } from "zustand";
import { fsEvents } from "../lib/fs-events";

export interface PreviewTarget {
  path: string;
  name: string;
  size: number;
}

interface ExplorerState {
  /** workspace-relative paths of expanded dirs ("" = root, always expanded) */
  expanded: Set<string>;
  selected: string | null;
  preview: PreviewTarget | null;
  toggle: (path: string) => void;
  collapseAll: () => void;
  select: (path: string | null) => void;
  openPreview: (target: PreviewTarget) => void;
  closePreview: () => void;
}

export const useExplorer = create<ExplorerState>((set) => ({
  expanded: new Set<string>(),
  selected: null,
  preview: null,

  toggle: (path) =>
    set((s) => {
      const expanded = new Set(s.expanded);
      if (expanded.has(path)) {
        expanded.delete(path);
        fsEvents.unwatch(path);
      } else {
        expanded.add(path);
        fsEvents.watch(path);
      }
      return { expanded };
    }),

  collapseAll: () =>
    set((s) => {
      for (const path of s.expanded) fsEvents.unwatch(path);
      return { expanded: new Set<string>() };
    }),

  select: (path) => set({ selected: path }),

  openPreview: (target) => set({ preview: target }),

  closePreview: () => set({ preview: null }),
}));
