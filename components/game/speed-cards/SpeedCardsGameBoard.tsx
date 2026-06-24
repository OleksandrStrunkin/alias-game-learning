import type { SpeedCardsState } from "@/store/useSpeedCardsStore";
import { SpeedCardsPlayerCard } from "./SpeedCardsPlayerCard";
import { SpeedCardsDeckControls } from "./SpeedCardsDeckControls";
import { SpeedCardsGameWordCard } from "./SpeedCardsGameWordCard";

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
          <div className="text-center py-10 bg-secondary border border-border rounded-3xl mt-8">
            {store.gameMode === "duel" ? (
              store.winnerId === store.myPlayerId ? (
                <div>
                  <h2 className="text-4xl font-black text-amber-500 mb-4 italic uppercase">
                    Victory! 🏆
                  </h2>
                  <p className="text-sm font-semibold mb-6">
                    You won the match by matching more pairs!
                  </p>
                </div>
              ) : store.winnerId === "draw" ? (
                <div>
                  <h2 className="text-4xl font-black text-primary mb-4 italic uppercase">
                    Draw! 🤝
                  </h2>
                  <p className="text-sm font-semibold mb-6">
                    Both players matched equal number of pairs!
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-4xl font-black text-primary/60 mb-4 italic uppercase">
                    Game Over ⚔️
                  </h2>
                  <p className="text-sm font-semibold mb-6">
                    Opponent matched more pairs. Better luck next time!
                  </p>
                </div>
              )
            ) : (
              <div>
                <h2 className="text-4xl font-black text-primary mb-4 italic uppercase">
                  Completed! ✨
                </h2>
                <p className="text-sm font-semibold mb-6">
                  You successfully matched all pairs!
                </p>
              </div>
            )}

            {/* Play Again button (only host can trigger in duel mode) */}
            {store.gameMode === "duel" ? (
              isHost ? (
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-widest text-primary/60">
                    Choose difficulty for next round
                  </div>
                  <div className="flex justify-center gap-2">
                    {["A2", "B1", "B2"].map((category) => {
                      const active =
                        store.selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          onClick={async () => {
                            store.toggleCategory(category);
                            if (onSyncCategories) await onSyncCategories();
                          }}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
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
                  <div className="text-xs uppercase tracking-widest text-primary/60">
                    Choose turn time for next round
                  </div>
                  <div className="flex justify-center gap-2">
                    {[10, 15, 20, 0].map((t) => {
                      const active =
                        t === 0
                          ? store.turnTime === null
                          : store.turnTime === t;
                      return (
                        <button
                          key={t}
                          onClick={async () => {
                            store.setTurnTime(t === 0 ? null : t);
                            if (onSyncCategories) await onSyncCategories();
                          }}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            active
                              ? "bg-primary border-primary text-primary-foreground shadow-lg"
                              : "bg-secondary/5 border-border text-primary/50 hover:bg-secondary/10"
                          }`}
                        >
                          {t === 0 ? "No limit" : `${t}s`}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={fetchWords}
                      disabled={loading}
                      className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                      {loading ? "Resetting..." : "Play Again 🔄"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-primary/40 uppercase tracking-widest font-bold">
                  Waiting for the host to restart the game...
                </p>
              )
            ) : (
              <button
                onClick={fetchWords}
                disabled={loading}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-transform"
              >
                {loading ? "Loading..." : "Play Again? 🔄"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
