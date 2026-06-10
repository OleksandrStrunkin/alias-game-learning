import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

interface UseSpeedCardsLobbyOptions {
  setError: (error: string | null) => void;
  pushUpdate: (state?: any) => Promise<void>;
}

export const useSpeedCardsLobby = ({
  setError,
  pushUpdate,
}: UseSpeedCardsLobbyOptions) => {
  const store = useSpeedCardsStore();
  const handleCreateDuel = useCallback(async () => {
    setError(null);
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const myId = localStorage.getItem("alias_player_id") || "p_host";

    const initialPlayers = {
      [myId]: {
        id: myId,
        name: "Player 1",
        matches: 0,
        total: 0,
      },
    };

    const initialGameState = {
      isGameStarted: false,
      players: initialPlayers,
      cards: [],
      activePlayerId: myId,
      failedPair: null,
      winnerId: null,
      selectedCardId: null,
      gameMode: "duel",
      hostId: myId,
      turnTime: store.turnTime || null,
      turnStartedAt: null,
      selectedCategories: store.selectedCategories,
    };

    const threeHoursAgo = new Date(
      Date.now() - 3 * 60 * 60 * 1000,
    ).toISOString();
    await supabase
      .from("lobbies")
      .delete()
      .lt("created_at", threeHoursAgo)
      .eq("game_type", "speed-cards");

    const { error: supabaseError } = await supabase.from("lobbies").insert([
      {
        code,
        game_state: initialGameState,
        game_type: "speed-cards",
      },
    ]);

    if (!supabaseError) {
      store.syncFromSupabase(initialGameState);
      store.setHostId(myId);
      store.setRoomCode(code);
      store.setGameMode("duel");
      localStorage.setItem("speed_cards_room_code", code);
    } else {
      setError("Failed to create room");
    }
  }, [setError, store]);

  const handleOpenJoinRoom = useCallback(
    async (code: string) => {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from("lobbies")
        .select("game_state, game_type")
        .eq("code", code)
        .single();

      if (supabaseError || !data || data.game_type !== "speed-cards") {
        setError("Room not found or wrong game type");
        return;
      }

      const currentGameState = data.game_state || {};
      store.syncFromSupabase(currentGameState);
      store.setRoomCode(code);
      store.setGameMode("duel");
      localStorage.setItem("speed_cards_room_code", code);
    },
    [setError, store],
  );

  const handleSubmitPlayerName = useCallback(
    async (playerName: string) => {
      if (!store.myPlayerId || !store.roomCode) return;

      const currentPlayer = store.players[store.myPlayerId];
      if (currentPlayer) {
        const updatedPlayers = {
          ...store.players,
          [store.myPlayerId]: {
            ...currentPlayer,
            name: playerName.trim() || currentPlayer.name,
          },
        };

        const updatedGameState = {
          players: updatedPlayers,
          cards: store.cards,
          activePlayerId: store.activePlayerId,
          failedPair: store.failedPair,
          winnerId: store.winnerId,
          selectedCardId: store.selectedCardId,
          gameMode: store.gameMode,
          hostId: store.hostId,
          selectedCategories: store.selectedCategories,
        };

        store.syncFromSupabase(updatedGameState);
        await pushUpdate(useSpeedCardsStore.getState());
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from("lobbies")
        .select("game_state, game_type")
        .eq("code", store.roomCode)
        .single();

      if (supabaseError || !data || data.game_type !== "speed-cards") {
        setError("Room not found or wrong game type");
        return;
      }

      const currentGameState = data.game_state || {};
      const existingPlayers = (currentGameState.players || {}) as Record<
        string,
        { total?: number }
      >;

      const updatedPlayers = {
        ...existingPlayers,
        [store.myPlayerId]: {
          id: store.myPlayerId,
          name: playerName.trim() || "Player 2",
          matches: 0,
          total: Object.values(existingPlayers)[0]?.total || 0,
        },
      };

      const updatedGameState = {
        ...currentGameState,
        players: updatedPlayers,
        gameMode: "duel",
      };

      const { error: updateError } = await supabase
        .from("lobbies")
        .update({ game_state: updatedGameState })
        .eq("code", store.roomCode);

      if (updateError) {
        setError("Failed to join room");
        return;
      }

      store.syncFromSupabase(updatedGameState);
    },
    [setError, store, pushUpdate],
  );

  const updateRoomState = useCallback(async () => {
    if (!store.roomCode) return;
    await pushUpdate(useSpeedCardsStore.getState());
  }, [pushUpdate, store.roomCode]);

  return {
    handleCreateDuel,
    handleOpenJoinRoom,
    handleSubmitPlayerName,
    updateRoomState,
  };
};
