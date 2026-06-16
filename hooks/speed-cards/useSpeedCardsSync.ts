import { useEffect, useCallback } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";
import { supabase } from "@/lib/supabase";

export const useSpeedCardsSync = () => {
  const roomCode = useSpeedCardsStore((state) => state.roomCode);
  const syncFromSupabase = useSpeedCardsStore((state) => state.syncFromSupabase);
  const resetGame = useSpeedCardsStore((state) => state.resetGame);

  const pushUpdate = useCallback(
    async (manualState?: any) => {
      if (!roomCode) return;
      try {
        const stateToPush = manualState || useSpeedCardsStore.getState();
        const pureData = JSON.parse(JSON.stringify(stateToPush));

        delete pureData.myPlayerId;
        delete pureData.roomCode;

        await supabase
          .from("lobbies")
          .update({ game_state: pureData })
          .eq("code", roomCode);
      } catch (err) {
        console.error("SpeedCardsSync error pushing update:", err);
      }
    },
    [roomCode],
  );

  const leaveLobby = useCallback(async () => {
    if (!roomCode) return;

    try {
      await supabase.from("lobbies").delete().eq("code", roomCode);
    } catch (err) {
      console.error("SpeedCardsSync error deleting lobby:", err);
    }

    resetGame();
    localStorage.removeItem("speed_cards_room_code");
  }, [roomCode, resetGame]);

  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`lobby-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.new && payload.new.game_state) {
            syncFromSupabase(payload.new.game_state);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${roomCode}`,
        },
        () => {
          resetGame();
          localStorage.removeItem("speed_cards_room_code");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, syncFromSupabase, resetGame]);

  return { pushUpdate, leaveLobby };
};