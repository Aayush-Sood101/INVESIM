import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Difficulty = "easy" | "medium" | "hard"

export type Asset = "savings" | "fixedDeposit" | "ppf" | "nifty50" | "gold" | "realestate"

export type GameEvent = {
  id: string
  title: string
  description: string
  cost: number
  type: "expense" | "opportunity" | "income"
}

export type GameState = {
  startTime: number
  currentTime: number
  timeScale: number
  cash: number
  netWorth: number
  investments: Record<string, number>
  events: GameEvent[]
  isGameOver: boolean
  aiNetWorth: number
  gameSpeed: number
  difficulty: Difficulty
  salary: number
  fixedExpenses: number
  passiveIncomeTarget: number
  timeLimit: number
  startDate: Date
  currentDate: Date
  passiveIncome: number
  setDifficulty: (difficulty: Difficulty) => void
  initializeGame: () => void
  advanceTime: () => void
  handleEvent: (event: GameEvent) => void
  invest: (asset: Asset, amount: number) => void
  withdraw: (asset: Asset, amount: number) => void
  calculateReturns: () => void
  generateLifeEvent: () => void
  endGame: () => void
}

const MILLISECONDS_PER_MONTH = 2592000000 // 30 days

const GAME_DURATION = 600000 // 10 minutes in milliseconds

const getInitialState = (difficulty: Difficulty): Partial<GameState> => {
  const baseState = {
    startDate: new Date(),
    currentDate: new Date(),
    // gameOver: false, //moved to below
    events: [],
  }

  switch (difficulty) {
    case "easy":
      return {
        ...baseState,
        salary: 50000,
        fixedExpenses: 20000,
        passiveIncomeTarget: 30000,
        timeLimit: 20, // 20 years
        cash: 100000,
        isGameOver: false,
      }
    case "medium":
      return {
        ...baseState,
        salary: 40000,
        fixedExpenses: 20000,
        passiveIncomeTarget: 40000,
        timeLimit: 15, // 15 years
        cash: 75000,
        isGameOver: false,
      }
    case "hard":
      return {
        ...baseState,
        salary: 30000,
        fixedExpenses: 20000,
        passiveIncomeTarget: 50000,
        timeLimit: 10, // 10 years
        cash: 50000,
        isGameOver: false,
      }
  }
}

const calculateReturns = (investments: Record<Asset, number>) => {
  const returns: Record<Asset, number> = {
    savings: 0.04,
    fixedDeposit: 0.06,
    ppf: 0.07,
    nifty50: 0.1,
    gold: 0.08,
    realestate: 0.12,
  }

  let totalReturn = 0
  for (const [asset, amount] of Object.entries(investments)) {
    totalReturn += amount * returns[asset as Asset]
  }

  return totalReturn
}

const indianEvents: GameEvent[] = [
  {
    id: "wedding",
    title: "Family Wedding",
    description: "Your cousin is getting married! Contribute to the celebration.",
    cost: 200000,
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
    cost: 100000,
    type: "expense",
  },
  // Add more Indian-specific events
]

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
      },
      events: [],
      isGameOver: false,
      aiNetWorth: 0,
      gameSpeed: 1,
      setDifficulty: (difficulty) => {
        set({ difficulty, ...getInitialState(difficulty) })
      },
      initializeGame: () => {
        const { difficulty } = get()
        const initialState = getInitialState(difficulty)
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
          },
          events: [],
          isGameOver: false,
          aiNetWorth: initialState.cash || 0,
          gameSpeed: 1,
        })
      },
      advanceTime: () => {
        const state = get()
        const elapsedTime = Date.now() - state.startTime
        const progress = elapsedTime / GAME_DURATION

        // Slow down time as game progresses
        const newTimeScale = Math.max(0.1, 1 - progress * 0.9)

        // Update AI net worth with some randomness
        const aiGrowth = (Math.random() * 0.02 + 0.01) * state.aiNetWorth

        // Calculate returns
        const returns = calculateReturns(state.investments as Record<Asset, number>)

        if (elapsedTime >= GAME_DURATION) {
          set({ isGameOver: true })
          return
        }

        // Random event generation
        if (Math.random() < 0.05 * newTimeScale) {
          const event = indianEvents[Math.floor(Math.random() * indianEvents.length)]
          get().handleEvent(event)
        }

        // Update state
        set((state) => ({
          currentTime: Date.now(),
          timeScale: newTimeScale,
          aiNetWorth: state.aiNetWorth + aiGrowth,
          cash: state.cash + state.salary - state.fixedExpenses + returns,
          netWorth: state.netWorth + returns,
          passiveIncome: returns,
        }))

        // Check if game should end - removed as game ends based on GAME_DURATION
        // if (newDate.getTime() - state.startDate.getTime() >= state.timeLimit * 365 * 24 * 60 * 60 * 1000) {
        //   get().endGame()
        // } else {
        //   // Generate life event
        //   get().generateLifeEvent()
        // }
      },
      handleEvent: (event) => {
        const state = get()
        if (event.type === "expense") {
          set({
            cash: state.cash - event.cost,
            netWorth: state.netWorth - event.cost,
            events: [...state.events, event],
          })
        } else if (event.type === "income") {
          set({
            cash: state.cash + event.cost,
            netWorth: state.netWorth + event.cost,
            events: [...state.events, event],
          })
        }
      },
      invest: (asset, amount) => {
        set((state) => ({
          investments: {
            ...state.investments,
            [asset]: (state.investments[asset] as number) + amount,
          },
          cash: state.cash - amount,
          netWorth: state.netWorth,
        }))
      },
      withdraw: (asset, amount) => {
        set((state) => ({
          investments: {
            ...state.investments,
            [asset]: (state.investments[asset] as number) - amount,
          },
          cash: state.cash + amount,
          netWorth: state.netWorth,
        }))
      },
      calculateReturns: () => {
        const { investments } = get()
        return calculateReturns(investments as Record<Asset, number>)
      },
      generateLifeEvent: () => {
        //Removed as events are handled differently now.
      },
      endGame: () => {
        set({ gameOver: true })
      },
    }),
    {
      name: "wealth-builder",
    },
  ),
)

