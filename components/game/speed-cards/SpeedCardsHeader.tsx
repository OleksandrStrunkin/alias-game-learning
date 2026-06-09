interface SpeedCardsHeaderProps {
  gameMode: "solo" | "duel" | null;
  roomCode: string | null;
  onQuit: () => void;
}

export const SpeedCardsHeader = ({
  gameMode,
  roomCode,
  onQuit,
}: SpeedCardsHeaderProps) => {
    return (
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold italic uppercase tracking-tighter">
            Speed Cards
          </h1>
          <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">
            Mode: {gameMode === "solo" ? "👤 Solo" : "⚔️ Duel"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onQuit}
            className="text-xs uppercase font-bold border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
          >
            Quit 🚪
          </button>
          {roomCode && (
            <div className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Room: {roomCode}
            </div>
          )}
        </div>
      </div>
    );
}