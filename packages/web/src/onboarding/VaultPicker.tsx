import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const tilde = (p: string) => p.replace(/^\/Users\/[^/]+/, "~").replace(/^\/home\/[^/]+/, "~");

/**
 * Obsidian-style folder picker: browse the filesystem from ~, pick a folder
 * as the workspace, open a recent one, or create a new folder. Selecting one
 * switches the daemon and reloads via the parent's onPick.
 */
export function VaultPicker({
  recent,
  currentRoot,
  onClose,
  onPick,
}: {
  recent: string[];
  currentRoot?: string;
  onClose: () => void;
  onPick: (path: string) => void;
}) {
  const [path, setPath] = useState<string | undefined>(undefined);

  const browse = useQuery({
    queryKey: ["browse", path ?? "~"],
    queryFn: () => api.browse(path),
  });
  const here = browse.data?.path;

  const newFolder = async () => {
    if (!here) return;
    const name = window.prompt("New folder name (created here, then opened):");
    if (!name) return;
    try {
      const res = await api.browseMkdir(here, name);
      onPick(res.path);
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex h-[60vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-ink-700 px-3 py-2">
          <span className="text-[13px] font-semibold text-ink-100">Open a folder as workspace</span>
          <button onClick={onClose} className="ml-auto rounded p-1 text-ink-500 hover:text-ink-100" title="Close">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8m0-8l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {recent.filter((r) => r !== currentRoot).length > 0 && (
          <div className="border-b border-ink-700 px-2 py-1.5">
            <div className="px-1 py-0.5 text-[10px] uppercase tracking-wider text-ink-500">Recent</div>
            <div className="flex flex-wrap gap-1">
              {recent.filter((r) => r !== currentRoot).slice(0, 6).map((r) => (
                <button
                  key={r}
                  onClick={() => onPick(r)}
                  title={r}
                  className="max-w-full truncate rounded border border-ink-700 px-2 py-0.5 text-[11.5px] text-ink-300 hover:border-accent-dim hover:text-ink-100"
                >
                  {tilde(r)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* breadcrumb / current path */}
        <div className="flex items-center gap-2 border-b border-ink-700 px-3 py-1.5 text-[12px]">
          <button
            onClick={() => browse.data?.parent && setPath(browse.data.parent)}
            disabled={!browse.data?.parent}
            className="rounded px-1 text-ink-400 enabled:hover:text-ink-100 disabled:opacity-30"
            title="Up"
          >
            ↑
          </button>
          <span className="truncate text-ink-300" title={here}>{here ? tilde(here) : "…"}</span>
        </div>

        {/* directory list */}
        <div className="min-h-0 flex-1 overflow-auto py-1">
          {browse.isLoading && <div className="px-3 py-2 text-[12px] text-ink-500">loading…</div>}
          {browse.error && <div className="px-3 py-2 text-[12px] text-danger">{(browse.error as Error).message}</div>}
          {browse.data?.dirs.length === 0 && <div className="px-3 py-2 text-[12px] text-ink-500">no subfolders</div>}
          {browse.data?.dirs.map((d) => (
            <div
              key={d.path}
              className="group flex cursor-default items-center gap-2 px-3 py-1 text-[12.5px] hover:bg-ink-800"
              onClick={() => setPath(d.path)}
              onDoubleClick={() => onPick(d.path)}
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-accent-dim" fill="currentColor">
                <path d="M1.5 3.5A1.5 1.5 0 013 2h3l1.5 1.5H13A1.5 1.5 0 0114.5 5v7A1.5 1.5 0 0113 13.5H3A1.5 1.5 0 011.5 12v-8.5z" />
              </svg>
              <span className="truncate text-ink-100">{d.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPick(d.path);
                }}
                className="ml-auto hidden rounded border border-ink-700 px-2 py-0.5 text-[11px] text-accent group-hover:block hover:bg-ink-700"
              >
                open
              </button>
            </div>
          ))}
        </div>

        {/* footer actions */}
        <div className="flex items-center gap-2 border-t border-ink-700 px-3 py-2">
          <button onClick={() => void newFolder()} className="rounded border border-ink-700 px-2.5 py-1 text-[12px] text-ink-300 hover:text-ink-100">
            New folder…
          </button>
          <button
            onClick={() => here && onPick(here)}
            disabled={!here}
            className="ml-auto rounded border border-accent-dim bg-accent-dim/15 px-3 py-1 text-[12px] text-accent enabled:hover:bg-accent-dim/25 disabled:opacity-40"
          >
            Open this folder
          </button>
        </div>
      </div>
    </div>
  );
}
