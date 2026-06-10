import { useEffect } from "react";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

export const useSpeedCardsPlayer = () => {
  const setMyPlayerId = useSpeedCardsStore((state) => state.setMyPlayerId);

  useEffect(() => {
    let id = localStorage.getItem("alias_player_id");
    if (!id) {
      id = "p_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("alias_player_id", id);
    }
    setMyPlayerId(id);
  }, [setMyPlayerId]);
};
