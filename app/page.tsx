"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

import { useGameSync } from "@/hooks/useGameSync";

import { useGameStore } from "@/store/useGameStore";
import { LobbyAuth } from "@/components/lobby/LobbyAuth";
import { WaitingRoom } from "@/components/lobby/WaitingRoom";
import { GameDashboard } from "@/components/game/GameDashboard";

export default function Home() {
  const store = useGameStore();

  const { pushUpdate } = useGameSync();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem("alias_player_id");
    if (!id) {
      id = "p_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("alias_player_id", id);
    }
    store.setMyPlayerId(id);
  }, []);

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
      <LobbyAuth />
    );
  }

  if (store.teams.length < 2) {
    return ( 
      <WaitingRoom pushUpdate={pushUpdate} />
    );
  }

  return (
    <GameDashboard
      fetchWord={fetchWord}
      loading={loading}
      pushUpdate={pushUpdate}
    />
  );
}
