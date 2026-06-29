"use client";
import { useAliasStore } from "@/store/useAliasStore";
import { GamePanel } from "./GamePanel";
import { TeamHistoryCard } from "./TeamHistoryCard";
import { useSearchParams } from "next/navigation";

interface GameDashboardProps {
  fetchWord: () => Promise<void>;
  loading: boolean;
  pushUpdate: (state: any) => Promise<void>;
  leaveLobby: () => Promise<void>;
}

export const GameDashboard = ({
  fetchWord,
  loading,
  pushUpdate,
  leaveLobby,
}: GameDashboardProps) => {
  const roomCode = useAliasStore((s) => s.roomCode);
  const selectedCategories = useAliasStore((s) => s.selectedCategories);
  const teams = useAliasStore((s) => s.teams);
  const currentTeamIndex = useAliasStore((s) => s.currentTeamIndex);
  const isGameStarted = useAliasStore((s) => s.isGameStarted);

  const toggleCategory = useAliasStore((s) => s.toggleCategory);
  const newRound = useAliasStore((s) => s.newRound);

  return (
    <div className="flex flex-col items-center md:justify-center">
      <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-6 h-[85vh]">
        <main className="lg:col-span-5 relative flex flex-col p-6 rounded-xl backdrop-blur-xl bg-secondary/10 border border-border shadow-2xl shadow-black/40">
          <div className="mb-4 text-xs font-black text-primary/60 uppercase tracking-widest">
            Room: {roomCode}
          </div>

          <GamePanel fetchWord={fetchWord} loading={loading} />

          <div className="mt-6 mb-4">
            <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 text-center">
              Change difficulty for next round
            </p>
            <div className="flex justify-center gap-1.5">
              {["A2", "B1", "B2", "API"].map((cat) => {
                const isActive = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      toggleCategory(cat);
                      setTimeout(
                        () => pushUpdate(useAliasStore.getState()),
                        50,
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                      isActive
                        ? "bg-primary/80 border-primary text-primary-foreground shadow-sm"
                        : "bg-secondary/5 border-border text-primary/20 hover:bg-secondary/10"
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
                newRound();
                pushUpdate(useAliasStore.getState());
              }}
              className="flex-1 py-3 text-[10px] font-black uppercase rounded-xl bg-secondary/5 text-primary/40 hover:text-primary hover:bg-secondary/10 transition-all shadow-inner"
            >
              New Game
            </button>
            <button
              onClick={async () => {
                await leaveLobby();
              }}
              className="p-3 rounded-xl bg-destructive/10 text-destructive/50 hover:bg-destructive/20 hover:text-destructive-foreground transition-all"
            >
              ✕
            </button>
          </div>
        </main>
        <aside className="grid-cols-2 gap-1 lg:col-span-7 grid md:grid-cols-2 md:gap-6">
          {teams.map((team, idx) => (
            <TeamHistoryCard
              key={idx}
              team={team}
              index={idx}
              isActive={idx === currentTeamIndex && isGameStarted}
            />
          ))}
        </aside>
      </div>
    </div>
  );
};
