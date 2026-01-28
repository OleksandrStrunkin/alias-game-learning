"use client";
import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { supabase } from "@/lib/supabase";
import { GameControls } from "./GameControls";
import { Timer } from "./Timer";
import { RoundPreparation } from "./RoundPreparation";
import { WordCard } from "./WordCard";

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
      <WordCard
        isPaused={isPaused}
        isLoading={loading}
        isMyTurn={isMyTurn}
        currentWord={store.currentWord}
        activeTeamName={activeTeam?.name}
        showHint={showHint}
        onShowHint={() => setShowHint(true)}
      />
      <GameControls onAction={handleAction} disabled={!isMyTurn || isPaused} />
    </>
  );
};
