interface Props {
  roundDuration: number;
  timeLeft: number;
  activeTeamName?: string;
  isMyTurn: boolean;
  onStart: () => void;
  onDurationChange: (val: number) => void;
  onDurationSync: () => void;
}

export const RoundPreparation = ({
  roundDuration,
  timeLeft,
  activeTeamName,
  isMyTurn,
  onStart,
  onDurationChange,
  onDurationSync,
}: Props) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in min-h-75 lg:min-h-87.5">
      {timeLeft !== 0 && (
        <div className="w-full max-w-xs p-4 bg-secondary/5 rounded-xl border border-border">
          <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em] mb-4">
            Round Duration:{" "}
            <span className="text-primary text-sm">{roundDuration}s</span>
          </p>
          <input
            type="range"
            min="60"
            max="180"
            step="10"
            disabled={!isMyTurn}
            value={roundDuration}
            onChange={(e) => onDurationChange(parseInt(e.target.value))}
            onMouseUp={onDurationSync}
            onTouchEnd={onDurationSync}
            className="w-full h-1.5 bg-secondary/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      )}
      <div className="space-y-2">
        <p className="text-primary text-md uppercase font-black tracking-[0.3em]">
          {timeLeft === 0 ? "Round finished" : "Ready?"}
        </p>
        <h2 className="text-5xl font-black uppercase italic text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          {activeTeamName}
        </h2>
      </div>
      <button
        disabled={!isMyTurn}
        onClick={onStart}
        className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest bg-primary/90 text-primary-foreground hover:bg-primary shadow-lg shadow-primary/30 transition-all hover:scale-105 disabled:opacity-20"
      >
        {timeLeft === 0 ? "Next Team" : "Start Round"}
      </button>
    </div>
  );
};
