"use client";
import { useState } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";
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
  const { pushUpdate } = useSpeedCardsSync();
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
