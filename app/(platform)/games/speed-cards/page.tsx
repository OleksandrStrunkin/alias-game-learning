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

  useEffect(() => {
    if (store.isGameStarted && store.gameMode === "duel") {
      pushUpdate();
    }
  }, [store.players, pushUpdate, store.isGameStarted, store.gameMode]);

  useEffect(() => {
    let id = localStorage.getItem("alias_player_id");
    if (!id) {
      id = "p_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("alias_player_id", id);
    }
    store.setMyPlayerId(id);
  }, []);

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
      }
    } finally {
      setLoading(false);
    }
  }, [store]);

  const handleCreateDuel = async () => {
    setError(null);
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const { error: supabaseError } = await supabase
      .from("lobbies")
      .insert([{ 
        code, 
        game_state: { isGameStarted: false, players: {}, cards: [] },
        game_type: "speed-cards" 
      }]);
    
    if (!supabaseError) {
      store.setRoomCode(code);
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

    store.syncFromSupabase(data.game_state);
    store.setRoomCode(code);
  };

  const handleStartSolo = () => {
    fetchWords();
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

  return (
    <div className="max-w-4xl mx-auto p-6 text-amber-500">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold italic uppercase tracking-tighter">Speed Cards</h1>
          <p className="text-[10px] text-amber-500/40 font-bold uppercase tracking-widest">
            Mode: {store.gameMode === "solo" ? "👤 Solo" : "⚔️ Duel"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => store.resetGame()}
            className="text-xs uppercase font-bold border border-amber-500/20 px-3 py-1 rounded-lg hover:bg-amber-500/10 transition-colors"
          >
            Quit 🚪
          </button>
          {store.roomCode && (
            <div className="text-sm font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Room: {store.roomCode}
            </div>
          )}
        </div>
      </div>

      {!store.isGameStarted ? (
        <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10 border-dashed">
          <button
            onClick={fetchWords}
            disabled={loading}
            className="px-8 py-4 bg-amber-500 text-[#1a1410] font-bold rounded-2xl hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Loading words..." : "Start Game"}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(store.players).map((player) => (
              <div key={player.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs mb-2 uppercase font-bold tracking-widest">
                  <span>{player.id === store.myPlayerId ? "You" : "Opponent"}</span>
                  <span>{player.matches} / {player.total} pairs</span>
                </div>
                <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    style={{ width: `${(player.matches / player.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {store.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => !card.isMatched && store.selectCard(card.id)}
                disabled={card.isMatched}
                className={`h-32 p-4 rounded-2xl border-2 transition-all flex items-center justify-center text-center font-bold text-sm leading-tight
                  ${card.isMatched 
                    ? "opacity-0 scale-90 pointer-events-none" 
                    : store.selectedCardId === card.id
                      ? "bg-amber-500 border-amber-300 text-[#1a1410] scale-105 rotate-2 shadow-2xl shadow-amber-500/40"
                      : "bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10"
                  }`}
              >
                {card.text}
              </button>
            ))}
          </div>

          {store.cards.every(c => c.isMatched) && (
            <div className="text-center py-10 animate-bounce">
              <h2 className="text-4xl font-black text-amber-500 mb-4 italic uppercase">Victory! ✨</h2>
              <button
                onClick={fetchWords}
                className="text-amber-500 hover:underline font-bold"
              >
                Play Again?
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
