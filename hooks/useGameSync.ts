import { useEffect, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";
import { supabase } from "@/lib/supabase";

export const useGameSync = () => {
  const store = useGameStore();

  const pushUpdate = useCallback(
    async (manualState?: any) => {
      if (!store.roomCode) return;
      const stateToPush = manualState || useGameStore.getState();
      const pureData = JSON.parse(JSON.stringify(stateToPush));
      delete pureData.myPlayerId;

      await supabase
        .from("lobbies")
        .update({ game_state: pureData })
        .eq("code", store.roomCode);
    },
    [store.roomCode],
  );

  useEffect(() => {
    if (!store.roomCode) return;

    const channel = supabase
      .channel(`lobby-${store.roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${store.roomCode}`,
        },
        (payload) => {
          if (payload.new.game_state) {
            store.syncFromSupabase(payload.new.game_state);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [store.roomCode, store.syncFromSupabase]);

  return { pushUpdate };
};
