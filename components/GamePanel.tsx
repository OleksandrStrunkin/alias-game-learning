"use client";
import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { supabase } from "@/lib/supabase";

interface GamePanelProps {
  fetchWord: () => void;
  loading: boolean;
}

export const GamePanel = ({ fetchWord, loading }: GamePanelProps) => {
  const store = useGameStore();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);

  const activeTeam = store.teams[store.currentTeamIndex];
  const isMyTurn = activeTeam?.playerId === store.myPlayerId;

  const pushUpdate = async (manualState?: any) => {
    if (!store.roomCode) return;
    const stateToPush = manualState || useGameStore.getState();
    const pureData = JSON.parse(JSON.stringify(stateToPush));
    await supabase
      .from("lobbies")
      .update({ game_state: pureData })
      .eq("code", store.roomCode);
  };

  useEffect(() => {
    if (!store.isGameStarted || !store.roundEndTime || isPaused) {
      if (!store.isGameStarted) setTimeLeft(60);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.ceil((store.roundEndTime! - now) / 1000)
      );
      setTimeLeft(remaining);

      if (remaining === 0 && isMyTurn) {
        clearInterval(interval);

        const nextIndex = (store.currentTeamIndex + 1) % store.teams.length;
        store.nextTeam();

        const updatedState = {
          ...useGameStore.getState(),
          currentTeamIndex: nextIndex,
          isGameStarted: false,
          currentWord: null,
          roundEndTime: null,
        };

        pushUpdate(updatedState);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [store.isGameStarted, store.roundEndTime, isPaused, isMyTurn]);

  useEffect(() => {
    const activeTeam = store.teams[store.currentTeamIndex];
    const isNowMyTurn = activeTeam?.playerId === store.myPlayerId;

    if (isNowMyTurn && !store.isGameStarted) {
      setTimeLeft(60);
    }
  }, [store.currentTeamIndex, store.teams.length, store.isGameStarted]);

  const handleStart = async () => {
    const endTime = Date.now() + 60000;
    store.startGame(endTime);
    await fetchWord();
    await pushUpdate();
  };

  const handleAction = async (isCorrect: boolean) => {
    if (store.currentWord && isMyTurn) {
      store.updateScore(store.currentWord.word, isCorrect);
      await fetchWord();
      await pushUpdate();
    }
  };

  if (!store.isGameStarted || timeLeft === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in">
        <div className="space-y-2">
          <p className="text-amber-400 text-[10px] uppercase font-black tracking-[0.3em]">
            {timeLeft === 0 ? "Round finished" : "Ready?"}
          </p>

          <h2 className="text-5xl font-black uppercase italic text-amber-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
            {activeTeam?.name}
          </h2>

          {!isMyTurn && store.teams.length > 0 && (
            <p className="text-amber-200/30 text-[10px] uppercase tracking-widest">
              Waiting for your turn...
            </p>
          )}
        </div>

        <button
          disabled={!isMyTurn && store.teams.length > 0}
          onClick={handleStart}
          className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest
                   bg-amber-500/90 text-[#1a1410]
                   hover:bg-amber-500 shadow-lg shadow-amber-900/30
                   transition-all hover:scale-105
                   disabled:opacity-20 disabled:hover:scale-100"
        >
          {timeLeft === 0 ? "Next Team" : "Start Round"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-7xl font-mono font-black text-amber-400 drop-shadow-[0_1px_3px_rgba(255,191,0,0.2)]">
          {timeLeft}
        </div>
        <button
          disabled={!isMyTurn}
          onClick={() => setIsPaused(!isPaused)}
          className="text-[10px] px-6 py-2 rounded-full font-black uppercase 
                   bg-white/5 text-amber-100/40 hover:text-amber-100 
                   hover:bg-white/10 transition-all disabled:hidden"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {isPaused ? (
          <div className="text-2xl uppercase tracking-[0.5em] text-amber-200/60 font-black italic">
            Paused
          </div>
        ) : loading ? (
          <div className="animate-pulse text-amber-400/50 uppercase text-xs tracking-widest font-black">
            Loading...
          </div>
        ) : isMyTurn ? (
          <div className="animate-in zoom-in duration-300">
            <span className="text-lg uppercase font-black tracking-[0.4em] text-amber-400 block mb-3">
              {store.currentWord?.category}
            </span>
            <h2 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-tight text-amber-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              {store.currentWord?.word}
            </h2>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 text-amber-100/40 uppercase tracking-[0.4em] font-black italic">
            Player turn: {activeTeam?.name}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button
          disabled={!isMyTurn || isPaused}
          onClick={() => handleAction(false)}
          className="py-4 rounded-xl border border-white/10 
                   text-amber-50 bg-rose-700/40 
                   font-black uppercase text-md tracking-widest
                   hover:bg-rose-700/60 transition-all disabled:opacity-20"
        >
          Skip
        </button>
        <button
          disabled={!isMyTurn || isPaused}
          onClick={() => handleAction(true)}
          className="py-4 rounded-xl border border-white/10 
                   bg-emerald-600/50 text-amber-50 
                   font-black uppercase text-md tracking-widest
                   hover:bg-emerald-600 transition-all disabled:opacity-20"
        >
          Got it
        </button>
      </div>
    </>
  );
};
