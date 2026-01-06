"use client";
import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

interface GamePanelProps {
  fetchWord: () => void;
  loading: boolean;
}

export const GamePanel = ({ fetchWord, loading }: GamePanelProps) => {
  const store = useGameStore();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);

  const currentTeam = store.teams[store.currentTeamIndex];

  useEffect(() => {
    let interval: any;
    if (store.isGameStarted && timeLeft > 0 && !isPaused) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [store.isGameStarted, timeLeft, isPaused]);


  useEffect(() => {
    if (timeLeft === 0 && store.isGameStarted) {
      store.setGameState(false);
    }
  }, [timeLeft, store]);

  const handleAction = (isCorrect: boolean) => {
    if (store.currentWord) {
      store.updateScore(store.currentWord.word, isCorrect);
      fetchWord();
    }
  };

  if (!store.isGameStarted || timeLeft === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in">
        <div className="space-y-2">
          <p className="text-indigo-500 text-[10px] uppercase font-black tracking-[0.3em]">
            {timeLeft === 0 ? "Round finished" : "Ready?"}
          </p>
          <h2 className="text-5xl font-black uppercase italic text-white">
            {currentTeam?.name}
          </h2>
        </div>

        <button
          onClick={() => {
            if (timeLeft === 0) {
              store.nextTeam();
              setTimeLeft(60);
            } else {
              store.startGame();
              fetchWord();
            }
          }}
          className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all"
        >
          {timeLeft === 0 ? "Next Team" : "Start Round"}
        </button>
      </div>
    );
  }

  // Екран активної гри
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-7xl font-mono font-black text-indigo-500">
          {timeLeft}
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-[10px] bg-white/5 px-6 py-2 rounded-full font-black uppercase"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {isPaused ? (
          <div className="text-2xl uppercase tracking-[0.5em] text-white/80 font-black italic">
            Paused
          </div>
        ) : loading ? (
          <div className="animate-pulse text-indigo-500/50 uppercase text-xs tracking-widest font-black">
            Loading...
          </div>
        ) : (
          <div className="animate-in zoom-in duration-300">
            <span className="text-lg uppercase font-black tracking-[0.4em] text-indigo-500 block mb-3">
              {store.currentWord?.category}
            </span>
            <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter italic leading-tight text-white">
              {store.currentWord?.word}
            </h2>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button
          disabled={isPaused || loading}
          onClick={() => handleAction(false)}
          className="py-4 rounded-xl border border-white/5 text-white bg-rose-600/50 font-black uppercase text-md hover:bg-rose-600/60"
        >
          Skip
        </button>
        <button
          disabled={isPaused || loading}
          onClick={() => handleAction(true)}
          className="py-4 rounded-xl border-white/5 bg-green-500/50 text-white font-black uppercase text-md hover:bg-green-500/60"
        >
          Got it
        </button>
      </div>
    </>
  );
};
