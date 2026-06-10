import { useEffect } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

export const useSpeedCardsFailedPairTimer = (
  pushUpdate: (state?: any) => Promise<void>,
) => {
  const store = useSpeedCardsStore();

  useEffect(() => {
    if (!store.failedPair) return;

    const isActivePlayer =
      store.gameMode === "solo" || store.activePlayerId === store.myPlayerId;

    const timer = setTimeout(async () => {
      if (isActivePlayer) {
        store.clearFailedPair();
        if (store.gameMode === "duel") {
          await pushUpdate(useSpeedCardsStore.getState());
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    store.failedPair,
    store.activePlayerId,
    store.myPlayerId,
    store.gameMode,
    pushUpdate,
  ]);
};
