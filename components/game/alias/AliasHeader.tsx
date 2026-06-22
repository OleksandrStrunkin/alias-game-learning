import { useAliasStore } from "@/store/useAliasStore";

interface AliasHeaderProps {
  roomCode: string | null;
  onQuit: () => void;
}

export const AliasHeader = ({ roomCode, onQuit }: AliasHeaderProps) => {
  const selectedCategories = useAliasStore(
    (state) => state.selectedCategories,
  );
  const turnTime = useAliasStore((state) => state.roundDuration);

  return (
    <div className="flex justify-between mb-5 items-center max-w-4xl mx-auto">
      <div className="flex gap-3 items-center">
        <h1 className="text-xl md:text-3xl font-bold italic uppercase tracking-tighter">
          Alias
        </h1>
        <div className="hidden lg:block">
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
