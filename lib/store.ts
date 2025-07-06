import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export type Difficulty = "easy" | "medium" | "hard";
export type Asset = "savings" | "fixedDeposit" | "nifty50" | "gold" | "realestate" | "crypto";

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
  lastProcessedMonth: number;
  setDifficulty: (difficulty: Difficulty) => void;
  initializeGame: () => void;
  advanceTime: () => void;
  handleEvent: (event: GameEvent) => void;
  invest: (asset: Asset, amount: number) => void;
  withdraw: (asset: Asset, amount: number) => void;
  updateNetWorth: () => void;
  endGame: () => void;
  resetGame: () => void;
};

// Constants
const GAME_DURATION = 600000; // 10 minutes
const DEFAULT_CASH = 100000; // Default starting cash
const AI_GROWTH_RATE = 0.05 / 12; // AI grows 5% annually, divided monthly

// Investment Returns (Annualized)
const investmentReturns: Record<Asset, number> = {
  savings: 0.04,
  fixedDeposit: 0.06,
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
      return { salary: 35000, fixedExpenses: 25000, cash: 140000, passiveIncomeTarget: 50000, timeLimit: 10 };
  }
};

// Indian Themed Game Events
const indianEvents: GameEvent[] = [
  { id: "wedding", title: "Family Wedding", description: "Contribute to a family wedding.", cost: 100000, type: "expense" },
  { id: "festival", title: "Diwali Bonus", description: "You received a festival bonus!", cost: 50000, type: "income" },
  { id: "medical", title: "Medical Emergency", description: "Unexpected hospital bill.", cost: 50000, type: "expense" },
];

// Yearly events for salary increments
const createYearlyEvent = (newSalary: number, year: number): GameEvent => ({
  id: `salary-increment-${year}`,
  title: "Annual Appraisal",
  description: `Your salary has been increased to ₹${(newSalary / 1000).toFixed(0)}k/year!`,
  cost: 0,
  type: "opportunity"
});

