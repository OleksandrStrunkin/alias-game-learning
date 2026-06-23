import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

interface SpeedCardsPlayerCardProps {
  playerId: string;
  timer?: { remaining: number | null; percent: number | null };
}

export const SpeedCardsPlayerCard = ({
  playerId,
  timer,
}: SpeedCardsPlayerCardProps) => {
  const player = useSpeedCardsStore((s) => s.players[playerId]);
  const isActive = useSpeedCardsStore((s) => s.activePlayerId === playerId);
  const isMe = useSpeedCardsStore((s) => s.myPlayerId === playerId);

  if (!player) return null;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isActive
          ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]"
          : "border-border bg-secondary/5"
      }`}
    >
      <div className="flex flex-col gap-3 text-xs mb-3 uppercase font-bold tracking-widest">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {isMe ? `${player.name} (You)` : player.name}
            </span>
            {isActive && (
              <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] uppercase font-black">
                Active
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-primary/70">
            {player.matches} / {player.total}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-primary/70">
          <span>Timer</span>
          <span className="font-black text-primary">
            {timer && timer.remaining !== null ? `${timer.remaining}s` : "--"}
          </span>
        </div>
      </div>
      <div className="h-3 bg-black/10 rounded-full overflow-hidden border border-border shadow-inner">
        <div
          className={`h-full ${isActive ? "bg-linear-to-r from-cyan-500 via-sky-400 to-blue-500" : "bg-secondary/30"} transition-all duration-200`}
          style={{ width: `${timer?.percent ?? 0}%` }}
        />
      </div>
    </div>
  );
};
