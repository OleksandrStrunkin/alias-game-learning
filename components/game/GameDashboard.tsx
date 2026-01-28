"use client";
import { useGameStore } from "@/store/useGameStore";
import { GamePanel } from "./GamePanel";
import { TeamHistoryCard } from "../TeamHistoryCard";

interface GameDashboardProps {
  fetchWord: () => Promise<void>;
  loading: boolean;
  pushUpdate: (state: any) => Promise<void>;
}

export const GameDashboard = ({
  fetchWord,
  loading,
  pushUpdate,
}: GameDashboardProps) => {
  const store = useGameStore();

  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center md:bg-gradient-to-br from-[#1a1410] via-[#241a16] to-[#31241c] p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-6 h-[85vh]">
        <main className="lg:col-span-5 relative flex flex-col p-6 rounded-xl backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl shadow-black/40">
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
                        : "bg-white/5 border-white/5 text-amber-100/20 hover:bg-white/10"
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
              className="flex-1 py-3 text-[10px] font-black uppercase rounded-xl bg-white/5 text-amber-200/40 hover:text-amber-100 hover:bg-white/10 transition-all shadow-inner"
            >
              New Game
            </button>
            <button
              onClick={() => {
                store.resetGame();
                pushUpdate(useGameStore.getState());
              }}
              className="p-3 rounded-xl bg-rose-700/10 text-rose-400/50 hover:bg-rose-700/20 hover:text-rose-300 transition-all"
            >
              ✕
            </button>
          </div>
        </main>
        <aside className="grid-cols-2 gap-1 lg:col-span-7 grid md:grid-cols-2 md:gap-6 overflow-y-auto pr-1">
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
};