// Calculate Returns on Investments (Monthly)
const calculateReturns = (investments: Record<Asset, number>) => {
  return Object.entries(investments).reduce((total, [asset, amount]) => {
    return total + amount * (investmentReturns[asset as Asset] / 12); // Monthly returns from annual rate
  }, 0);
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      startDate: new Date(),  // Add startDate
      currentDate: new Date(), // Add currentDate
      lastProcessedMonth: 0, // Track last processed month to prevent duplicate updates
      startTime: 0,
      currentTime: 0,
      timeScale: 1,
      difficulty: "easy",
      ...getInitialState("easy"),
      cash: getInitialState("easy").cash,
      netWorth: getInitialState("easy").cash,
      passiveIncome: 0,
      investments: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0 },
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
          startDate: new Date(),
          currentDate: new Date(),
          lastProcessedMonth: 0,
          ...initialState,
          cash: initialState.cash,
          netWorth: initialState.cash,
          passiveIncome: 0,
          investments: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0 },
          events: [],
          isGameOver: false,
          aiNetWorth: initialState.cash,
          gameSpeed: 1,
        });

        // Timer will be managed by the play page, not here
      },

      // Advance Time
      advanceTime: () => {
        const state = get();
        const now = Date.now();
        const elapsedTime = now - state.startTime;
        
        // Only process time updates every 100ms to avoid excessive calls
        if (now - state.currentTime < 100) {
          return;
        }
        
        const newTimeScale = Math.max(0.1, 1 - (elapsedTime / GAME_DURATION) * 0.9);
        const aiGrowth = state.aiNetWorth * AI_GROWTH_RATE;

        // Add basic timer debug every 3 seconds
        if (Math.floor(elapsedTime / 3000) > Math.floor((elapsedTime - 100) / 3000)) {
          console.log(`Timer running - Elapsed: ${Math.floor(elapsedTime/1000)}s, Cash: ₹${state.cash.toLocaleString()}`);
        }

        if (elapsedTime >= GAME_DURATION) {
          set({ isGameOver: true });
          return;
        }

        // Random event trigger (after 2 minutes)
        if (elapsedTime > 120000 && Math.random() < 0.02 * newTimeScale) {
          const event = indianEvents[Math.floor(Math.random() * indianEvents.length)];
          get().handleEvent(event);
        }

        // Calculate how many months have passed (each 3 seconds = 1 month in game time for testing)
        const monthsElapsed = Math.floor(elapsedTime / 3000); // 3 seconds = 1 month
        
        // Update current date based on elapsed time
        const gameStartDate = new Date(state.startDate);
        const currentGameDate = new Date(gameStartDate);
        currentGameDate.setMonth(gameStartDate.getMonth() + monthsElapsed);

        // Only process if we've moved to a new month
        if (monthsElapsed > state.lastProcessedMonth) {
          console.log(`Processing month ${monthsElapsed} (last processed: ${state.lastProcessedMonth})`);
          
          let newCash = state.cash;
          let newSalary = state.salary;
          let newExpenses = state.fixedExpenses;
          let newEvents = [...state.events];
          
          // Apply monthly investment returns
          const monthlyReturns = calculateReturns(state.investments);
          console.log(`Monthly returns: ₹${monthlyReturns.toLocaleString()}`);
          
          // Apply monthly salary and expenses (1/12 of annual amounts)
          const monthlySalary = newSalary / 12;
          const monthlyExpenses = newExpenses / 12;
          const monthlyNetIncome = monthlySalary - monthlyExpenses;
          
          newCash += monthlyReturns + monthlyNetIncome;
          console.log(`Monthly salary: ₹${monthlySalary.toLocaleString()}, Monthly expenses: ₹${monthlyExpenses.toLocaleString()}`);
          console.log(`Monthly net income: ₹${monthlyNetIncome.toLocaleString()}, Total cash change: ₹${(monthlyReturns + monthlyNetIncome).toLocaleString()}`);
          console.log(`New cash: ₹${newCash.toLocaleString()}`);
          
          // Check if we've completed a full year (12 months)
          const isYearEnd = monthsElapsed > 0 && monthsElapsed % 12 === 0;
          
          if (isYearEnd) {
            console.log(`🎉 YEAR END! Month: ${monthsElapsed}, Current cash: ₹${newCash.toLocaleString()}`);
            
            // Calculate which year we just completed
            const completedYear = Math.floor(monthsElapsed / 12);
            console.log(`Completed year: ${completedYear}`);
            
            // At year end, we just increment salary and expenses for next year
            // (We've already been paying monthly throughout the year)
            const salaryIncrementRate = state.difficulty === 'easy' ? 0.08 : 
                                      state.difficulty === 'medium' ? 0.06 : 0.05;
            const expenseIncrementRate = 0.04;
            
            const salaryIncrement = newSalary * salaryIncrementRate;
            const expenseIncrement = newExpenses * expenseIncrementRate;
            
            newSalary += salaryIncrement;
            newExpenses += expenseIncrement;
            
            // Add salary increment event
            newEvents.push({
              id: Date.now().toString(),
              title: "Annual Salary Increment",
              description: `Your salary has increased by ₹${salaryIncrement.toLocaleString()} to ₹${newSalary.toLocaleString()}`,
              cost: 0,
              type: "income"
            });
            
            console.log(`Salary increased to ₹${newSalary.toLocaleString()}, Expenses increased to ₹${newExpenses.toLocaleString()}`);
          }
          
          // Calculate portfolio value
          const totalInvestments = Object.values(state.investments).reduce((acc, value) => acc + value, 0);
          const netWorth = Math.max(0, newCash) + totalInvestments;
          
          // Update state with new month processed
          set({
            currentDate: currentGameDate,
            lastProcessedMonth: monthsElapsed,
            cash: Math.max(0, newCash),
            netWorth: netWorth,
            salary: newSalary,
            fixedExpenses: newExpenses,
            events: newEvents,
            passiveIncome: monthlyReturns,
            currentTime: now,
            timeScale: newTimeScale,
            aiNetWorth: state.aiNetWorth + aiGrowth,
          });
        } else {
          // Always update the time-based state even if no month change
          set({
            currentTime: now,
            timeScale: newTimeScale,
            aiNetWorth: state.aiNetWorth + aiGrowth,
          });
        }
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
        get().updateNetWorth();
      },

      // Withdraw
      withdraw: (asset, amount) => {
        set((state) => ({
          investments: { ...state.investments, [asset]: Math.max(0, state.investments[asset] - amount) },
          cash: state.cash + amount,
        }));
        get().updateNetWorth();
      },

      // Update Net Worth
      updateNetWorth: () => {
        set((state) => {
          const totalInvestments = Object.values(state.investments).reduce((acc, value) => acc + value, 0);
          return {
            netWorth: state.cash + totalInvestments,
          };
        });
      },

      // End Game
      endGame: () => {
        set({ isGameOver: true });
      },

      // Reset Game (useful for testing)
      resetGame: () => {
        const { difficulty } = get();
        const initialState = getInitialState(difficulty);
        set({
          startTime: 0,
          currentTime: 0,
          startDate: new Date(),
          currentDate: new Date(),
          lastProcessedMonth: 0,
          ...initialState,
          cash: initialState.cash,
          netWorth: initialState.cash,
          passiveIncome: 0,
          investments: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0 },
          events: [],
          isGameOver: false,
          aiNetWorth: initialState.cash,
          gameSpeed: 1,
        });
      },
    }),
    { name: "finance-sim" }
  )
);