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
      const { data } = await supabase
        .from("words")
        .select("word, hint")
        .in("category", ["A2", "B1"])
        .limit(30);

      if (data) {
        const shuffledWords = data.sort(() => Math.random() - 0.5).slice(0, 5);
        store.initGame(shuffledWords);
        if (store.gameMode === "duel") {
          await pushUpdate(useSpeedCardsStore.getState());
        }
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
      [myId]: { id: myId, name: "Player 1", matches: 0, total: 0 },
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
      store.setRoomCode(code);
      store.setGameMode("duel");
    } else {
      setError("Failed to create room");
    }
  };

  const handleJoinDuel = async (code: string) => {
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

    const myId = store.myPlayerId || "local";
    const currentGameState = data.game_state || {};
    const existingPlayers = currentGameState.players || {};

    const updatedPlayers = {
      ...existingPlayers,
      [myId]: { id: myId, name: "Player 2", matches: 0, total: 0 },
    };

    const updatedGameState = {
      ...currentGameState,
      players: updatedPlayers,
      gameMode: "duel",
    };

    const { error: updateError } = await supabase
      .from("lobbies")
      .update({ game_state: updatedGameState })
      .eq("code", code);

    if (updateError) {
      setError("Failed to join room");
      return;
    }

    store.syncFromSupabase(updatedGameState);
    store.setRoomCode(code);
    store.setGameMode("duel");
  };

  const handleStartSolo = () => {
    fetchWords();
  };

  const handleSelectCard = async (cardId: string) => {
    store.selectCard(cardId);
    if (store.gameMode === "duel") {
      await pushUpdate(useSpeedCardsStore.getState());
    }
  };

  if (!store.gameMode && !store.roomCode) {
    return (
      <SpeedCardsSetup
        onCreateDuel={handleCreateDuel}
        onJoinDuel={handleJoinDuel}
        onStartSolo={handleStartSolo}
      />
    );
  }

  // Check if current user is the host/creator (the first player in the lobby)
  const playerIds = Object.keys(store.players);
  const isHost = playerIds.length > 0 && playerIds[0] === store.myPlayerId;
  const isMyTurn =
    store.gameMode === "solo" || store.activePlayerId === store.myPlayerId;

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
