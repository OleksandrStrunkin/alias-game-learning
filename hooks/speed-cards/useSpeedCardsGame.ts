import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

interface UseSpeedCardsGameOptions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  pushUpdate: (state?: any) => Promise<void>;
}

export const useSpeedCardsGame = ({
  setLoading,
  setError,
  pushUpdate,
}: UseSpeedCardsGameOptions) => {
  const store = useSpeedCardsStore();

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const categories = store.selectedCategories.length
        ? store.selectedCategories
        : ["A2", "B1"];

      const words: any[] = [];
      const maxAttempts = 20;
      let attempts = 0;

      while (words.length < 10 && attempts < maxAttempts) {
        const { data, error } = await supabase.rpc("get_random_word", {
          categories,
        });

        if (error) {
          throw error;
        }

        const wordItem = data?.[0];
        if (wordItem) {
          const exists = words.some((item) => item.word === wordItem.word);
          if (!exists) {
            words.push(wordItem);
          }
        }

        attempts += 1;
      }

      if (words.length === 0) {
        setError("Failed to fetch words");
        return;
      }

      store.initGame(words.slice(0, 10));
      if (store.gameMode === "duel") {
        // Start turn timer for duel mode
        const state = useSpeedCardsStore.getState();
        const playerIds = Object.keys(state.players);
        const activeId =
          state.activePlayerId ||
          (playerIds.length > 0 ? playerIds[0] : state.myPlayerId);
        store.setActivePlayer(activeId || null);
        if (state.turnTime) {
          const now = Date.now();
          store.setTurnStartedAt(now);
        }

        await pushUpdate(useSpeedCardsStore.getState());
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch words");
    } finally {
      setLoading(false);
    }
  }, [store, setError, setLoading, pushUpdate]);

  const handleSelectCard = useCallback(
    async (cardId: string) => {
      store.selectCard(cardId);
      if (store.gameMode === "duel") {
        await pushUpdate(useSpeedCardsStore.getState());
      }
    },
    [store, pushUpdate],
  );

  const handleStartSolo = useCallback(() => {
    store.setGameMode("solo");
    store.setRoomCode(null);
    store.setHostId(null);
    fetchWords();
  }, [fetchWords, store]);

  return {
    fetchWords,
    handleSelectCard,
    handleStartSolo,
  };
};
