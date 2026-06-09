import type { SpeedCardsState } from "@/store/useSpeedCardsStore";

interface SpeedCardsWaitingRoomProps {
  store: SpeedCardsState;
  playerIds: string[];
  isHost: boolean;
  loading: boolean;
  fetchWords: () => void;
}

export const SpeedCardsWaitingRoom = ({
  store,
  playerIds,
  isHost,
  loading,
  fetchWords,
}: SpeedCardsWaitingRoomProps) => {
  return (
    <div className="text-center py-16 bg-secondary/5 rounded-4xl border border-border border-dashed px-6">
      {store.gameMode === "duel" ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider">
            Waiting Room
          </h2>
          <div className="flex justify-center gap-8 max-w-md mx-auto">
            {playerIds.map((pId, idx) => (
              <div
                key={pId}
                className="bg-secondary/10 p-4 rounded-2xl border border-border flex-1"
              >
                <div className="text-2xl mb-1">{idx === 0 ? "👑" : "⚔️"}</div>
                <div className="text-sm font-bold">
                  {store.players[pId].name}
                </div>
                <div className="text-[9px] opacity-50 font-mono mt-1">
                  {pId === store.myPlayerId ? "You" : "Opponent"}
                </div>
              </div>
            ))}
            {playerIds.length < 2 && (
              <div className="bg-secondary/5 p-4 rounded-2xl border border-border/50 border-dashed flex-1 flex flex-col items-center justify-center text-primary/40">
                <div className="animate-pulse text-lg">⏳</div>
                <div className="text-xs font-bold mt-2">Waiting...</div>
                <div className="text-[8px] uppercase tracking-wider mt-1">
                  Player 2
                </div>
              </div>
            )}
          </div>

          {playerIds.length >= 2 ? (
            isHost ? (
              <button
                onClick={fetchWords}
                disabled={loading}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-primary/30"
              >
                {loading ? "Loading words..." : "Start Game 🎮"}
              </button>
            ) : (
              <div className="text-sm text-primary/60 font-semibold animate-pulse">
                Waiting for the host to start the game...
              </div>
            )
          ) : (
            <div className="text-sm text-primary/60 font-semibold">
              Share the code{" "}
              <span className="font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {store.roomCode}
              </span>{" "}
              to invite your friend!
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={fetchWords}
          disabled={loading}
          className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:scale-105 transition-transform disabled:opacity-50"
        >
          {loading ? "Loading words..." : "Start Game"}
        </button>
      )}
    </div>
  );
};
