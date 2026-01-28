"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { useGameStore } from "@/store/useGameStore";
import { useGameTimer } from "@/hooks/useGameTimer";

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
  const [showHint, setShowHint] = useState(false);

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

  const { timeLeft, isMyTurn, activeTeam } = useGameTimer(pushUpdate);

  useEffect(() => {
    setShowHint(false);
  }, [store.currentWord]);

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
