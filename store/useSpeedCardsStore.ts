import { create } from "zustand";

export interface Card {
  id: string;
  text: string;
  pairId: string;
  type: "word" | "translation";
  isMatched: boolean;
}

export interface PlayerProgress {
  id: string;
  name: string;
  matches: number;
  total: number;
}

export interface SpeedCardsState {
  cards: Card[];
  selectedCardId: string | null;
  failedPair: string[] | null;
  players: Record<string, PlayerProgress>;
  isGameStarted: boolean;
  roomCode: string | null;
  myPlayerId: string | null;
  activePlayerId: string | null;
  gameMode: "solo" | "duel" | null;
  winnerId: string | null;

  // Actions
  setGameMode: (mode: "solo" | "duel" | null) => void;
  setMyPlayerId: (id: string) => void;
  setRoomCode: (code: string | null) => void;
  initGame: (words: any[]) => void;
  selectCard: (id: string) => void;
  clearFailedPair: () => void;
  syncFromSupabase: (newState: any) => void;
  resetGame: () => void;
}

export const useSpeedCardsStore = create<SpeedCardsState>((set) => ({
  cards: [],
  selectedCardId: null,
  failedPair: null,
  players: {},
  isGameStarted: false,
  roomCode: null,
  myPlayerId: null,
  activePlayerId: null,
  gameMode: null,
  winnerId: null,

  setGameMode: (mode) => set({ gameMode: mode }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setRoomCode: (code) => set({ roomCode: code }),

  resetGame: () =>
    set({
      cards: [],
      selectedCardId: null,
      failedPair: null,
      players: {},
      isGameStarted: false,
      roomCode: null,
      gameMode: null,
      activePlayerId: null,
      winnerId: null,
    }),

  initGame: (words) =>
    set((state) => {
      const gameCards: Card[] = [];
      words.forEach((w, index) => {
        const pairId = `pair-${index}`;
        gameCards.push({
          id: `word-${index}`,
          text: w.word,
          pairId,
          type: "word",
          isMatched: false,
        });
        gameCards.push({
          id: `trans-${index}`,
          text: w.hint || "No Translation",
          pairId,
          type: "translation",
          isMatched: false,
        });
      });

      // Shuffle cards
      const shuffled = gameCards.sort(() => Math.random() - 0.5);

      const updatedPlayers = { ...state.players };
      Object.keys(updatedPlayers).forEach((pId) => {
        updatedPlayers[pId] = {
          ...updatedPlayers[pId],
          matches: 0,
          total: words.length,
        };
      });

      // If solo mode, set up a local player progress if not already done
      const myId = state.myPlayerId || "local";
      if (state.gameMode === "solo") {
        updatedPlayers[myId] = {
          id: myId,
          name: "You",
          matches: 0,
          total: words.length,
        };
      }

      const playerIds = Object.keys(updatedPlayers);
      const activePlayerId =
        state.gameMode === "duel" && playerIds.length > 0 ? playerIds[0] : myId;

      return {
        cards: shuffled,
        isGameStarted: true,
        selectedCardId: null,
        failedPair: null,
        players: updatedPlayers,
        activePlayerId,
        winnerId: null,
      };
    }),

  selectCard: (id) =>
    set((state) => {
      // In duel mode, only the active player can click
      if (
        state.gameMode === "duel" &&
        state.activePlayerId !== state.myPlayerId
      ) {
        return {};
      }

      // Block clicking if there's a failed pair displaying
      if (state.failedPair) {
        return {};
      }

      const clickedCard = state.cards.find((c) => c.id === id);
      if (!clickedCard || clickedCard.isMatched) {
        return {};
      }

      if (!state.selectedCardId) {
        return { selectedCardId: id };
      }

      if (state.selectedCardId === id) {
        return { selectedCardId: null };
      }

      const firstCard = state.cards.find((c) => c.id === state.selectedCardId);
      const secondCard = clickedCard;

      if (!firstCard || !secondCard) {
        return { selectedCardId: null };
      }

      // Check match
      if (
        firstCard.pairId === secondCard.pairId &&
        firstCard.type !== secondCard.type
      ) {
        const newCards = state.cards.map((c) =>
          c.id === firstCard.id || c.id === secondCard.id
            ? { ...c, isMatched: true }
            : c,
        );

        const activeId = state.activePlayerId || state.myPlayerId || "local";
        const updatedPlayers = { ...state.players };
        if (updatedPlayers[activeId]) {
          updatedPlayers[activeId] = {
            ...updatedPlayers[activeId],
            matches: updatedPlayers[activeId].matches + 1,
          };
        }

        const isAllMatched = newCards.every((c) => c.isMatched);
        let winnerId = null;
        let nextActivePlayerId = state.activePlayerId;

        if (isAllMatched) {
          const playerIds = Object.keys(updatedPlayers);
          if (playerIds.length === 2) {
            const [p1, p2] = playerIds;
            if (updatedPlayers[p1].matches > updatedPlayers[p2].matches) {
              winnerId = p1;
            } else if (
              updatedPlayers[p2].matches > updatedPlayers[p1].matches
            ) {
              winnerId = p2;
            } else {
              winnerId = "draw";
            }
          } else {
            winnerId = activeId;
          }
        } else {
          // Match switch: pass turn to the other player anyway (as requested: "якщо попав вони зникають і хід переходить все одно")
          const playerIds = Object.keys(state.players);
          if (playerIds.length > 1 && state.activePlayerId) {
            const currentIndex = playerIds.indexOf(state.activePlayerId);
            const nextIndex = (currentIndex + 1) % playerIds.length;
            nextActivePlayerId = playerIds[nextIndex];
          }
        }

        return {
          cards: newCards,
          selectedCardId: null,
          players: updatedPlayers,
          activePlayerId: nextActivePlayerId,
          winnerId,
        };
      }

      // No match
      return {
        failedPair: [firstCard.id, secondCard.id],
        selectedCardId: null,
      };
    }),

  clearFailedPair: () =>
    set((state) => {
      // Switch turn to next player
      const playerIds = Object.keys(state.players);
      let nextActivePlayerId = state.activePlayerId;
      if (playerIds.length > 1 && state.activePlayerId) {
        const currentIndex = playerIds.indexOf(state.activePlayerId);
        const nextIndex = (currentIndex + 1) % playerIds.length;
        nextActivePlayerId = playerIds[nextIndex];
      }
      return {
        failedPair: null,
        activePlayerId: nextActivePlayerId,
      };
    }),

  syncFromSupabase: (newState) =>
    set((state) => ({
      ...newState,
      myPlayerId: state.myPlayerId,
      roomCode: state.roomCode,
    })),
}));
