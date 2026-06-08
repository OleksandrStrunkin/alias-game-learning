"use client";
import { useState } from "react";
import { useAliasStore } from "@/store/useAliasStore";

interface WaitingRoomProps {
  pushUpdate: (state: any) => Promise<void>;
}

export const WaitingRoom = ({ pushUpdate }: WaitingRoomProps) => {
  const store = useAliasStore();
  const [tempName, setTempName] = useState("");
  const iHaveTeam = store.teams.some((t) => t.playerId === store.myPlayerId);

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md backdrop-blur-xl bg-secondary/10 border border-border shadow-2xl shadow-black/40 rounded-[2.5rem] p-10 text-center">
        <h1 className="text-3xl font-black text-primary mb-2 tracking-widest uppercase italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          Room: {store.roomCode}
        </h1>
        <p className="text-primary/60 mb-10 text-sm tracking-widest uppercase">Waiting for Players</p>

        <div className="bg-secondary/20 border border-border/50 p-6 rounded-3xl mb-8 shadow-inner">
          <h3 className="text-primary/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Select Word Sources
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {["A2", "B1", "B2", "API"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  store.toggleCategory(cat);
                  pushUpdate(useAliasStore.getState());
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-wider ${
                  store.selectedCategories.includes(cat)
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/40"
                    : "bg-secondary/5 border-border text-primary/40 hover:bg-secondary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-8 text-left">
          {store.teams.map((t, i) => (
            <div
              key={i}
              className="bg-secondary/5 border border-border p-4 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-bottom-2"
            >
              <span className="text-primary font-bold uppercase italic tracking-widest text-sm">
                {t.name}
              </span>
              <span className="text-[9px] text-primary/60 font-black tracking-[0.2em] border border-primary/20 px-2 py-1 rounded-lg">
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
              placeholder="Enter team name"
              className="w-full bg-secondary/10 border border-border p-4 rounded-2xl text-center uppercase  outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
            />
            <button
              onClick={async () => {
                if (tempName && store.myPlayerId) {
                  store.addTeam(tempName, store.myPlayerId);
                  setTempName("");
                  setTimeout(() => pushUpdate(useAliasStore.getState()), 50);
                }
              }}
              className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all"
            >
              Join Game
            </button>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
            </div>
            <p className="text-primary/40 text-[10px] font-black uppercase tracking-[0.2em]">
              Waiting for opponent...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
