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
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center">
        <h1 className="text-4xl font-black text-amber-500 mb-2 italic uppercase tracking-tighter">Speed Cards</h1>
        <p className="text-amber-500/40 text-xs uppercase tracking-widest mb-10 font-bold">Choose your game mode</p>

        <div className="space-y-4">
          {/* Solo Mode */}
          <button
            onClick={() => {
              store.setGameMode("solo");
              onStartSolo();
            }}
            className="w-full py-6 bg-amber-500 text-[#1a1410] rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-amber-900/20 group"
          >
            <span className="block text-xl">👤 Solo Play</span>
            <span className="text-[10px] opacity-70">Train your speed alone</span>
          </button>

          <div className="flex items-center gap-4 text-amber-500/20 my-6">
            <div className="h-px bg-current flex-1" />
            <span className="text-[10px] font-bold uppercase italic">or battle</span>
            <div className="h-px bg-current flex-1" />
          </div>

          {/* Duel Mode */}
          {!showJoinInput ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  store.setGameMode("duel");
                  onCreateDuel();
                }}
                className="py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-amber-500 hover:bg-white/10 transition-colors"
              >
                Create Duel
              </button>
              <button
                onClick={() => setShowJoinInput(true)}
                className="py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-amber-500 hover:bg-white/10 transition-colors"
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
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-center uppercase text-amber-500 focus:ring-2 focus:ring-amber-500/50 outline-none"
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
      </div>
    </div>
  );
};
