"use client";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { supabase } from "@/lib/supabase";

export const LobbyAuth = () => {
  const store = useGameStore();
  const [inputCode, setInputCode] = useState("");

  const createLobby = async () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const pureData = JSON.parse(JSON.stringify(store));
    const { error } = await supabase
      .from("lobbies")
      .insert([{ code, game_state: pureData }]);
    if (!error) store.setRoomCode(code);
  };

  const joinLobby = async () => {
    const { data } = await supabase
      .from("lobbies")
      .select("game_state")
      .eq("code", inputCode)
      .single();
    if (data) {
      store.syncFromSupabase(data.game_state);
      store.setRoomCode(inputCode);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1410] via-[#241a16] to-[#31241c] p-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl shadow-black/40 rounded-[2.5rem] p-10 text-center">
        <h1 className="text-3xl font-black text-amber-400 mb-10 tracking-[0.3em] uppercase italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          Catherine Alias Online
        </h1>

        <button
          onClick={createLobby}
          className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest mb-4 bg-amber-500/90 hover:bg-amber-500 text-[#1a1410] shadow-lg shadow-amber-900/30 transition-all"
        >
          Create Game
        </button>

        <div className="flex items-center gap-4 mb-4 text-amber-200/40">
          <div className="h-px bg-amber-200/20 flex-1" />
          <span className="text-xs font-semibold">or</span>
          <div className="h-px bg-amber-200/20 flex-1" />
        </div>

        <input
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-center mb-3 uppercase text-amber-100 placeholder-amber-100/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />

        <button
          onClick={joinLobby}
          className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest bg-white/5 text-amber-200 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
        >
          Join Game
        </button>

        <p className="mt-8 text-xs text-amber-200/40 tracking-widest">
          Play with your friends in one click ✨
        </p>
      </div>
    </div>
  );
};
