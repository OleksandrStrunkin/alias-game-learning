import type { SpeedCardsState } from "@/store/useSpeedCardsStore";
import { SpeedCardsPlayerCard } from "./SpeedCardsPlayerCard";
import { SpeedCardsDeckControls } from "./SpeedCardsDeckControls";
import { SpeedCardsGameWordCard } from "./SpeedCardsGameWordCard";
import { SpeedCardsResultPanel } from "./SpeedCardsResultPanel";

interface SpeedCardsGameBoardProps {
  store: SpeedCardsState;
  isMyTurn: boolean;
  isHost: boolean;
  loading: boolean;
  timers?: Record<string, { remaining: number | null; percent: number | null }>;
  fetchWords: () => void;
  handleSelectCard: (cardId: string) => Promise<void> | void;
  onSyncCategories?: () => Promise<void>;
}

export const SpeedCardsGameBoard = ({
  store,
  isMyTurn,
  isHost,
  loading,
  timers,
  onSyncCategories,
  fetchWords,
  handleSelectCard,
}: SpeedCardsGameBoardProps) => {
  return (
    <>
      <div className="space-y-6 relative">
        {/* Turn Banner for Duel Mode */}
        {store.turnTime !== null && (
          <div className="flex items-center justify-center mb-2">
            <div className="px-4 py-2 rounded-full bg-secondary/5 border border-border text-sm font-mono">
              Turn time: {store.turnTime ? `${store.turnTime}s` : "No limit"}
              {timers &&
                store.activePlayerId &&
                timers[store.activePlayerId] && (
                  <span className="ml-3 font-black">
                    {timers[store.activePlayerId].remaining}s
                  </span>
                )}
            </div>
          </div>
        )}

        {/* In-game deck controls */}
        <SpeedCardsDeckControls
          loading={loading}
          isHost={isHost}
          fetchWords={fetchWords}
          onSyncCategories={onSyncCategories}
        />

        {/* Progress / Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(store.players).map((playerId) => (
            <SpeedCardsPlayerCard
              key={playerId}
              playerId={playerId}
              timer={timers?.[playerId]}
            />
          ))}
        </div>

        {/* Cards Grid */}
        {store.cards.some((card) => !card.isMatched) && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
            {store.cards.map((card) => (
              <SpeedCardsGameWordCard
                key={card.id}
                cardId={card.id}
                isMyTurn={isMyTurn}
                handleSelectCard={handleSelectCard}
              />
            ))}
          </div>
        )}

        {/* Winner banner / Game Over */}
        {store.cards.length > 0 && store.cards.every((c) => c.isMatched) && (
          <SpeedCardsResultPanel
            isHost={isHost}
            loading={loading}
            fetchWords={fetchWords}
            onSyncCategories={onSyncCategories}
          />
        )}
      </div>
    </>
  );
};
