import React, { useState } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

interface Props {
  onCreateDuel: () => void;
  onJoinDuel: (code: string) => void;
  onStartSolo: () => void;
}

export const SpeedCardsSetup = ({ onCreateDuel, onJoinDuel, onStartSolo }: Props) => {
  const store = useSpeedCardsStore();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [inputCode, setInputCode] = useState("");

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl shadow-black/40 rounded-[2.5rem] p-10 text-center">
        <h1 className="text-3xl font-black text-amber-400 mb-2 tracking-[0.1em] uppercase italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          Speed Cards
        </h1>
        <p className="text-amber-500/60 mb-10 text-sm tracking-widest uppercase">CatherineGames Platform</p>

        <div className="space-y-4">
          {/* Solo Mode */}
          <button
            onClick={() => {
              store.setGameMode("solo");
              onStartSolo();
            }}
            className="w-full py-5 rounded-2xl font-bold uppercase tracking-widest bg-amber-500/90 hover:bg-amber-500 text-[#1a1410] shadow-lg shadow-amber-900/30 transition-all flex flex-col items-center justify-center gap-1"
          >
            <span className="text-lg">👤 Solo Play</span>
            <span className="text-[10px] opacity-70 normal-case tracking-normal">Train your speed alone</span>
          </button>

          <div className="flex items-center gap-4 my-6 text-amber-200/40">
            <div className="h-px bg-amber-200/20 flex-1" />
            <span className="text-xs font-semibold">or battle</span>
            <div className="h-px bg-amber-200/20 flex-1" />
          </div>

          {/* Duel Mode */}
          {!showJoinInput ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  store.setGameMode("duel");
                  onCreateDuel();
                }}
                className="py-4 rounded-2xl font-bold uppercase tracking-widest bg-white/5 text-amber-200 border border-white/10 hover:bg-white/10 transition-all shadow-sm text-[10px]"
              >
                Create Duel
              </button>
              <button
                onClick={() => setShowJoinInput(true)}
                className="py-4 rounded-2xl font-bold uppercase tracking-widest bg-white/5 text-amber-200 border border-white/10 hover:bg-white/10 transition-all shadow-sm text-[10px]"
              >
                Join Duel
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-center uppercase text-amber-100 placeholder-amber-100/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowJoinInput(false)}
                  className="py-3 text-[10px] font-bold uppercase text-amber-500/50 hover:text-amber-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onJoinDuel(inputCode)}
                  className="py-3 bg-amber-500 text-[#1a1410] rounded-xl font-bold uppercase text-[10px] tracking-widest"
                >
                  Connect
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-amber-200/40 tracking-widest">
          Test your memory speed ✨
        </p>
      </div>
    </div>
  );
};
