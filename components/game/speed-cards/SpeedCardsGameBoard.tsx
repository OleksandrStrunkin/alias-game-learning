import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

import { SpeedCardsPlayerCard } from "./SpeedCardsPlayerCard";
import { SpeedCardsDeckControls } from "./SpeedCardsDeckControls";
import { SpeedCardsGameWordCard } from "./SpeedCardsGameWordCard";
import { SpeedCardsResultPanel } from "./SpeedCardsResultPanel";

interface SpeedCardsGameBoardProps {
  isMyTurn: boolean;
  isHost: boolean;
  loading: boolean;
  timers?: Record<string, { remaining: number | null; percent: number | null }>;
  fetchWords: () => void;
  handleSelectCard: (cardId: string) => Promise<void> | void;
  onSyncCategories?: () => Promise<void>;
}

export const SpeedCardsGameBoard = ({
  isMyTurn,
  isHost,
  loading,
  timers,
  onSyncCategories,
  fetchWords,
  handleSelectCard,
}: SpeedCardsGameBoardProps) => {
  const turnTime = useSpeedCardsStore((state) => state.turnTime);
  const activePlayerId = useSpeedCardsStore((state) => state.activePlayerId);
  const players = useSpeedCardsStore((state) => state.players);
  const cards = useSpeedCardsStore((state) => state.cards);

  const hasUnmatchedCards = cards.some((card) => !card.isMatched);

  return (
    <div className="space-y-6 relative">
      {/* Turn Banner for Duel Mode */}
      {turnTime !== null && (
        <div className="flex items-center justify-center mb-2">
          <div className="px-4 py-2 rounded-full bg-secondary/5 border border-border text-sm font-mono">
            Turn time: {turnTime ? `${turnTime}s` : "No limit"}
            {timers && activePlayerId && timers[activePlayerId] && (
              <span className="ml-3 font-black">
                {timers[activePlayerId].remaining}s
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
        {Object.keys(players).map((playerId) => (
          <SpeedCardsPlayerCard
            key={playerId}
            playerId={playerId}
            timer={timers?.[playerId]}
          />
        ))}
      </div>

      {/* Cards Grid */}
      {hasUnmatchedCards && (
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-4 gap-1 relative">
          {cards.map((card) => (
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
      <SpeedCardsResultPanel
        isHost={isHost}
        loading={loading}
        fetchWords={fetchWords}
        onSyncCategories={onSyncCategories}
      />
    </div>
  );
};