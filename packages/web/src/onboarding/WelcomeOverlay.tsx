/** First-run welcome — shown until the user has been onboarded. */
export function WelcomeOverlay({
  workspaceName,
  onOpenVaultPicker,
  onDismiss,
}: {
  workspaceName?: string;
  onOpenVaultPicker: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-ink-700 bg-ink-900 p-7 shadow-2xl">
        <div className="mb-1 text-3xl text-accent">❯_</div>
        <h1 className="text-lg font-semibold text-ink-100">Welcome to webcode</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-300">
          A native-feeling terminal, file explorer, and editor for your machine — in the browser.
          You're working in{" "}
          <span className="text-accent">{workspaceName ?? "this folder"}</span>. Everything stays
          local.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-[12px]">
          <Tip kbd="⌘K" label="Jump to a file or command" />
          <Tip kbd="⌘R" label="Re-run a recent command" />
          <Tip kbd="⌘⇧O" label="Switch workspace" />
        </div>

        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={onOpenVaultPicker}
            className="rounded border border-ink-700 px-3 py-1.5 text-[12.5px] text-ink-200 hover:border-accent-dim hover:text-ink-100"
          >
            Open a different folder…
          </button>
          <button
            onClick={onDismiss}
            className="ml-auto rounded border border-accent-dim bg-accent-dim/15 px-4 py-1.5 text-[12.5px] text-accent hover:bg-accent-dim/25"
          >
            Start working
          </button>
        </div>
      </div>
    </div>
  );
}

function Tip({ kbd, label }: { kbd: string; label: string }) {
  return (
    <div className="rounded border border-ink-700 bg-ink-850 p-2">
      <div className="font-mono text-accent">{kbd}</div>
      <div className="mt-0.5 text-ink-400">{label}</div>
    </div>
  );
}
