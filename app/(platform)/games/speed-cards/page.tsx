"use client";
import { useEffect, useState } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";
import { supabase } from "@/lib/supabase";
import { SpeedCardsSetup } from "@/components/game/speed-cards/SpeedCardsSetup";
import { useSpeedCardsSync } from "@/hooks/speed-cards/useSpeedCardsSync";
import { SpeedCardsWaitingRoom } from "@/components/game/speed-cards/SpeedCardsWaitingRoom";
import { SpeedCardsGameBoard } from "@/components/game/speed-cards/SpeedCardsGameBoard";
import { SpeedCardsHeader } from "@/components/game/speed-cards/SpeedCardsHeader";
import { useSpeedCardsPlayer } from "@/hooks/speed-cards/useSpeedCardsPlayer";
import { useSpeedCardsFailedPairTimer } from "@/hooks/speed-cards/useSpeedCardsFailedPairTimer";
import { useSpeedCardsGame } from "@/hooks/speed-cards/useSpeedCardsGame";
import { useSpeedCardsLobby } from "@/hooks/speed-cards/useSpeedCardsLobby";

export default function SpeedCardsPage() {
  const store = useSpeedCardsStore();
  const setRoomCode = useSpeedCardsStore((state) => state.setRoomCode);
  const syncFromSupabase = useSpeedCardsStore(
    (state) => state.syncFromSupabase,
  );
  const setGameMode = useSpeedCardsStore((state) => state.setGameMode);

  const { pushUpdate, leaveLobby } = useSpeedCardsSync();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSpeedCardsPlayer();
  useSpeedCardsFailedPairTimer(pushUpdate);

  const { fetchWords, handleSelectCard, handleStartSolo } = useSpeedCardsGame({
    setLoading,
    setError,
    pushUpdate,
  });

  const {
    handleCreateDuel,
    handleOpenJoinRoom,
    handleSubmitPlayerName,
    updateRoomState,
  } = useSpeedCardsLobby({
    setError,
    pushUpdate,
  });

  useEffect(() => {
    const savedRoom = localStorage.getItem("speed_cards_room_code");
    if (!savedRoom || store.roomCode) return;

    const restoreRoom = async () => {
      const { data, error } = await supabase
        .from("lobbies")
        .select("game_state, game_type")
        .eq("code", savedRoom)
        .single();

      if (
        !error &&
        data &&
        data.game_state &&
        data.game_type === "speed-cards"
      ) {
        syncFromSupabase(data.game_state);
        setRoomCode(savedRoom);
        if (data.game_state.gameMode === "duel") {
          setGameMode("duel");
        }
      } else {
        localStorage.removeItem("speed_cards_room_code");
      }
    };

    restoreRoom();
  }, [store.roomCode, setGameMode, setRoomCode, syncFromSupabase]);

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
        onQuit={leaveLobby}
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
