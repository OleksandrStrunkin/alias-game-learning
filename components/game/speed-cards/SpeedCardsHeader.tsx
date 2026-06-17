import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

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
  const selectedCategories = useSpeedCardsStore(
    (state) => state.selectedCategories,
  );
  const turnTime = useSpeedCardsStore((state) => state.turnTime);

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex gap-3 items-center">
        <h1 className="text-xl md:text-3xl font-bold italic uppercase tracking-tighter">
          Speed Cards
        </h1>
        <div className="hidden lg:block">
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
            Mode: {gameMode === "solo" ? "👤 Solo" : "⚔️ Duel"}
          </p>
          <p className="text-[10px] text-primary uppercase font-bold tracking-wider ">
            Criteria: {selectedCategories.join(", ")}
          </p>
          <p className="text-[10px] text-primary uppercase font-bold tracking-wider ">
            Time: {turnTime ? `${turnTime}s` : "No limit"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {roomCode && (
          <div className="text-sm flex flex-row font-mono bg-primary/10 px-3 py-1 rounded-sm border border-primary/20">
            Room: <span>{roomCode}</span>
          </div>
        )}
        <button
          onClick={onQuit}
          className="text-xs uppercase flex flex-row font-bold border border-primary/20 px-3 py-1 rounded-sm hover:bg-primary/10 transition-colors"
        >
          Quit <span>🚪</span>
        </button>
      </div>
    </div>
  );
};
