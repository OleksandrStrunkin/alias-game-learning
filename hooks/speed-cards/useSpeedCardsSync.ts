import { useEffect, useCallback } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";
import { supabase } from "@/lib/supabase";

export const useSpeedCardsSync = () => {
  const store = useSpeedCardsStore();

  const pushUpdate = useCallback(
    async (manualState?: any) => {
      if (!store.roomCode) return;
      try {
        const stateToPush = manualState || useSpeedCardsStore.getState();
        const pureData = JSON.parse(JSON.stringify(stateToPush));
        
        delete pureData.myPlayerId;
        delete pureData.roomCode;

        await supabase
          .from("lobbies")
          .update({ game_state: pureData })
          .eq("code", store.roomCode);
      } catch (err) {
        console.error("SpeedCardsSync error pushing update:", err);
      }
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
          if (payload.new && payload.new.game_state) {
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


