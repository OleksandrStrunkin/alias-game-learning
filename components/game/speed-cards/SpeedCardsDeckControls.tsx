import { useShallow } from "zustand/react/shallow";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

interface SpeedCardsDeckControlsProps {
  loading: boolean;
  isHost: boolean;
  fetchWords: () => void;
  onSyncCategories?: () => Promise<void>;
}

export const SpeedCardsDeckControls = ({
  loading,
  isHost,
  fetchWords,
  onSyncCategories,
}: SpeedCardsDeckControlsProps) => {
  const { gameMode, selectedCategories, toggleCategory, hasUnmatchedCards } =
    useSpeedCardsStore(
      useShallow((s) => ({
        gameMode: s.gameMode,
        selectedCategories: s.selectedCategories,
        toggleCategory: s.toggleCategory,
        hasUnmatchedCards: s.cards.some((card) => !card.isMatched),
      })),
    );

  if (!hasUnmatchedCards) return null;

  return (
    <div className="space-y-4 flex flex-col md:flex-row justify-between items-start">
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {["A2", "B1", "B2"].map((category) => {
          const active = selectedCategories.includes(category);
          return (
            <button
              disabled={loading || (gameMode === "duel" && !isHost)}
              key={category}
              onClick={async () => {
                toggleCategory(category);
                if (onSyncCategories) await onSyncCategories();
              }}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all border ${
                active
                  ? "bg-primary border-primary text-primary-foreground shadow-lg"
                  : "bg-secondary/5 border-border text-primary/50 hover:bg-secondary/10"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {gameMode === "duel" && !isHost && (
          <p className="text-[10px] hidden md:block text-primary/40 uppercase tracking-widest">
            Only the host can request a new deck.
          </p>
        )}
        <button
          onClick={fetchWords}
          disabled={loading || (gameMode === "duel" && !isHost)}
          className="px-4 py-1 bg-primary text-primary-foreground font-bold rounded-xl transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "New Deck of Words"}
        </button>
      </div>
    </div>
  );
};
