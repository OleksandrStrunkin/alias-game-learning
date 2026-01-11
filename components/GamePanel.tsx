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
  const [timeLeft, setTimeLeft] = useState(store.roundDuration);
  const [showHint, setShowHint] = useState(false);

  const activeTeam = store.teams[store.currentTeamIndex];
  const isMyTurn = activeTeam?.playerId === store.myPlayerId;
  const isPaused = store.isPaused;

const pushUpdate = async (manualState?: any) => {
  if (!store.roomCode) return;
  const stateToPush = manualState || useGameStore.getState();
  const pureData = JSON.parse(JSON.stringify(stateToPush));
  delete pureData.myPlayerId;

  await supabase
    .from("lobbies")
    .update({ game_state: pureData })
    .eq("code", store.roomCode);
};

  useEffect(() => {
    setShowHint(false);
  }, [store.currentWord]);

 
 useEffect(() => {
   if (!store.isGameStarted) {
     setTimeLeft(store.roundDuration);
     return;
   }
   if (isPaused) {
     if (store.timeLeftOnPause !== null) {
       setTimeLeft(Math.ceil(store.timeLeftOnPause / 1000));
     }
     return;
   }
   if (!store.roundEndTime) return;

   const interval = setInterval(() => {
     const now = Date.now();
     const remaining = Math.max(
       0,
       Math.ceil((store.roundEndTime! - now) / 1000)
     );
     setTimeLeft(remaining);

     if (remaining === 0 && isMyTurn) {
       clearInterval(interval);
       store.nextTeam();
       pushUpdate(useGameStore.getState());
     }
   }, 500);

   return () => clearInterval(interval);
 }, [
   store.isGameStarted,
   store.roundEndTime,
   isPaused,
   store.timeLeftOnPause,
   isMyTurn,
 ]);


  const handleStart = async () => {
    await fetchWord();
    const endTime = Date.now() + store.roundDuration * 1000;
    store.startGame(endTime);
    await pushUpdate(useGameStore.getState());
  };

  const handleAction = async (isCorrect: boolean) => {
    if (store.currentWord && isMyTurn) {
      store.updateScore(store.currentWord.word, isCorrect);
      await fetchWord();
      await pushUpdate();
    }
  };

  const handlePause = async () => {
    if (store.isPaused) {
      store.resumeRound();
    } else {
      store.pauseRound();
    }

    const latestState = useGameStore.getState();
    await pushUpdate(latestState);
  };

  if (!store.isGameStarted || timeLeft === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in min-h-[300px] lg:min-h-[350px]">
        {timeLeft !== 0 && (
          <div className="w-full max-w-xs p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[10px] font-black text-amber-400/50 uppercase tracking-[0.2em] mb-4">
              Round Duration:{" "}
              <span className="text-amber-400 text-sm">
                {store.roundDuration}s
              </span>
            </p>
            <input
              type="range"
              min="60"
              max="180"
              step="10"
              disabled={!isMyTurn && store.teams.length > 0}
              value={store.roundDuration}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                store.setRoundDuration(val);
              }}
              onMouseUp={() => pushUpdate()}
              onTouchEnd={() => pushUpdate()}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        )}

        <div className="space-y-2">
          <p className="text-amber-400 text-md uppercase font-black tracking-[0.3em]">
            {timeLeft === 0 ? "Round finished" : "Ready?"}
          </p>
          <h2 className="text-5xl font-black uppercase italic text-amber-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
            {activeTeam?.name}
          </h2>
        </div>

        <button
          disabled={!isMyTurn && store.teams.length > 0}
          onClick={handleStart}
          className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest bg-amber-500/90 text-[#1a1410] hover:bg-amber-500 shadow-lg shadow-amber-900/30 transition-all hover:scale-105 disabled:opacity-20"
        >
          {timeLeft === 0 ? "Next Team" : "Start Round"}
        </button>
      </div>
    );
  }


  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-6xl font-mono font-black text-amber-400 drop-shadow-[0_1px_3px_rgba(255,191,0,0.2)]">
          {timeLeft}
        </div>
        <button
          disabled={!isMyTurn}
          onClick={handlePause}
          className="text-sm px-6 py-4 rounded-full font-black uppercase bg-white/5 text-amber-100/40 hover:text-amber-100 hover:bg-white/10 transition-all"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 min-h-[220px] lg:min-h-[350px] relative">
        {isPaused ? (
          <div className="text-2xl uppercase tracking-[0.5em] text-amber-200/60 font-black italic animate-in fade-in duration-300">
            Paused
          </div>
        ) : loading ? (
          <div className="animate-pulse text-amber-400/50 uppercase text-xs tracking-widest font-black">
            Loading...
          </div>
        ) : isMyTurn ? (
          <div className="animate-in zoom-in duration-300 flex flex-col items-center">
            <span className="text-lg uppercase font-black tracking-[0.4em] text-amber-400 block h-7 mb-3">
              {store.currentWord?.category || " "}
            </span>
            <div className="min-h-[100px] flex items-center justify-center max-w-[280px] lg:max-w-none">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-tight text-amber-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                {store.currentWord?.word}
              </h2>
                </div>
                
            <div className="h-[60px] mt-4 flex items-center justify-center">
              {store.currentWord?.hint ? (
                !showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/30 hover:text-amber-400 transition-colors py-2 px-4 border border-white/5 rounded-full bg-white/5"
                  >
                    Show Translate
                  </button>
                ) : (
                  <p className="text-xl font-medium italic text-amber-400/80 animate-in fade-in slide-in-from-top-1 duration-300">
                    {store.currentWord.hint}
                  </p>
                )
              ) : (
                <span className="text-[10px] text-white/5 uppercase tracking-widest">
                  No hint available
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 text-amber-100/40 uppercase tracking-[0.4em] font-black italic">
            Player turn: <br /> {activeTeam?.name}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button
          disabled={!isMyTurn || isPaused}
          onClick={() => handleAction(false)}
          className="py-4 rounded-xl border border-white/10 text-amber-50 bg-rose-700/40 font-black uppercase text-md tracking-widest hover:bg-rose-700/60 transition-all disabled:opacity-20"
        >
          Skip
        </button>
        <button
          disabled={!isMyTurn || isPaused}
          onClick={() => handleAction(true)}
          className="py-4 rounded-xl border border-white/10 bg-emerald-600/50 text-amber-50 font-black uppercase text-md tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-20"
        >
          Got it
        </button>
      </div>
    </>
  );
};
