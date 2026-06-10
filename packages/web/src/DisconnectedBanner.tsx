import type { ConnState } from "./state/connection";

/** Top banner shown while the daemon is unreachable. WS sockets reconnect on their own. */
export function DisconnectedBanner({ state }: { state: ConnState }) {
  if (state === "connected") return null;
  const disconnected = state === "disconnected";
  return (
    <div
      className={`flex shrink-0 items-center justify-center gap-2 px-3 py-1 text-[12px] ${
        disconnected ? "bg-danger/90 text-ink-950" : "bg-yellow-600/90 text-ink-950"
      }`}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-950" />
      {disconnected
        ? "Disconnected from the webcode daemon — retrying…"
        : "Reconnecting…"}
    </div>
  );
}
