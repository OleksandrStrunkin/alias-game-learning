import { useEffect, useState } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";
import type { SpeedCardsState } from "@/store/useSpeedCardsStore";
import { RoomCodeCopy } from "@/components/common/RoomCodeCopy";

interface SpeedCardsWaitingRoomProps {
  store: SpeedCardsState;
  playerIds: string[];
  isHost: boolean;
  loading: boolean;
  fetchWords: () => void;
  onSubmitPlayerName: (playerName: string) => Promise<void>;
  pushUpdate: () => Promise<void>;
}

export const SpeedCardsWaitingRoom = ({
  store,
  playerIds,
  isHost,
  loading,
  fetchWords,
  onSubmitPlayerName,
  pushUpdate,
}: SpeedCardsWaitingRoomProps) => {
  const currentPlayer = store.myPlayerId
    ? store.players[store.myPlayerId]
    : undefined;
  const [playerName, setPlayerName] = useState(currentPlayer?.name || "");
  const categories = ["A2", "B1", "B2"];
  const turnTime = useSpeedCardsStore((s) => s.turnTime);
  const setTurnTime = useSpeedCardsStore((s) => s.setTurnTime);

  const { roomCode } = store;

  const handleToggleCategory = async (category: string) => {
    store.toggleCategory(category);
    if (store.roomCode) {
      await pushUpdate();
    }
  };
  const isJoined = !!currentPlayer;
  const isNameDefault = currentPlayer?.name?.startsWith("Player ");

  useEffect(() => {
    setPlayerName(currentPlayer?.name || "");
  }, [currentPlayer?.name]);

  const shouldAskForName = !isJoined || isNameDefault;

  const handleSubmit = async () => {
    if (!playerName.trim()) return;
    await onSubmitPlayerName(playerName.trim());
  };

  

  return (
    <div className="w-full relative max-w-4xl backdrop-blur-xl bg-secondary/10 border border-border shadow-2xl shadow-black/40 rounded-[2.5rem] p-10 text-center">
      {store.gameMode === "duel" ? (
        <div className="space-y-6">
          <RoomCodeCopy roomCode={roomCode}/>
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="flex-1/2 bg-secondary/50 border border-border/50 p-5 rounded-sm shadow-inner mx-auto max-w-2xl">
              <h3 className="text-primary/50 text-sm font-black uppercase tracking-[0.2em] mb-4">
                Select word difficulty
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => {
                  const active = store.selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleToggleCategory(category)}
                      className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all border ${
                        active
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/40"
                          : "bg-secondary/5 border-border text-primary/50 hover:bg-secondary/10"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <h3 className="text-primary/50 text-sm font-black uppercase tracking-[0.2em] mb-2">
                  Turn time
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[10, 15, 20, 0].map((t) => {
                    const isActive =
                      t === 0 ? turnTime === null : turnTime === t;
                    return isHost ? (
                      <button
                        key={t}
                        onClick={async () => {
                          setTurnTime(t === 0 ? null : t);
                          if (store.roomCode) await pushUpdate();
                        }}
                        className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all border ${
                          isActive
                            ? "bg-primary border-primary text-primary-foreground shadow-lg"
                            : "bg-secondary/5 border-border text-primary/50 hover:bg-secondary/10"
                        }`}
                      >
                        {t === 0 ? "No limit" : `${t}s`}
                      </button>
                    ) : (
                      <div
                        key={t}
                        className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest border ${
                          isActive
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-secondary/5 border-border text-primary/50"
                        }`}
                      >
                        {t === 0 ? "No limit" : `${t}s`}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-1/2 flex-col gap-6 max-w-xl mx-auto">
              <div className="grid grid-cols-2 gap-4">
                {playerIds.map((pId, idx) => (
                  <div
                    key={pId}
                    className="bg-secondary/10 p-4 rounded-sm border border-border"
                  >
                    <div className="text-2xl mb-1">
                      {pId === store.hostId ? "👑" : "⚔️"}
                    </div>
                    <div className="text-sm font-bold">
                      {store.players[pId].name}
                    </div>
                    <div className="text-xs opacity-50 font-mono mt-1">
                      {pId === store.myPlayerId ? "You" : "Opponent"}
                    </div>
                  </div>
                ))}
                {playerIds.length < 2 && (
                  <div className="bg-secondary/5 p-4 rounded-sm border border-border/50 border-dashed flex flex-col items-center justify-center text-primary/40">
                    <div className="animate-pulse text-2xl">⏳</div>
                    <div className="text-sm font-bold mt-2">Waiting...</div>
                    <div className="text-xs tracking-wider mt-1">
                      Player 2
                    </div>
                  </div>
                )}
              </div>

              {shouldAskForName ? (
                <div className="space-y-4">
                  <div className="text-left text-sm uppercase tracking-[0.18em] text-primary/80">
                    {isJoined
                      ? "Confirm your display name before starting"
                      : "Enter your display name to join"}
                  </div>
                  <input
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !playerName.trim()}
                    className="w-full px-8 py-4 bg-primary text-primary-foreground font-bold rounded-sm hover:bg-primary/80 transition-transform disabled:opacity-50 "
                  >
                    {loading
                      ? "Saving..."
                      : isJoined
                        ? "Save name"
                        : "Join room"}
                  </button>
                </div>
              ) : playerIds.length >= 2 ? (
                isHost ? (
                  <button
                    onClick={fetchWords}
                    disabled={loading}
                    className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/80 transition-transform disabled:opacity-50"
                  >
                    {loading ? "Loading words..." : "Start Game 🎮"}
                  </button>
                ) : (
                  <div className="text-sm text-primary/60 font-semibold animate-pulse">
                    Waiting for the host to start the game...
                  </div>
                )
              ) : (
                <div className="space-y-2 text-sm text-primary/60 font-semibold">
                  <div>
                    Share the code
                    <span className="font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20 mx-2">
                      {store.roomCode}
                    </span>
                    to invite your friend!
                  </div>
                  <div className="text-xs tracking-wide uppercase text-primary/50">
                    The room is ready once a second player joins.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={fetchWords}
          disabled={loading}
          className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl transition-transform disabled:opacity-50"
        >
          {loading ? "Loading words..." : "Start Game"}
        </button>
      )}
    </div>
  );
};
