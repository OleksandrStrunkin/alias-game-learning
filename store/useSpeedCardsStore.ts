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
  selectedCategories: string[];
  turnTime: number | null;
  turnStartedAt: number | null;
  hostId: string | null;
  activePlayerId: string | null;
  gameMode: "solo" | "duel" | null;
  winnerId: string | null;

  // Actions
  setGameMode: (mode: "solo" | "duel" | null) => void;
  setMyPlayerId: (id: string) => void;
  setHostId: (id: string | null) => void;
  setRoomCode: (code: string | null) => void;
  setTurnTime: (seconds: number | null) => void;
  setTurnStartedAt: (ts: number | null) => void;
  setActivePlayer: (id: string | null) => void;
  toggleCategory: (category: string) => void;
  initGame: (words: any[], playerName?: string) => void;
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
  selectedCategories: ["A2", "B1"],
  turnTime: null,
  turnStartedAt: null,
  hostId: null,
  activePlayerId: null,
  gameMode: null,
  winnerId: null,

  setGameMode: (mode: "solo" | "duel" | null) => set({ gameMode: mode }),
  setMyPlayerId: (id: string) => set({ myPlayerId: id }),
  setHostId: (id: string | null) => set({ hostId: id }),
  setRoomCode: (code: string | null) => set({ roomCode: code }),
  setTurnTime: (seconds: number | null) => set({ turnTime: seconds }),
  setTurnStartedAt: (ts: number | null) => set({ turnStartedAt: ts }),
  setActivePlayer: (id: string | null) => set({ activePlayerId: id }),
  toggleCategory: (category: string) =>
    set((state) => {
      if (category === "API") {
        return { selectedCategories: ["API"] };
      }

      let newCats = state.selectedCategories.filter((c) => c !== "API");
      if (newCats.includes(category)) {
        if (newCats.length > 1) {
          newCats = newCats.filter((c) => c !== category);
        }
      } else {
        newCats.push(category);
      }

      return { selectedCategories: newCats };
    }),

  resetGame: () =>
    set({
      cards: [],
      selectedCardId: null,
      failedPair: null,
      players: {},
      isGameStarted: false,
      roomCode: null,
      myPlayerId: null,
      selectedCategories: ["A2", "B1"],
      hostId: null,
      gameMode: null,
      activePlayerId: null,
      winnerId: null,
    }),

  initGame: (words, playerName) =>
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
      const myId =
        state.myPlayerId || localStorage.getItem("alias_player_id") || "local";
      if (state.gameMode === "solo") {
        updatedPlayers[myId] = {
          id: myId,
          name: playerName?.trim() || "You",
          matches: 0,
          total: words.length,
        };
      }

      const playerIds = Object.keys(updatedPlayers);
      const activePlayerId =
        state.gameMode === "duel"
          ? state.activePlayerId || (playerIds.length > 0 ? playerIds[0] : myId)
          : myId;

      return {
        cards: shuffled,
        isGameStarted: true,
        selectedCardId: null,
        failedPair: null,
        players: updatedPlayers,
        activePlayerId,
        winnerId: null,
        hostId: state.gameMode === "duel" ? state.hostId || null : null,
        turnStartedAt: state.turnStartedAt || null,
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
      hostId: newState.hostId ?? state.hostId ?? null,
      selectedCategories: newState.selectedCategories ||
        state.selectedCategories || ["A2", "B1"],
    })),
}));
