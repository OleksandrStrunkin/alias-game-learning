import { create } from "zustand";

interface Card {
  id: string;
  text: string;
  pairId: string;
  type: "word" | "translation";
  isMatched: boolean;
}

interface PlayerProgress {
  id: string;
  name: string;
  matches: number;
  total: number;
}

interface SpeedCardsState {
  cards: Card[];
  selectedCardId: string | null;
  players: Record<string, PlayerProgress>;
  isGameStarted: boolean;
  roomCode: string | null;
  myPlayerId: string | null;
  gameMode: "solo" | "duel" | null;
  playerName: string;
  
  // Actions
  setGameMode: (mode: "solo" | "duel" | null) => void;
  setPlayerName: (name: string) => void;
  setMyPlayerId: (id: string) => void;
  setRoomCode: (code: string | null) => void;
  initGame: (words: any[]) => void;
  selectCard: (id: string) => void;
  updateOpponentProgress: (playerId: string, matches: number) => void;
  syncFromSupabase: (newState: any) => void;
  resetGame: () => void;
}

export const useSpeedCardsStore = create<SpeedCardsState>((set) => ({
  cards: [],
  selectedCardId: null,
  players: {},
  isGameStarted: false,
  roomCode: null,
  myPlayerId: null,
  gameMode: null,
  playerName: "",

  setGameMode: (mode) => set({ gameMode: mode }),
  setPlayerName: (name) => set({ playerName: name }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setRoomCode: (code) => set({ roomCode: code }),

  resetGame: () => set({
    cards: [],
    selectedCardId: null,
    players: {},
    isGameStarted: false,
    roomCode: null,
    gameMode: null
  }),

  initGame: (words) => {
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
    set({ cards: shuffled, isGameStarted: true, selectedCardId: null });
  },

  selectCard: (id) => set((state) => {
    if (!state.selectedCardId) {
      return { selectedCardId: id };
    }

    if (state.selectedCardId === id) {
      return { selectedCardId: null };
    }

    const firstCard = state.cards.find(c => c.id === state.selectedCardId);
    const secondCard = state.cards.find(c => c.id === id);

    if (firstCard && secondCard && firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
      // Match found!
      const newCards = state.cards.map(c => 
        (c.id === firstCard.id || c.id === secondCard.id) 
          ? { ...c, isMatched: true } 
          : c
      );
      
      const myId = state.myPlayerId || "local";
      const myProgress = state.players[myId] || { id: myId, name: "You", matches: 0, total: state.cards.length / 2 };
      
      return {
        cards: newCards,
        selectedCardId: null,
        players: {
          ...state.players,
          [myId]: { ...myProgress, matches: myProgress.matches + 1 }
        }
      };
    }

    // No match
    return { selectedCardId: null };
  }),

  updateOpponentProgress: (playerId, matches) => set((state) => ({
    players: {
      ...state.players,
      [playerId]: { 
        ...(state.players[playerId] || { id: playerId, name: "Opponent", matches: 0, total: state.cards.length / 2 }),
        matches 
      }
    }
  })),

  syncFromSupabase: (newState) => set((state) => ({
    ...newState,
    myPlayerId: state.myPlayerId,
    roomCode: state.roomCode,
  })),
}));
