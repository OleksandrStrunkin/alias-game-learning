import type { SpeedCardsState } from "@/store/useSpeedCardsStore";

interface SpeedCardsGameBoardProps {
  store: SpeedCardsState;
  isMyTurn: boolean;
  isHost: boolean;
  loading: boolean;
  fetchWords: () => void;
  handleSelectCard: (cardId: string) => Promise<void> | void;
}

export const SpeedCardsGameBoard = ({
  store,
  isMyTurn,
  isHost,
  loading,
  fetchWords,
  handleSelectCard,
}: SpeedCardsGameBoardProps) => {
  return (
    <>
      <div className="space-y-6 relative">
        {/* Turn Banner for Duel Mode */}

        {/* In-game deck controls */}
        {store.cards.some((card) => !card.isMatched) && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {["A2", "B1", "B2"].map((category) => {
                const active = store.selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => store.toggleCategory(category)}
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
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={fetchWords}
                disabled={loading || (store.gameMode === "duel" && !isHost)}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "New Deck of Words"}
              </button>
              {store.gameMode === "duel" && !isHost && (
                <p className="text-[10px] text-primary/40 uppercase tracking-widest">
                  Only the host can request a new deck.
                </p>
              )}
            </div>
          </div>
        )}

        {store.gameMode === "duel" && (
          <div
            className={`p-4 rounded-2xl border text-center font-bold tracking-wide transition-all ${
              isMyTurn
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-secondary/5 border-border text-primary/50"
            }`}
          >
            {isMyTurn ? (
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span>Your Turn! Click a card and its translation.</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm">⏳</span>
                <span>
                  Opponent's Turn (Waiting for opponent to make a move...)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress / Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(store.players).map((player) => (
            <div
              key={player.id}
              className="bg-secondary/5 p-4 rounded-2xl border border-border"
            >
              <div className="flex justify-between text-xs mb-2 uppercase font-bold tracking-widest">
                <span>
                  {player.id === store.myPlayerId
                    ? `${player.name} (You)`
                    : player.name}
                </span>
                <span>
                  {player.matches} / {player.total} pairs
                </span>
              </div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-border shadow-inner">
                <div
                  className="h-full bg-primary transition-all duration-500 shadow-primary/50"
                  style={{
                    width: `${(player.matches / (player.total || 5)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
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
                  className={`h-32 p-4 rounded-2xl border-2 transition-all flex items-center justify-center text-center font-bold text-sm leading-tight
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
                          onClick={() => store.toggleCategory(category)}
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
