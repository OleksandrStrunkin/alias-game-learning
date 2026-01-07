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
  selectedCategories: string[];
  isPaused: boolean;
  timeLeftOnPause: number | null;
  roundDuration: number;
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
  toggleCategory: (category: string) => void;
  setPaused: (paused: boolean) => void;
  pauseRound: () => void;
  resumeRound: () => void;
  setRoundDuration: (duration: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  teams: [],
  currentTeamIndex: 0,
  isGameStarted: false,
  currentWord: null,
  roomCode: null,
  roundEndTime: null,
  myPlayerId: null,
  selectedCategories: ["A2"],
  isPaused: false,
  timeLeftOnPause: null,
  roundDuration: 60,
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setRoundDuration: (duration) => set({ roundDuration: duration }),

  pauseRound: () =>
    set((state) => {
      if (!state.roundEndTime || state.isPaused) return state;

      const now = Date.now();
      const remaining = state.roundEndTime - now;

      return {
        isPaused: true,
        timeLeftOnPause: remaining > 0 ? remaining : 0,
        roundEndTime: null,
      };
    }),
  resumeRound: () =>
    set((state) => {
      if (!state.isPaused || state.timeLeftOnPause === null) return state;

      const newEndTime = Date.now() + state.timeLeftOnPause;

      return {
        isPaused: false,
        roundEndTime: newEndTime,
        timeLeftOnPause: null,
      };
    }),
  setPaused: (paused) => set({ isPaused: paused }),

  toggleCategory: (category) =>
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

  setGameState: (state) => set({ isGameStarted: state }),
  setRoomCode: (code) => set({ roomCode: code }),

  syncFromSupabase: (newState) =>
    set((state) => ({
      ...newState,
      myPlayerId: state.myPlayerId,
      roomCode: state.roomCode,
      selectedCategories:
        newState.selectedCategories || state.selectedCategories,
      isPaused: newState.isPaused ?? state.isPaused,
      timeLeftOnPause: newState.timeLeftOnPause ?? state.timeLeftOnPause,
      roundDuration: newState.roundDuration || state.roundDuration,
    })),

  startGame: (endTime) =>
    set({
      isGameStarted: true,
      isPaused: false,
      timeLeftOnPause: null,
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
      selectedCategories: ["A2"],
      isPaused: false,
      timeLeftOnPause: null,
    }),
}));
