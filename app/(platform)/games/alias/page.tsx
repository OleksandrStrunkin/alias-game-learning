"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

import { useAliasSync } from "@/hooks/alias/useAliasSync";

import { useAliasStore } from "@/store/useAliasStore";
import { AliasLobbyAuth } from "@/components/game/alias/lobby/AliasLobbyAuth";
import { AliasWaitingRoom } from "@/components/game/alias/lobby/AliasWaitingRoom";
import { GameDashboard } from "@/components/game/alias/GameDashboard";

export default function AliasPage() {
  const store = useAliasStore();
  const roomCode = useAliasStore((state) => state.roomCode);
  const syncFromSupabase = useAliasStore((state) => state.syncFromSupabase);
  const setRoomCode = useAliasStore((state) => state.setRoomCode);
  const setMyPlayerId = useAliasStore((state) => state.setMyPlayerId);

  const { pushUpdate, leaveLobby } = useAliasSync();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem("alias_player_id");
    if (!id) {
      id = "p_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("alias_player_id", id);
    }
    setMyPlayerId(id);
  }, [setMyPlayerId]);

  useEffect(() => {
    const savedRoom = localStorage.getItem("alias_room_code");
    if (!savedRoom || roomCode) return;

    const restoreRoom = async () => {
      const { data, error } = await supabase
        .from("lobbies")
        .select("game_state, game_type")
        .eq("code", savedRoom)
        .single();

      if (!error && data && data.game_state && data.game_type === "alias") {
        syncFromSupabase(data.game_state);
        setRoomCode(savedRoom);
      } else {
        localStorage.removeItem("alias_room_code");
      }
    };

    restoreRoom();
  }, [roomCode, setRoomCode, syncFromSupabase]);

  const fetchWord = useCallback(async () => {
    setLoading(true);
    try {
      if (store.selectedCategories.includes("API")) {
        const res = await fetch(
          "https://www.wordgamedb.com/api/v1/words/random",
        );
        const data = await res.json();
        store.setWord(data);
      } else {
        const { data, error } = await supabase.rpc("get_random_word", {
          categories: store.selectedCategories,
        });

        if (data && data.length > 0) {
          store.setWord(data[0]);
        } else if (error) {
          console.error("RPC Error:", error);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [store]);

  if (!store.roomCode) {
    return (
      <AliasLobbyAuth
        gameId="alias"
        gameTitle="Catherine Alias"
        store={store}
      />
    );
  }

  if (store.teams.length < 2) {
    return <AliasWaitingRoom pushUpdate={pushUpdate} leaveLobby={leaveLobby} />;
  }

  return (
    <GameDashboard
      fetchWord={fetchWord}
      loading={loading}
      pushUpdate={pushUpdate}
      leaveLobby={leaveLobby}
    />
  );
}
