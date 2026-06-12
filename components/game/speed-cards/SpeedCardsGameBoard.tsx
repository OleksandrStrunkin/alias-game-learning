import type { SpeedCardsState } from "@/store/useSpeedCardsStore";

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
        {store.cards.some((card) => !card.isMatched) && (
          <div className="space-y-4 flex flex-col md:flex-row justify-between items-start">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {["A2", "B1", "B2"].map((category) => {
                const active = store.selectedCategories.includes(category);
                return (
                  <button
                    disabled={loading || (store.gameMode === "duel" && !isHost)}
                    key={category}
                    onClick={async () => {
                      store.toggleCategory(category);
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
              {store.gameMode === "duel" && !isHost && (
                <p className="text-[10px] hidden md:block text-primary/40 uppercase tracking-widest">
                  Only the host can request a new deck.
                </p>
              )}
              <button
                onClick={fetchWords}
                disabled={loading || (store.gameMode === "duel" && !isHost)}
                className="px-4 py-1 bg-primary text-primary-foreground font-bold rounded-xl transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "New Deck of Words"}
              </button>
            </div>
          </div>
        )}

        {/* Progress / Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(store.players).map((player) => {
            const t = timers ? timers[player.id] : undefined;
            const isActive = player.id === store.activePlayerId;
            return (
              <div
                key={player.id}
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
                        {player.id === store.myPlayerId
                          ? `${player.name} (You)`
                          : player.name}
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
                      {t && t.remaining !== null ? `${t.remaining}s` : "--"}
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-black/10 rounded-full overflow-hidden border border-border shadow-inner">
                  <div
                    className={`h-full ${
                      isActive
                        ? "bg-linear-to-r from-cyan-500 via-sky-400 to-blue-500"
                        : "bg-secondary/30"
                    } transition-all duration-200`}
                    style={{
                      width: `${t && t.percent ? t.percent : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards Grid */}
        {store.cards.some((card) => !card.isMatched) && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
            {store.cards.map((card) => {
              const isSelected = store.selectedCardId === card.id;
              const isFailed = store.failedPair?.includes(card.id);

              return (
                <button
                  key={card.id}
                  onClick={() => !card.isMatched && handleSelectCard(card.id)}
                  disabled={card.isMatched || !isMyTurn || !!store.failedPair}
                  className={`h-24 p-2 rounded-2xl border-2 transition-all flex items-center justify-center text-center font-bold text-lg leading-tight
                    ${
                      card.isMatched
                        ? "opacity-0 scale-90 pointer-events-none"
                        : isFailed
                          ? "bg-destructive/20 border-destructive text-destructive scale-100 shadow-none animate-pulse"
                          : isSelected
                            ? "bg-primary border-primary text-primary-foreground scale-105 rotate-2 shadow-2xl shadow-primary/40"
                            : isMyTurn
                              ? "bg-secondary/5 border-border hover:border-primary/50 hover:bg-secondary/10 cursor-pointer"
                              : "bg-secondary/2 border-border/40 opacity-70 cursor-not-allowed"
                    }`}
                >
                  {card.text}
                </button>
              );
            })}
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
