import { create } from "zustand";

interface HistoryItem {
  word: string;
  isCorrect: boolean;
}

interface Team {
  name: string;
  score: number;
  history: HistoryItem[];
  playerId: string;
}

interface GameState {
  teams: Team[];
  currentTeamIndex: number;
  isGameStarted: boolean;
  currentWord: any | null;
  roomCode: string | null;
  roundEndTime: number | null;
  myPlayerId: string | null;
  // Methods
  addTeam: (name: string, playerId: string) => void;
  setMyPlayerId: (id: string) => void;
  setGameState: (state: boolean) => void;
  setRoomCode: (code: string | null) => void;
  syncFromSupabase: (newState: any) => void;
  startGame: (endTime?: number) => void;
  nextTeam: () => void;
  setWord: (word: any) => void;
  updateScore: (word: string, isCorrect: boolean) => void;
  newRound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  teams: [],
  currentTeamIndex: 0,
  isGameStarted: false,
  currentWord: null,
  roomCode: null,
  roundEndTime: null,
  myPlayerId: null,
  setMyPlayerId: (id) => set({ myPlayerId: id }),

  setGameState: (state) => set({ isGameStarted: state }),
  setRoomCode: (code) => set({ roomCode: code }),

  syncFromSupabase: (newState) =>
    set((state) => ({
      ...newState,
      myPlayerId: state.myPlayerId,
      roomCode: state.roomCode,
    })),

  startGame: (endTime) =>
    set({
      isGameStarted: true,
      roundEndTime: endTime || Date.now() + 60000,
    }),

  addTeam: (name, playerId) =>
    set((state) => ({
      teams: [...state.teams, { name, score: 0, history: [], playerId }],
    })),

  nextTeam: () =>
    set((state) => ({
      currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length,
      isGameStarted: false,
      currentWord: null,
      roundEndTime: null,
    })),

  setWord: (word) => set({ currentWord: word }),

  updateScore: (word, isCorrect) =>
    set((state) => {
      const newTeams = JSON.parse(JSON.stringify(state.teams));
      const team = newTeams[state.currentTeamIndex];
      if (team) {
        team.score += isCorrect ? 1 : 0;
        team.history.push({ word, isCorrect });
      }
      return { teams: newTeams };
    }),

  newRound: () =>
    set((state) => ({
      isGameStarted: false,
      currentWord: null,
      teams: state.teams.map((t) => ({ ...t, score: 0, history: [] })),
      currentTeamIndex: 0,
    })),

  resetGame: () =>
    set({
      teams: [],
      currentTeamIndex: 0,
      isGameStarted: false,
      currentWord: null,
      roomCode: null,
    }),
}));
