"use client";
import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { supabase } from "@/lib/supabase";
import { GameControls } from "./GameControls";
import { Timer } from "./Timer";
import { RoundPreparation } from "./RoundPreparation";

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

     if (remaining === 0 && isMyTurn && !store.isOvertime) {
       store.setOvertime(true);
       pushUpdate(useGameStore.getState());
       clearInterval(interval);
     }
   }, 500);

   return () => clearInterval(interval);
 }, [
   store.isGameStarted,
   store.roundEndTime,
   isPaused,
   store.timeLeftOnPause,
   isMyTurn,
   store.isOvertime,
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

      if (store.isOvertime) {
        store.nextTeam();
        await pushUpdate(useGameStore.getState());
      } else {
        await fetchWord();
        await pushUpdate();
      }
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

  if (!store.isGameStarted && !store.isOvertime) {
    return (
      <RoundPreparation 
        roundDuration={store.roundDuration}
        timeLeft={timeLeft}
        activeTeamName={activeTeam?.name}
        isMyTurn={isMyTurn}
        onStart={handleStart}
        onDurationChange={(val) => store.setRoundDuration(val)}
        onDurationSync={() => pushUpdate()}
      />
    );
  }


  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Timer timeLeft={timeLeft} isOvertime={store.isOvertime} />
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
      <GameControls onAction={handleAction} disabled={!isMyTurn || isPaused} />
    </>
  );
};
