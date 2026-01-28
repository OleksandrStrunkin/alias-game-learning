import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

export const useGameTimer = (pushUpdate: (state: any) => void) => {
  const store = useGameStore();
  const [timeLeft, setTimeLeft] = useState(store.roundDuration);

  const activeTeam = store.teams[store.currentTeamIndex];
  const isMyTurn = activeTeam?.playerId === store.myPlayerId;

  useEffect(() => {
    if (!store.isGameStarted) {
      setTimeLeft(store.roundDuration);
      return;
    }

    if (store.isPaused && store.timeLeftOnPause !== null) {
      setTimeLeft(Math.ceil(store.timeLeftOnPause / 1000));
      return;
    }

    if (!store.roundEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.ceil((store.roundEndTime! - now) / 1000),
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
    store.isPaused,
    store.isOvertime,
    isMyTurn,
  ]);

  return { timeLeft, isMyTurn, activeTeam };
};
