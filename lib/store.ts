import { create } from "zustand";
import { persist } from "zustand/middleware";

// Difficulty Levels
export type Difficulty = "easy" | "medium" | "hard";

// Investment Assets
export type Asset =
  | "savings"
  | "fixedDeposit"
  | "ppf"
  | "nifty50"
  | "gold"
  | "realestate"
  | "crypto";

// Game Events
export type GameEvent = {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: "expense" | "income" | "opportunity";
};

// Game State
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
  calculateReturns: () => void;
  endGame: () => void;
};

// Game Duration (10 minutes)
const GAME_DURATION = 600000;

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
const getInitialState = (difficulty: Difficulty): Partial<GameState> => {
  const baseState = {
    startDate: new Date(),
    currentDate: new Date(),
    events: [],
  };

  switch (difficulty) {
    case "easy":
      return {
        ...baseState,
        salary: 60000,
        fixedExpenses: 25000,
        passiveIncomeTarget: 40000,
        timeLimit: 20,
        cash: 200000,
        isGameOver: false,
      };
    case "medium":
      return {
        ...baseState,
        salary: 45000,
        fixedExpenses: 25000,
        passiveIncomeTarget: 45000,
        timeLimit: 15,
        cash: 150000,
        isGameOver: false,
      };
    case "hard":
      return {
        ...baseState,
        salary: 35000,
        fixedExpenses: 25000,
        passiveIncomeTarget: 50000,
        timeLimit: 10,
        cash: 100000,
        isGameOver: false,
      };
  }
};

// Balanced Game Events
const indianEvents: GameEvent[] = [
  {
    id: "wedding",
    title: "Family Wedding",
    description: "Your cousin is getting married! Contribute to the celebration.",
    cost: 100000,
    type: "expense",
  },
  {
    id: "festival",
    title: "Diwali Bonus",
    description: "Received festival bonus from work!",
    cost: 50000,
    type: "income",
  },
  {
    id: "medical",
    title: "Medical Emergency",
    description: "Unexpected hospital visit for a family member.",
    cost: 50000, // Lowered the cost
    type: "expense",
  },
];

// Calculate Investment Returns
const calculateReturns = (investments: Record<Asset, number>) => {
  let totalReturn = 0;
  for (const [asset, amount] of Object.entries(investments)) {
    totalReturn += amount * investmentReturns[asset as Asset] / 12; // Monthly returns
  }
  return totalReturn;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      startTime: 0,
      currentTime: 0,
      timeScale: 1,
      difficulty: "easy",
      ...getInitialState("easy"),
      netWorth: 100000,
      passiveIncome: 0,
      investments: {
        savings: 0,
        fixedDeposit: 0,
        ppf: 0,
        nifty50: 0,
        gold: 0,
        realestate: 0,
        crypto: 0,
      },
      events: [],
      isGameOver: false,
      aiNetWorth: 0,
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
          ...initialState,
          netWorth: initialState.cash || 0,
          passiveIncome: 0,
          investments: {
            savings: 0,
            fixedDeposit: 0,
            ppf: 0,
            nifty50: 0,
            gold: 0,
            realestate: 0,
            crypto: 0,
          },
          events: [],
          isGameOver: false,
          aiNetWorth: initialState.cash || 0,
          gameSpeed: 1,
        });

        setInterval(get().advanceTime, 1000);
      },

      // Advance Time
      advanceTime: () => {
        const state = get();
        const elapsedTime = Date.now() - state.startTime;
        const progress = elapsedTime / GAME_DURATION;
        const newTimeScale = Math.max(0.1, 1 - progress * 0.9);
        const aiGrowth = state.aiNetWorth * (0.05 / 12); // 5% annual return, divided by 12 for monthly

        const returns = calculateReturns(state.investments);

        if (elapsedTime >= GAME_DURATION) {
          set({ isGameOver: true });
          return;
        }

        // Less frequent events (Only after 2 minutes & random chance reduced)
        if (elapsedTime > 120000 && Math.random() < 0.03 * newTimeScale) {
          const event = indianEvents[Math.floor(Math.random() * indianEvents.length)];
          get().handleEvent(event);
        }

        set((state) => ({
          currentTime: Date.now(),
          timeScale: newTimeScale,
          aiNetWorth: state.aiNetWorth + aiGrowth,
          cash: state.cash + state.salary - state.fixedExpenses + returns,
          netWorth: state.netWorth + returns,
          passiveIncome: returns,
        }));
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

      // End Game
      endGame: () => {
        set({ isGameOver: true });
      },
    }),
    { name: "finance-sim" }
  )
);
