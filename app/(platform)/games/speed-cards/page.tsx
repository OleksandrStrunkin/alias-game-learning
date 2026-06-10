"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";
import { SpeedCardsSetup } from "@/components/game/speed-cards/SpeedCardsSetup";
import { useSpeedCardsSync } from "@/hooks/useSpeedCardsSync";
import { SpeedCardsWaitingRoom } from "@/components/game/speed-cards/SpeedCardsWaitingRoom";
import { SpeedCardsGameBoard } from "@/components/game/speed-cards/SpeedCardsGameBoard";
import { SpeedCardsHeader } from "@/components/game/speed-cards/SpeedCardsHeader";

export default function SpeedCardsPage() {
  const store = useSpeedCardsStore();
  const { pushUpdate } = useSpeedCardsSync();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize My Player ID
  useEffect(() => {
    let id = localStorage.getItem("alias_player_id");
    if (!id) {
      id = "p_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("alias_player_id", id);
    }
    store.setMyPlayerId(id);
  }, []);

  // Handle Mismatch Timer (Failed Pairs)
  useEffect(() => {
    if (store.failedPair) {
      // Only the active player (or local player in solo) controls the timer to trigger the turn switch
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
    }
  }, [
    store.failedPair,
    store.activePlayerId,
    store.myPlayerId,
    store.gameMode,
    pushUpdate,
  ]);

  // Fetch words and start the game
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
        await pushUpdate(useSpeedCardsStore.getState());
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch words");
    } finally {
      setLoading(false);
    }
  }, [store, pushUpdate]);

  const handleCreateDuel = async () => {
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
      selectedCategories: store.selectedCategories,
    };

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
    } else {
      setError("Failed to create room");
    }
  };

  const handleOpenJoinRoom = async (code: string) => {
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
  };

  const handleStartSolo = () => {
    store.setGameMode("solo");
    store.setRoomCode(null);
    store.setHostId(null);
    fetchWords();
  };

  const handleSelectCard = async (cardId: string) => {
    store.selectCard(cardId);
    if (store.gameMode === "duel") {
      await pushUpdate(useSpeedCardsStore.getState());
    }
  };

  const updateRoomState = useCallback(async () => {
    if (store.roomCode) {
      await pushUpdate(useSpeedCardsStore.getState());
    }
  }, [pushUpdate, store.roomCode]);

  const handleSubmitPlayerName = async (playerName: string) => {
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
  };

  if (!store.gameMode && !store.roomCode) {
    return (
      <SpeedCardsSetup
        onCreateDuel={handleCreateDuel}
        onOpenJoinRoom={handleOpenJoinRoom}
        onStartSolo={handleStartSolo}
      />
    );
  }

  const playerIds = Object.keys(store.players);
  const currentPlayerId =
    store.myPlayerId || localStorage.getItem("alias_player_id") || null;
  const isHost = store.hostId !== null && store.hostId === currentPlayerId;
  const isMyTurn =
    store.gameMode === "solo" || store.activePlayerId === currentPlayerId;

  return (
    <div className="max-w-4xl mx-auto p-6 text-primary">
      {error && (
        <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded-xl text-destructive-foreground text-xs text-center font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      <SpeedCardsHeader
        gameMode={store.gameMode}
        roomCode={store.roomCode}
        onQuit={() => store.resetGame()}
      />

      {/* Lobby waiting room or Active Game screen */}
      {!store.isGameStarted ? (
        <SpeedCardsWaitingRoom
          store={store}
          playerIds={playerIds}
          isHost={isHost}
          loading={loading}
          fetchWords={fetchWords}
          onSubmitPlayerName={handleSubmitPlayerName}
          pushUpdate={updateRoomState}
        />
      ) : (
        <SpeedCardsGameBoard
          store={store}
          isMyTurn={isMyTurn}
          isHost={isHost}
          loading={loading}
          fetchWords={fetchWords}
          handleSelectCard={handleSelectCard}
        />
      )}
    </div>
  );
}
