import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export type Difficulty = "easy" | "medium" | "hard";
export type Asset = "savings" | "fixedDeposit" | "ppf" | "nifty50" | "gold" | "realestate" | "crypto";

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: "expense" | "income" | "opportunity";
};

// Game State Type
export type GameState = {
  startTime: number;
  currentTime: number;
  timeScale: number;
  cash: number;
  netWorth: number;
  investments: Record<Asset, number>;
  events: GameEvent[];
  isGameOver: boolean;
  aiNetWorth: number;
  gameSpeed: number;
  difficulty: Difficulty;
  salary: number;
  fixedExpenses: number;
  passiveIncomeTarget: number;
  timeLimit: number;
  startDate: Date;
  currentDate: Date;
  passiveIncome: number;
  setDifficulty: (difficulty: Difficulty) => void;
  initializeGame: () => void;
  advanceTime: () => void;
  handleEvent: (event: GameEvent) => void;
  invest: (asset: Asset, amount: number) => void;
  withdraw: (asset: Asset, amount: number) => void;
  endGame: () => void;
};

// Constants
const GAME_DURATION = 600000; // 10 minutes
const DEFAULT_CASH = 100000; // Default starting cash
const AI_GROWTH_RATE = 0.05 / 12; // AI grows 5% annually, divided monthly

// Investment Returns (Annualized)
const investmentReturns: Record<Asset, number> = {
  savings: 0.04,
  fixedDeposit: 0.06,
  ppf: 0.07,
  nifty50: 0.10,
  gold: 0.08,
  realestate: 0.12,
  crypto: 0.20,
};

// Get Initial State Based on Difficulty
const getInitialState = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "easy":
      return { salary: 60000, fixedExpenses: 25000, cash: 200000, passiveIncomeTarget: 40000, timeLimit: 20 };
    case "medium":
      return { salary: 45000, fixedExpenses: 25000, cash: 150000, passiveIncomeTarget: 45000, timeLimit: 15 };
    case "hard":
      return { salary: 35000, fixedExpenses: 25000, cash: 100000, passiveIncomeTarget: 50000, timeLimit: 10 };
    default:
      return { salary: 35000, fixedExpenses: 25000, cash: DEFAULT_CASH, passiveIncomeTarget: 50000, timeLimit: 10 };
  }
};

// Indian Themed Game Events
const indianEvents: GameEvent[] = [
  { id: "wedding", title: "Family Wedding", description: "Contribute to a family wedding.", cost: 100000, type: "expense" },
  { id: "festival", title: "Diwali Bonus", description: "You received a festival bonus!", cost: 50000, type: "income" },
  { id: "medical", title: "Medical Emergency", description: "Unexpected hospital bill.", cost: 50000, type: "expense" },
];

// Calculate Returns on Investments
const calculateReturns = (investments: Record<Asset, number>) => {
  return Object.entries(investments).reduce((total, [asset, amount]) => {
    return total + amount * (investmentReturns[asset as Asset] / 12); // Monthly returns
  }, 0);
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      startDate: new Date(),  // Add startDate
      currentDate: new Date(), // Add currentDate
      startTime: 0,
      currentTime: 0,
      timeScale: 1,
      difficulty: "easy",
      ...getInitialState("easy"),
      cash: getInitialState("easy").cash,
      netWorth: getInitialState("easy").cash,
      passiveIncome: 0,
      investments: { savings: 0, fixedDeposit: 0, ppf: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0 },
      events: [],
      isGameOver: false,
      aiNetWorth: getInitialState("easy").cash,
      gameSpeed: 1,

      // Set Difficulty
      setDifficulty: (difficulty) => {
        set({ difficulty, ...getInitialState(difficulty) });
      },

      // Initialize Game
      initializeGame: () => {
        const { difficulty } = get();
        const initialState = getInitialState(difficulty);
        set({
          startTime: Date.now(),
          currentTime: Date.now(),
          startDate: new Date(),  // Add startDate initialization
          currentDate: new Date(), // Add currentDate initialization
          ...initialState,
          cash: initialState.cash,
          netWorth: initialState.cash,
          passiveIncome: 0,
          investments: { savings: 0, fixedDeposit: 0, ppf: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0 },
          events: [],
          isGameOver: false,
          aiNetWorth: initialState.cash,
          gameSpeed: 1,
        });

        setInterval(get().advanceTime, 1000);
      },

      // Advance Time
      advanceTime: () => {
        const state = get();
        const elapsedTime = Date.now() - state.startTime;
        const newTimeScale = Math.max(0.1, 1 - (elapsedTime / GAME_DURATION) * 0.9);
        const aiGrowth = state.aiNetWorth * AI_GROWTH_RATE;

        const returns = calculateReturns(state.investments);

        if (elapsedTime >= GAME_DURATION) {
          set({ isGameOver: true });
          return;
        }

        // Random event trigger (after 2 minutes)
        if (elapsedTime > 120000 && Math.random() < 0.02 * newTimeScale) {
          const event = indianEvents[Math.floor(Math.random() * indianEvents.length)];
          get().handleEvent(event);
        }

        set({
          currentTime: Date.now(),
          timeScale: newTimeScale,
          aiNetWorth: state.aiNetWorth + aiGrowth,
          cash: state.cash + state.salary - state.fixedExpenses + returns,
          netWorth: state.netWorth + returns,
          passiveIncome: returns,
        });
      },

      // Handle Events
      handleEvent: (event) => {
        set((state) => ({
          cash: Math.max(0, state.cash + (event.type === "income" ? event.cost : -event.cost)),
          netWorth: Math.max(0, state.netWorth + (event.type === "income" ? event.cost : -event.cost)),
          events: [...state.events, event],
        }));
      },

      // Invest
      invest: (asset, amount) => {
        set((state) => ({
          investments: { ...state.investments, [asset]: state.investments[asset] + amount },
          cash: state.cash - amount,
        }));
      },

      // Withdraw
      withdraw: (asset, amount) => {
        set((state) => ({
          investments: { ...state.investments, [asset]: Math.max(0, state.investments[asset] - amount) },
          cash: state.cash + amount,
        }));
      },

      // End Game
      endGame: () => {
        set({ isGameOver: true });
      },
    }),
    { name: "finance-sim" }
  )
);
