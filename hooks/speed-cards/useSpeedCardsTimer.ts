import { useEffect, useRef, useState } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

export const useSpeedCardsTimer = (
  pushUpdate: (state?: any) => Promise<void>,
) => {
  const store = useSpeedCardsStore();
  const [timers, setTimers] = useState<
    Record<string, { remaining: number | null; percent: number | null }>
  >({});
  const prevActiveRef = useRef<string | null | undefined>(store.activePlayerId);

  useEffect(() => {
    const isHost =
      store.myPlayerId && store.hostId && store.myPlayerId === store.hostId;

    // if active player changed and we have a turn duration, reset the turn start (host only)
    if (
      store.gameMode === "duel" &&
      store.turnTime &&
      prevActiveRef.current &&
      prevActiveRef.current !== store.activePlayerId
    ) {
      if (isHost) {
        store.setTurnStartedAt(Date.now());
        pushUpdate(useSpeedCardsStore.getState()).catch((e) =>
          console.error("Failed to push turnStartedAt reset", e),
        );
      }
    }
    prevActiveRef.current = store.activePlayerId;

    const computeTimers = () => {
      const result: Record<
        string,
        { remaining: number | null; percent: number | null }
      > = {};
      const isGameOver =
        store.cards.length > 0 && store.cards.every((card) => card.isMatched);
      const now = Date.now();
      const tt = store.turnTime;
      const ts = store.turnStartedAt;

      Object.keys(store.players).forEach((pId) => {
        if (isGameOver) {
          result[pId] = { remaining: 0, percent: 0 };
          return;
        }

        if (!tt) {
          result[pId] = { remaining: null, percent: null };
          return;
        }

        if (!ts) {
          if (pId === store.activePlayerId) {
            result[pId] = { remaining: tt, percent: 100 };
          } else {
            result[pId] = { remaining: 0, percent: 0 };
          }
          return;
        }

        if (pId === store.activePlayerId) {
          const end = ts + tt * 1000;
          const remaining = Math.max(0, Math.ceil((end - now) / 1000));
          const percent = Math.max(
            0,
            Math.min(100, Math.round((remaining / tt) * 100)),
          );
          result[pId] = { remaining, percent };
        } else {
          result[pId] = { remaining: 0, percent: 0 };
        }
      });

      setTimers(result);
      return result;
    };

    computeTimers();
    const isGameOver =
      store.cards.length > 0 && store.cards.every((card) => card.isMatched);

    if (isGameOver) {
      return () => undefined;
    }

    const interval = setInterval(async () => {
      const current = computeTimers();

      // if active player's timer expired, host advances turn
      const activeId = store.activePlayerId;
      if (activeId && store.gameMode === "duel" && store.turnTime) {
        const activeTimer = current[activeId];
        if (activeTimer && activeTimer.remaining === 0) {
          const isHostNow =
            store.myPlayerId &&
            store.hostId &&
            store.myPlayerId === store.hostId;
          if (!isHostNow) return;

          const playerIds = Object.keys(store.players);
          if (playerIds.length > 1 && store.activePlayerId) {
            const currentIndex = playerIds.indexOf(store.activePlayerId);
            const nextIndex = (currentIndex + 1) % playerIds.length;
            const nextId = playerIds[nextIndex];
            store.setActivePlayer(nextId);
            store.setTurnStartedAt(Date.now());
            try {
              await pushUpdate(useSpeedCardsStore.getState());
            } catch (e) {
              console.error("Failed to push turn change", e);
            }
          }
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [
    store.turnTime,
    store.turnStartedAt,
    store.gameMode,
    store.activePlayerId,
    store.cards,
    store.players,
    store.myPlayerId,
    store.hostId,
    pushUpdate,
  ]);

  return { timers };
};
