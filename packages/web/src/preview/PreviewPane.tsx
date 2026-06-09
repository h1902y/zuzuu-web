import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useExplorer, type PreviewTarget } from "../state/explorer";
import {
  TEXT_SIZE_LIMIT,
  categorize,
  formatBytes,
  looksBinary,
  shikiLang,
} from "./filetypes";
import { MarkdownView } from "./MarkdownView";
import { CsvView } from "./CsvView";
import { ShikiBlock } from "./shiki";

function inlineUrl(path: string): string {
  return `${api.downloadUrl(path)}&inline=1`;
}

export function PreviewPane() {
  const preview = useExplorer((s) => s.preview);
  const closePreview = useExplorer((s) => s.closePreview);
  if (!preview) return null;

  return (
    <div className="flex h-full min-w-0 flex-col bg-ink-900">
      <div className="flex shrink-0 items-center gap-2 border-b border-ink-700 px-3 py-1.5">
        <span className="truncate text-[12px] text-ink-100" title={preview.path}>
          {preview.name}
        </span>
        <span className="shrink-0 text-[11px] text-ink-500">{formatBytes(preview.size)}</span>
        <span className="ml-auto flex shrink-0 items-center gap-0.5">
          <HeaderButton title="Download" onClick={() => downloadFile(preview)} d="M8 3v7m0 0L5 7m3 3l3-3M3 13h10" />
          <HeaderButton title="Open in new tab" onClick={() => window.open(inlineUrl(preview.path), "_blank")} d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />
          <HeaderButton title="Close preview" onClick={closePreview} d="M4 4l8 8m0-8l-8 8" />
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <PreviewBody key={preview.path} target={preview} />
      </div>
    </div>
  );
}

function downloadFile(target: PreviewTarget) {
  const a = document.createElement("a");
  a.href = api.downloadUrl(target.path);
  a.download = target.name;
  a.click();
}

function PreviewBody({ target }: { target: PreviewTarget }) {
  const category = categorize(target.name);

  switch (category) {
    case "image":
      return (
        <div className="flex h-full items-center justify-center p-4">
          <img
            src={inlineUrl(target.path)}
            alt={target.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    case "pdf":
      return <iframe src={inlineUrl(target.path)} title={target.name} className="h-full w-full" />;
    case "video":
      return (
        <div className="flex h-full items-center justify-center bg-black/40 p-3">
          <video src={inlineUrl(target.path)} controls className="max-h-full max-w-full" />
        </div>
      );
    case "audio":
      return (
        <div className="flex h-full items-center justify-center p-6">
          <audio src={inlineUrl(target.path)} controls className="w-full" />
        </div>
      );
    case "binary":
      return <BinaryCard target={target} />;
    case "markdown":
    case "csv":
    case "code":
      return <TextPreview target={target} category={category} />;
  }
}

function TextPreview({
  target,
  category,
}: {
  target: PreviewTarget;
  category: "markdown" | "csv" | "code";
}) {
  const tooLarge = target.size > TEXT_SIZE_LIMIT;

  const { data, isLoading, error } = useQuery({
    queryKey: ["preview", target.path],
    enabled: !tooLarge,
    queryFn: async () => {
      const res = await fetch(inlineUrl(target.path));
      if (!res.ok) throw new Error(`failed to load (${res.status})`);
      return res.text();
    },
  });

  if (tooLarge)
    return (
      <Card>
        too large to preview ({formatBytes(target.size)}) —
        <button className="ml-1 text-accent hover:underline" onClick={() => downloadFile(target)}>
          download
        </button>
      </Card>
    );
  if (error) return <Card>{(error as Error).message}</Card>;
  if (isLoading || data === undefined)
    return <Card muted>loading…</Card>;
  if (looksBinary(data)) return <BinaryCard target={target} />;

  if (category === "markdown") return <MarkdownView path={target.path} text={data} />;
  if (category === "csv") return <CsvView text={data} name={target.name} />;
  return (
    <div className="px-4 py-3">
      <ShikiBlock code={data} lang={shikiLang(target.name)} />
    </div>
  );
}

function BinaryCard({ target }: { target: PreviewTarget }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-300">
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-ink-500" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zM14 2v4h4" strokeLinejoin="round" />
        <path d="M9 13h6M9 16h4" strokeLinecap="round" />
      </svg>
      <div className="text-[12px]">{target.name} · {formatBytes(target.size)}</div>
      <div className="text-[11px] text-ink-500">binary file — no preview</div>
      <button
        onClick={() => downloadFile(target)}
        className="rounded border border-ink-700 px-3 py-1 text-[12px] hover:border-accent-dim hover:text-ink-100"
      >
        download
      </button>
    </div>
  );
}

function Card({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div className={`flex h-full items-center justify-center px-4 text-[12px] ${muted ? "text-ink-500" : "text-ink-300"}`}>
      <div>{children}</div>
    </div>
  );
}

function HeaderButton({ title, onClick, d }: { title: string; onClick: () => void; d: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="rounded p-1 text-ink-300 hover:bg-ink-700 hover:text-ink-100"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d={d} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
