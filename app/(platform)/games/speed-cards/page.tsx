"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";
import { SpeedCardsSetup } from "@/components/game/speed-cards/SpeedCardsSetup";
import { useSpeedCardsSync } from "@/hooks/useSpeedCardsSync";

export default function SpeedCardsPage() {
  const store = useSpeedCardsStore();
  const { pushUpdate } = useSpeedCardsSync();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize My Player ID
  useEffect(() => {
    let id = localStorage.getItem("alias_player_id");
    if (!id) {
      id = "p_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("alias_player_id", id);
    }
    store.setMyPlayerId(id);
  }, []);

  // Handle Mismatch Timer (Failed Pairs)
  useEffect(() => {
    if (store.failedPair) {
      // Only the active player (or local player in solo) controls the timer to trigger the turn switch
      const isActivePlayer = store.gameMode === "solo" || store.activePlayerId === store.myPlayerId;
      
      const timer = setTimeout(async () => {
        if (isActivePlayer) {
          store.clearFailedPair();
          if (store.gameMode === "duel") {
            await pushUpdate(useSpeedCardsStore.getState());
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [store.failedPair, store.activePlayerId, store.myPlayerId, store.gameMode, pushUpdate]);

  // Fetch words and start the game
  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("words")
        .select("word, hint")
        .in("category", ["A2", "B1"])
        .limit(30);

      if (data) {
        const shuffledWords = data.sort(() => Math.random() - 0.5).slice(0, 5);
        store.initGame(shuffledWords);
        if (store.gameMode === "duel") {
          await pushUpdate(useSpeedCardsStore.getState());
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch words");
    } finally {
      setLoading(false);
    }
  }, [store, pushUpdate]);

  const handleCreateDuel = async () => {
    setError(null);
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const myId = localStorage.getItem("alias_player_id") || "p_host";
    
    const initialPlayers = {
      [myId]: { id: myId, name: "Player 1", matches: 0, total: 0 }
    };

    const initialGameState = {
      isGameStarted: false,
      players: initialPlayers,
      cards: [],
      activePlayerId: myId,
      failedPair: null,
      winnerId: null,
      selectedCardId: null,
      gameMode: "duel"
    };
    
    const { error: supabaseError } = await supabase
      .from("lobbies")
      .insert([{ 
        code, 
        game_state: initialGameState,
        game_type: "speed-cards" 
      }]);
    
    if (!supabaseError) {
      store.syncFromSupabase(initialGameState);
      store.setRoomCode(code);
      store.setGameMode("duel");
    } else {
      setError("Failed to create room");
    }
  };

  const handleJoinDuel = async (code: string) => {
    setError(null);
    const { data, error: supabaseError } = await supabase
      .from("lobbies")
      .select("game_state, game_type")
      .eq("code", code)
      .single();

    if (supabaseError || !data || data.game_type !== "speed-cards") {
      setError("Room not found or wrong game type");
      return;
    }

    const myId = store.myPlayerId || "local";
    const currentGameState = data.game_state || {};
    const existingPlayers = currentGameState.players || {};

    const updatedPlayers = {
      ...existingPlayers,
      [myId]: { id: myId, name: "Player 2", matches: 0, total: 0 }
    };

    const updatedGameState = {
      ...currentGameState,
      players: updatedPlayers,
      gameMode: "duel"
    };

    const { error: updateError } = await supabase
      .from("lobbies")
      .update({ game_state: updatedGameState })
      .eq("code", code);

    if (updateError) {
      setError("Failed to join room");
      return;
    }

    store.syncFromSupabase(updatedGameState);
    store.setRoomCode(code);
    store.setGameMode("duel");
  };

  const handleStartSolo = () => {
    fetchWords();
  };

  const handleSelectCard = async (cardId: string) => {
    store.selectCard(cardId);
    if (store.gameMode === "duel") {
      await pushUpdate(useSpeedCardsStore.getState());
    }
  };

  if (!store.gameMode && !store.roomCode) {
    return (
      <SpeedCardsSetup 
        onCreateDuel={handleCreateDuel}
        onJoinDuel={handleJoinDuel}
        onStartSolo={handleStartSolo}
      />
    );
  }

  // Check if current user is the host/creator (the first player in the lobby)
  const playerIds = Object.keys(store.players);
  const isHost = playerIds.length > 0 && playerIds[0] === store.myPlayerId;
  const isMyTurn = store.gameMode === "solo" || store.activePlayerId === store.myPlayerId;

  return (
    <div className="max-w-4xl mx-auto p-6 text-primary">
      {error && (
        <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded-xl text-destructive-foreground text-xs text-center font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold italic uppercase tracking-tighter">Speed Cards</h1>
          <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">
            Mode: {store.gameMode === "solo" ? "👤 Solo" : "⚔️ Duel"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => store.resetGame()}
            className="text-xs uppercase font-bold border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
          >
            Quit 🚪
          </button>
          {store.roomCode && (
            <div className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Room: {store.roomCode}
            </div>
          )}
        </div>
      </div>

      {/* Lobby waiting room or Active Game screen */}
      {!store.isGameStarted ? (
        <div className="text-center py-16 bg-secondary/5 rounded-4xl border border-border border-dashed px-6">
          {store.gameMode === "duel" ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider">Waiting Room</h2>
              <div className="flex justify-center gap-8 max-w-md mx-auto">
                {playerIds.map((pId, idx) => (
                  <div key={pId} className="bg-secondary/10 p-4 rounded-2xl border border-border flex-1">
                    <div className="text-2xl mb-1">{idx === 0 ? "👑" : "⚔️"}</div>
                    <div className="text-sm font-bold">{store.players[pId].name}</div>
                    <div className="text-[9px] opacity-50 font-mono mt-1">{pId === store.myPlayerId ? "You" : "Opponent"}</div>
                  </div>
                ))}
                {playerIds.length < 2 && (
                  <div className="bg-secondary/5 p-4 rounded-2xl border border-border/50 border-dashed flex-1 flex flex-col items-center justify-center text-primary/40">
                    <div className="animate-pulse text-lg">⏳</div>
                    <div className="text-xs font-bold mt-2">Waiting...</div>
                    <div className="text-[8px] uppercase tracking-wider mt-1">Player 2</div>
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
                  Share the code <span className="font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{store.roomCode}</span> to invite your friend!
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
      ) : (
        <div className="space-y-6">
          {/* Turn Banner for Duel Mode */}
          {store.gameMode === "duel" && (
            <div className={`p-4 rounded-2xl border text-center font-bold tracking-wide transition-all ${
              isMyTurn 
                ? "bg-primary/10 border-primary/40 text-primary" 
                : "bg-secondary/5 border-border text-primary/50"
            }`}>
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
                  <span>Opponent's Turn (Waiting for opponent to make a move...)</span>
                </div>
              )}
            </div>
          )}

          {/* Progress / Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(store.players).map((player) => (
              <div key={player.id} className="bg-secondary/5 p-4 rounded-2xl border border-border">
                <div className="flex justify-between text-xs mb-2 uppercase font-bold tracking-widest">
                  <span>{player.id === store.myPlayerId ? `${player.name} (You)` : player.name}</span>
                  <span>{player.matches} / {player.total} pairs</span>
                </div>
                <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-border shadow-inner">
                  <div 
                    className="h-full bg-primary transition-all duration-500 shadow-primary/50"
                    style={{ width: `${(player.matches / (player.total || 5)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cards Grid */}
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
                    ${card.isMatched 
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

          {/* Winner banner / Game Over */}
          {store.cards.length > 0 && store.cards.every(c => c.isMatched) && (
            <div className="text-center py-10 bg-secondary/5 border border-border rounded-3xl mt-8 animate-bounce">
              {store.gameMode === "duel" ? (
                store.winnerId === store.myPlayerId ? (
                  <div>
                    <h2 className="text-4xl font-black text-amber-500 mb-4 italic uppercase">Victory! 🏆</h2>
                    <p className="text-sm font-semibold mb-6">You won the match by matching more pairs!</p>
                  </div>
                ) : store.winnerId === "draw" ? (
                  <div>
                    <h2 className="text-4xl font-black text-primary mb-4 italic uppercase">Draw! 🤝</h2>
                    <p className="text-sm font-semibold mb-6">Both players matched equal number of pairs!</p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-4xl font-black text-primary/60 mb-4 italic uppercase">Game Over ⚔️</h2>
                    <p className="text-sm font-semibold mb-6">Opponent matched more pairs. Better luck next time!</p>
                  </div>
                )
              ) : (
                <div>
                  <h2 className="text-4xl font-black text-primary mb-4 italic uppercase">Completed! ✨</h2>
                  <p className="text-sm font-semibold mb-6">You successfully matched all pairs!</p>
                </div>
              )}
              
              {/* Play Again button (only host can trigger in duel mode) */}
              {store.gameMode === "duel" ? (
                isHost ? (
                  <button
                    onClick={fetchWords}
                    disabled={loading}
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    {loading ? "Resetting..." : "Play Again 🔄"}
                  </button>
                ) : (
                  <p className="text-xs text-primary/40 uppercase tracking-widest font-bold">Waiting for the host to restart the game...</p>
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
      )}
    </div>
  );
}

