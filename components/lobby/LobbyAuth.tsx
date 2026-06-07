"use client";
import { useState } from "react";
import { useAliasStore } from "@/store/useAliasStore";
import { supabase } from "@/lib/supabase";

interface LobbyAuthProps {
  gameId: string;
  gameTitle: string;
  store: any; // Using any for simplicity in this generic component
}

export const LobbyAuth = ({ gameId, gameTitle, store }: LobbyAuthProps) => {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createLobby = async () => {
    setError(null);
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const pureData = JSON.parse(JSON.stringify(store));
    delete pureData.myPlayerId;
    delete pureData.roomCode;

    const { error: supabaseError } = await supabase
      .from("lobbies")
      .insert([{ 
        code, 
        game_state: pureData,
        game_type: gameId 
      }]);
    
    if (!supabaseError) {
      store.setRoomCode(code);
    } else {
      setError("Failed to create lobby");
    }
  };

  const joinLobby = async () => {
    setError(null);
    const { data, error: supabaseError } = await supabase
      .from("lobbies")
      .select("game_state, game_type")
      .eq("code", inputCode)
      .single();

    if (supabaseError || !data) {
      setError("Room not found");
      return;
    }

    if (data.game_type !== gameId) {
      setError(`This code is for another game (${data.game_type})`);
      return;
    }

    if (data.game_state) {
      store.syncFromSupabase(data.game_state);
      store.setRoomCode(inputCode);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md backdrop-blur-xl bg-secondary/10 border border-border shadow-2xl shadow-black/40 rounded-[2.5rem] p-10 text-center">
        <h1 className="text-3xl font-black text-primary mb-2 tracking-[0.1em] uppercase italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          {gameTitle}
        </h1>
        <p className="text-primary/60 mb-10 text-sm tracking-widest uppercase">CatherineGames Platform</p>

        {error && (
          <div className="mb-6 p-3 bg-destructive/20 border border-destructive/50 rounded-xl text-destructive-foreground text-sm">
            {error}
          </div>
        )}

        <button
          onClick={createLobby}
          className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest mb-4 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all"
        >
          Create Game
        </button>

        <div className="flex items-center gap-4 mb-4 text-primary/40">
          <div className="h-px bg-primary/20 flex-1" />
          <span className="text-xs font-semibold">or</span>
          <div className="h-px bg-primary/20 flex-1" />
        </div>

        <input
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="w-full bg-secondary/10 border border-border/50 p-4 rounded-2xl text-center mb-3 uppercase text-primary placeholder-primary/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        <button
          onClick={joinLobby}
          className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest bg-secondary/5 text-primary border border-border hover:bg-secondary/10 transition-all shadow-sm"
        >
          Join Game
        </button>

        <p className="mt-8 text-xs text-primary/40 tracking-widest">
          Play with your friends in one click ✨
        </p>
      </div>
    </div>
  );
};
