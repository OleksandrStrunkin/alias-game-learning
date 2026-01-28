"use client";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";

interface WaitingRoomProps {
  pushUpdate: (state: any) => Promise<void>;
}

export const WaitingRoom = ({ pushUpdate }: WaitingRoomProps) => {
  const store = useGameStore();
  const [tempName, setTempName] = useState("");
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
              className="bg-white/10 border border-white/10 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-2"
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
                  setTimeout(() => pushUpdate(useGameStore.getState()), 50);
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
};
