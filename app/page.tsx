"use client";
import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";
import { TeamHistoryCard } from "@/components/TeamHistoryCard";
import { GamePanel } from "@/components/game/GamePanel";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const store = useGameStore();
  const [loading, setLoading] = useState(false);
  const [tempName, setTempName] = useState("");
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("alias_player_id");
    if (!id) {
      id = "p_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("alias_player_id", id);
    }
    store.setMyPlayerId(id);
  }, []);

  const pushUpdate = async (newState: any) => {
    if (store.roomCode) {
      const dataToSync = JSON.parse(JSON.stringify(newState));

      const { error } = await supabase
        .from("lobbies")
        .update({ game_state: dataToSync })
        .eq("code", store.roomCode);

      if (error) console.error("Update error:", error);
    }
  };

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

  useEffect(() => {
    if (!store.roomCode) return;

    const channel = supabase
      .channel(`lobby-${store.roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${store.roomCode}`,
        },
        (payload) => {
          const incomingState = payload.new.game_state;
          if (incomingState) {
            store.syncFromSupabase(incomingState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [store.roomCode]);

  const fetchWord = useCallback(async () => {
    setLoading(true);
    try {
      if (store.selectedCategories.includes("API")) {
        const res = await fetch(
          "https://www.wordgamedb.com/api/v1/words/random"
        );
        const data = await res.json();
        store.setWord(data);
      } else {
        const { data, error } = await supabase.rpc("get_random_word", {
          categories: store.selectedCategories,
        });

        if (data && data.length > 0) {
          store.setWord(data[0]);
        } else if (error) {
          console.error("RPC Error:", error);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [store]);

  if (!store.roomCode) {
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
  }

  if (store.teams.length < 2) {
    const iHaveTeam = store.teams.some((t) => t.playerId === store.myPlayerId);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1410] via-[#241a16] to-[#31241c] p-4">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl shadow-black/40 relative">
          <div className="mb-8 text-center text-amber-400 font-black text-xl tracking-[0.3em] uppercase">
            Room: {store.roomCode}
          </div>

          <h2 className="text-center text-amber-200/50 text-xs font-black uppercase tracking-[0.3em] mb-8">
            Waiting for Players
          </h2>
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-6">
            <h3 className="text-amber-400/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">
              Select Word Sources
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {["A2", "B1", "B2", "API"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    store.toggleCategory(cat);
                    pushUpdate(useGameStore.getState());
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    store.selectedCategories.includes(cat)
                      ? "bg-amber-500 border-amber-400 text-[#1a1410] shadow-lg shadow-amber-900/40"
                      : "bg-white/5 border-white/10 text-amber-200/40 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-10">
            {store.teams.map((t, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/10 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-2 shadow-sm shadow-black/30"
              >
                <span className="text-amber-300 font-black uppercase italic tracking-widest">
                  {t.name}
                </span>
                <span className="text-[10px] text-amber-100/30 font-black tracking-widest">
                  READY
                </span>
              </div>
            ))}
          </div>

          {!iHaveTeam ? (
            <div className="space-y-4">
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your team name"
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-center uppercase text-amber-100 placeholder-amber-100/40 outline-none focus:border-amber-400/60 shadow-inner"
              />
              <button
                onClick={async () => {
                  if (tempName && store.myPlayerId) {
                    store.addTeam(tempName, store.myPlayerId);
                    setTempName("");
                    setTimeout(async () => {
                      const latestState = useGameStore.getState();
                      await pushUpdate(latestState);
                    }, 50);
                  }
                }}
                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest bg-amber-500/90 hover:bg-amber-500 text-[#1a1410] shadow-lg shadow-amber-900/30 transition-all"
              >
                I'm Ready
              </button>
            </div>
          ) : (
            <div className="text-center py-4 animate-pulse text-amber-300 text-xs font-black uppercase tracking-widest">
              Wait for other player...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center md:bg-gradient-to-br from-[#1a1410] via-[#241a16] to-[#31241c] p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-6 h-[85vh]">
        <main className=" lg:col-span-5 relative flex flex-col p-6 rounded-xl backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl shadow-black/40">
          <div className="mb-4 text-xs font-black text-amber-400/60 uppercase tracking-widest">
            Room: {store.roomCode}
          </div>

          <GamePanel fetchWord={fetchWord} loading={loading} />

          <div className="mt-6 mb-4">
            <p className="text-[9px] font-black text-amber-400/30 uppercase tracking-[0.2em] mb-3 text-center">
              Change difficulty for next round
            </p>
            <div className="flex justify-center gap-1.5">
              {["A2", "B1", "B2", "API"].map((cat) => {
                const isActive = store.selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      store.toggleCategory(cat);
                      setTimeout(() => pushUpdate(useGameStore.getState()), 50);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                      isActive
                        ? "bg-amber-500/80 border-amber-400 text-[#1a1410] shadow-sm"
                        : "bg-white/5 border-white/5 text-amber-100/20 hover:bg-white/10 hover:text-amber-100/40"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto pt-4 flex gap-2">
            <button
              onClick={() => {
                store.newRound();
                pushUpdate(useGameStore.getState());
              }}
              className="flex-1 py-3 text-[10px] font-black uppercase rounded-xl 
                     bg-white/5 text-amber-200/40 hover:text-amber-100 hover:bg-white/10
                     transition-all shadow-inner"
            >
              New Game
            </button>

            <button
              onClick={() => {
                store.resetGame();
                pushUpdate(useGameStore.getState());
              }}
              className="p-3 rounded-xl bg-rose-700/10 text-rose-400/50 
                     hover:bg-rose-700/20 hover:text-rose-300 transition-all"
            >
              ✕
            </button>
          </div>
        </main>

        <aside className="grid-cols-2 gap-1 lg:col-span-7 grid md:grid-cols-2 md:gap-6">
          {store.teams.map((team, idx) => (
            <TeamHistoryCard
              key={idx}
              team={team}
              index={idx}
              isActive={idx === store.currentTeamIndex && store.isGameStarted}
            />
          ))}
        </aside>
      </div>
    </div>
  );
}
