"use client";
import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";
import { TeamHistoryCard } from "@/components/TeamHistoryCard";
import { GamePanel } from "@/components/GamePanel";

export default function Home() {
  const store = useGameStore();
  const [loading, setLoading] = useState(false);
  const [tempName, setTempName] = useState("");

  const fetchWord = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("https://www.wordgamedb.com/api/v1/words/random");
      const data = await res.json();
      store.setWord(data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    if (store.isGameStarted && !store.currentWord && !loading) {
      fetchWord();
    }
  }, [store.isGameStarted, store.currentWord, fetchWord, loading]);

  if (store.teams.length < 2) {
    return (
      <div className="min-h-screen bg-[#6a8c96] flex flex-col items-center justify-start pt-32 p-4 text-white font-sans">
        <div className="w-full max-w-md bg-[#111114]/80 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <h1 className="text-xl font-black tracking-[0.5em] text-center text-indigo-500 mb-10 uppercase italic">
            Alias with Cathrine
          </h1>
          <div className="space-y-3 mb-8">
            {store.teams.map((t, i) => (
              <div
                key={i}
                className="bg-white/5 p-4 rounded-2xl border border-white/5 uppercase font-bold text-xs text-indigo-300 flex justify-between"
              >
                <span>{t.name}</span>
                <span className="text-white/20">Team {i + 1}</span>
              </div>
            ))}
          </div>
          <input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="TYPE TEAM NAME + ENTER"
            className="w-full bg-transparent border-b border-white/10 p-4 text-center text-xl uppercase tracking-widest focus:border-indigo-500 outline-none transition-all text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && tempName) {
                store.addTeam(tempName);
                setTempName("");
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1D546D] text-white/80 flex flex-col items-center justify-start pt-8 p-4">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[80vh]">
        <main className="lg:col-span-5 bg-[#111114]/80 border border-white/5 rounded-2xl p-8 flex flex-col h-full max-h-150 shadow-2xl relative">
          <GamePanel
            key={store.currentTeamIndex}
            fetchWord={fetchWord}
            loading={loading}
          />
          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={store.newRound}
                className="group flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300"
              >
                <span className="text-indigo-500/40 group-hover:text-indigo-400 transition-colors">
                  ↺
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors">
                  New Game
                </span>
              </button>
              <button
                onClick={store.resetGame}
                className="group flex items-center justify-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-300"
                title="Reset All"
              >
                <span className="text-rose-500/30 group-hover:text-rose-400 transition-colors">
                  ✕
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 group-hover:text-rose-500 ml-2">
                  Reset All
                </span>
              </button>
            </div>
            <div className="flex justify-center gap-1 mt-4 opacity-20">
              <div className="h-1 w-1 rounded-full bg-white/20"></div>
              <div className="h-1 w-8 rounded-full bg-indigo-500/40"></div>
              <div className="h-1 w-1 rounded-full bg-white/20"></div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {store.teams.slice(0, 2).map((team, idx) => (
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
