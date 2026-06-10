import { useEffect, useCallback } from "react";
import { useAliasStore } from "@/store/useAliasStore";
import { supabase } from "@/lib/supabase";

export const useAliasSync = () => {
  const store = useAliasStore();

  const pushUpdate = useCallback(
    async (manualState?: any) => {
      if (!store.roomCode) return;
      const stateToPush = manualState || useAliasStore.getState();
      const pureData = JSON.parse(JSON.stringify(stateToPush));
      delete pureData.myPlayerId;

      await supabase
        .from("lobbies")
        .update({ game_state: pureData })
        .eq("code", store.roomCode);
    },
    [store.roomCode],
  );

  const leaveLobby = useCallback(async () => {
    if (!store.roomCode) return;

    await supabase.from("lobbies").delete().eq("code", store.roomCode);
    store.resetGame();
    localStorage.removeItem("alias_room_code");
  }, [store.roomCode, store.resetGame]);

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
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${store.roomCode}`,
        },
        () => {
          store.resetGame();
          localStorage.removeItem("alias_room_code");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [store.roomCode, store.syncFromSupabase]);

  return { pushUpdate, leaveLobby };
};
