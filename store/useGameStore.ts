import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HistoryItem {
  word: string;
  isCorrect: boolean;
}

interface Team {
  name: string;
  score: number;
  history: HistoryItem[];
}

interface GameState {
  teams: Team[];
  currentTeamIndex: number;
  isGameStarted: boolean;
  startGame: () => void;
  setGameState: (state: boolean) => void;
  currentWord: any | null;
  addTeam: (name: string) => void;
  nextTeam: () => void;
  setWord: (word: any) => void;
  updateScore: (word: string, isCorrect: boolean) => void;
  newRound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      teams: [],
      currentTeamIndex: 0,
      isGameStarted: false,
      setGameState: (state) => set({ isGameStarted: state }),
      currentWord: null,
      startGame: () => set({ isGameStarted: true }),
      addTeam: (name) =>
        set((state) => ({
          teams: [...state.teams, { name, score: 0, history: [] }],
        })),
      nextTeam: () =>
        set((state) => ({
          currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length,
          isGameStarted: false,
          currentWord: null,
        })),
      setWord: (word) => set({ currentWord: word }),
      updateScore: (word, isCorrect) =>
        set((state) => {
          const newTeams = [...state.teams];
          const team = newTeams[state.currentTeamIndex];
          team.score += isCorrect ? 1 : 0;
          team.history.push({ word, isCorrect });
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
        }),
    }),
    { name: "alias-storage" }
  )
);
