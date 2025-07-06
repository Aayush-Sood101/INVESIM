import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export type Difficulty = "easy" | "medium" | "hard";
export type Asset = "savings" | "fixedDeposit" | "nifty50" | "gold" | "realestate" | "crypto" | "reliance" | "tcs" | "hdfc" | "infosys" | "bitcoin" | "ethereum" | "cardano" | "polygon" | "mumbai" | "bangalore" | "delhi" | "pune";

export type Stock = {
  symbol: string;
  name: string;
  currentPrice: number;
  basePrice: number;
  change24h: number;
  volume: number;
  volatility: number; // How much the price can swing (0.1 = 10% max swing)
};

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
  investments: Record<Asset, number>; // Principal amounts only
  investmentProfits: Record<Asset, number>; // Accumulated profits/returns
  stocks: Record<string, Stock>; // Stock market data
  cryptos: Record<string, Stock>; // Crypto market data
  realEstates: Record<string, Stock>; // Real estate market data
  stockQuantities: Record<string, number>; // Actual stock quantities owned
  cryptoQuantities: Record<string, number>; // Actual crypto quantities owned
  realEstateQuantities: Record<string, number>; // Actual real estate quantities owned
  events: GameEvent[];
  currentEvent: GameEvent | null; // Current event being displayed
  showEventModal: boolean; // Whether to show event modal
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
  monthlyNetIncome: number; // Add this to track current monthly net income
  pausedTime: number; // Total time spent paused (in milliseconds)
  lastPauseStart: number; // When the current pause started (if paused)
  isPaused: boolean; // Whether the game is currently paused
  gameTime: number; // Game time that doesn't advance when paused
  lastAdvanceTime: number; // Last time we actually advanced the game
  lastEventTime: number; // Last time an event was triggered (in game time)
  setPaused: (paused: boolean) => void; // Function to set pause state
  setDifficulty: (difficulty: Difficulty) => void;
  initializeGame: () => void;
  advanceTime: () => void;
  handleEvent: (event: GameEvent) => void;
  setCurrentEvent: (event: GameEvent | null) => void;
  setShowEventModal: (show: boolean) => void;
  payExpenseWithCash: (event: GameEvent) => void;
  payExpenseWithInvestments: (event: GameEvent) => void;
  invest: (asset: Asset, amount: number) => void;
  withdraw: (asset: Asset, amount: number) => void;
  updateNetWorth: () => void;
  endGame: () => void;
  resetGame: () => void;
  buyStock: (stockSymbol: string, quantity: number) => void;
  sellStock: (stockSymbol: string, quantity: number) => void;
  buyCrypto: (cryptoSymbol: string, quantity: number) => void;
  sellCrypto: (cryptoSymbol: string, quantity: number) => void;
  buyRealEstate: (realEstateSymbol: string, quantity: number) => void;
  sellRealEstate: (realEstateSymbol: string, quantity: number) => void;
};

// Constants
const GAME_DURATION = 600000; // 10 minutes
const DEFAULT_CASH = 100000; // Default starting cash

// Investment Returns (Annualized) - stocks will have dynamic returns
const investmentReturns: Record<Asset, number> = {
  savings: 0.04,
  fixedDeposit: 0.06,
  nifty50: 0.10,
  gold: 0.08,
  realestate: 0.12,
  crypto: 0.20, // Keep this for legacy purposes
  // Individual stocks - these will be calculated dynamically based on price movements
  reliance: 0.15,
  tcs: 0.18,
  hdfc: 0.14,
  infosys: 0.16,
  // Individual cryptos - these will be calculated dynamically based on price movements
  bitcoin: 0.25,
  ethereum: 0.30,
  cardano: 0.35,
  polygon: 0.40,
  // Individual real estate properties
  mumbai: 0.18,
  bangalore: 0.16,
  delhi: 0.17,
  pune: 0.15,
};

// Initial stock data
const initialStocks: Record<string, Stock> = {
  reliance: {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    basePrice: 2500,
    currentPrice: 2500,
    change24h: 0,
    volume: 1000000,
    volatility: 0.12 // 12% volatility
  },
  tcs: {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    basePrice: 3600,
    currentPrice: 3600,
    change24h: 0,
    volume: 800000,
    volatility: 0.10 // 10% volatility
  },
  hdfc: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    basePrice: 1600,
    currentPrice: 1600,
    change24h: 0,
    volume: 1200000,
    volatility: 0.08 // 8% volatility
  },
  infosys: {
    symbol: "INFY",
    name: "Infosys Ltd",
    basePrice: 1500,
    currentPrice: 1500,
    change24h: 0,
    volume: 900000,
    volatility: 0.11 // 11% volatility
  }
};

// Initial crypto data - highly volatile
const initialCryptos: Record<string, Stock> = {
  bitcoin: {
    symbol: "BTC",
    name: "Bitcoin",
    basePrice: 50000,
    currentPrice: 50000,
    change24h: 0,
    volume: 5000000,
    volatility: 0.25 // 25% volatility - very high!
  },
  ethereum: {
    symbol: "ETH",
    name: "Ethereum",
    basePrice: 3500,
    currentPrice: 3500,
    change24h: 0,
    volume: 3000000,
    volatility: 0.30 // 30% volatility - extremely high!
  },
  cardano: {
    symbol: "ADA",
    name: "Cardano",
    basePrice: 50,
    currentPrice: 50,
    change24h: 0,
    volume: 2000000,
    volatility: 0.35 // 35% volatility - extreme!
  },
  polygon: {
    symbol: "MATIC",
    name: "Polygon",
    basePrice: 80,
    currentPrice: 80,
    change24h: 0,
    volume: 1500000,
    volatility: 0.40 // 40% volatility - insane!
  }
};

// Initial real estate properties
const initialRealEstates: Record<string, Stock> = {
  mumbai: {
    symbol: "MUM",
    name: "Mumbai Property",
    basePrice: 1500000, // ₹15 lakhs per property
    currentPrice: 1500000,
    change24h: 0,
    volume: 100,
    volatility: 0.08 // 8% volatility - moderate
  },
  bangalore: {
    symbol: "BLR",
    name: "Bangalore Property",
    basePrice: 1200000, // ₹12 lakhs per property
    currentPrice: 1200000,
    change24h: 0,
    volume: 150,
    volatility: 0.10 // 10% volatility
  },
  delhi: {
    symbol: "DEL",
    name: "Delhi Property",
    basePrice: 1800000, // ₹18 lakhs per property
    currentPrice: 1800000,
    change24h: 0,
    volume: 80,
    volatility: 0.07 // 7% volatility - more stable
  },
  pune: {
    symbol: "PUN",
    name: "Pune Property",
    basePrice: 900000, // ₹9 lakhs per property
    currentPrice: 900000,
    change24h: 0,
    volume: 200,
    volatility: 0.12 // 12% volatility
  }
};

// Get Initial State Based on Difficulty
const getInitialState = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "easy":
      return { salary: 720000, fixedExpenses: 0, cash: 200000, passiveIncomeTarget: 480000, timeLimit: 10 }; // ₹60k/month salary, no expenses
    case "medium":
      return { salary: 600000, fixedExpenses: 0, cash: 150000, passiveIncomeTarget: 540000, timeLimit: 10 }; // ₹50k/month salary, no expenses
    case "hard":
      return { salary: 480000, fixedExpenses: 0, cash: 100000, passiveIncomeTarget: 600000, timeLimit: 10 }; // ₹40k/month salary, no expenses
    default:
      return { salary: 480000, fixedExpenses: 0, cash: 140000, passiveIncomeTarget: 600000, timeLimit: 10 };
  }
};

// AI Difficulty Settings - varying competitiveness and volatility
const getAISettings = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "easy":
      return { 
        baseReturnRate: 0.10, // 10% base annual return (boosted from 8%)
        expenseMultiplier: 0.0, // No expenses for AI
        investmentRatio: 0.65, // 65% of net worth invested (increased)
        volatility: 0.15 // 15% volatility - can have losses
      };
    case "medium":
      return { 
        baseReturnRate: 0.15, // 15% base annual return (boosted from 12%)
        expenseMultiplier: 0.0, // No expenses for AI
        investmentRatio: 0.80, // 80% of net worth invested (increased)
        volatility: 0.20 // 20% volatility - more losses possible
      };
    case "hard":
      return { 
        baseReturnRate: 0.20, // 20% base annual return (boosted from 16%)
        expenseMultiplier: 0.0, // No expenses for AI
        investmentRatio: 0.90, // 90% of net worth invested (increased)
        volatility: 0.25 // 25% volatility - significant losses possible
      };
    default:
      return { 
        baseReturnRate: 0.15, 
        expenseMultiplier: 0.75, 
        investmentRatio: 0.80, 
        volatility: 0.20 
      };
  }
};

// Indian Themed Game Events
const indianEvents: GameEvent[] = [
  { id: "wedding", title: "Family Wedding", description: "Contribute to a family wedding celebration.", cost: 100000, type: "expense" },
  { id: "festival", title: "Annual Bonus", description: "You received your annual performance bonus from your company!", cost: 50000, type: "income" },
  { id: "medical", title: "Medical Emergency", description: "Unexpected hospital bill for family member.", cost: 75000, type: "expense" },
  { id: "electricity", title: "High Electricity Bill", description: "Summer AC usage resulted in high electricity bill.", cost: 15000, type: "expense" },
  { id: "vehicle", title: "Vehicle Repair", description: "Your vehicle needs major repairs.", cost: 30000, type: "expense" },
  { id: "education", title: "Education Fees", description: "Annual school/college fees for family member.", cost: 45000, type: "expense" },
  { id: "house-rent", title: "House Rent Increase", description: "Landlord increased monthly rent.", cost: 20000, type: "expense" },
  { id: "baby", title: "New Baby Expenses", description: "Baby arrival brings new expenses.", cost: 60000, type: "expense" },
  { id: "travel", title: "Family Emergency Travel", description: "Urgent travel for family emergency.", cost: 25000, type: "expense" },
  { id: "bonus", title: "Performance Bonus", description: "You received a performance bonus!", cost: 75000, type: "income" },
  { id: "investment", title: "Investment Returns", description: "Unexpected returns from old investment.", cost: 40000, type: "income" },
  { id: "insurance", title: "Insurance Premium", description: "Annual insurance premium due.", cost: 35000, type: "expense" },
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
      monthlyNetIncome: (getInitialState("easy").salary - getInitialState("easy").fixedExpenses) / 12,
      pausedTime: 0, // Total time spent paused
      lastPauseStart: 0, // When the current pause started
      isPaused: false, // Whether the game is currently paused
      gameTime: 0, // Game time that doesn't advance when paused
      lastAdvanceTime: 0, // Last time we actually advanced the game
      lastEventTime: 0, // Last time an event was triggered (in game time)
      startTime: 0,
      currentTime: 0,
      timeScale: 1,
      difficulty: "easy",
      ...getInitialState("easy"),
      cash: getInitialState("easy").cash,
      netWorth: getInitialState("easy").cash,
      passiveIncome: 0,
      investments: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0, reliance: 0, tcs: 0, hdfc: 0, infosys: 0, bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0, mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
      investmentProfits: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0, reliance: 0, tcs: 0, hdfc: 0, infosys: 0, bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0, mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
      stocks: initialStocks,
      cryptos: initialCryptos,
      realEstates: initialRealEstates,
      stockQuantities: { reliance: 0, tcs: 0, hdfc: 0, infosys: 0 },
      cryptoQuantities: { bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0 },
      realEstateQuantities: { mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
      events: [],
      currentEvent: null,
      showEventModal: false,
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
        const now = Date.now();
        set({
          startTime: now,
          currentTime: now,
          gameTime: 0,
          lastAdvanceTime: now,
          lastEventTime: 0,
          startDate: new Date(),
          currentDate: new Date(),
          lastProcessedMonth: 0,
          monthlyNetIncome: (initialState.salary - initialState.fixedExpenses) / 12,
          ...initialState,
          cash: initialState.cash,
          netWorth: initialState.cash,
          passiveIncome: 0,
          investments: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0, reliance: 0, tcs: 0, hdfc: 0, infosys: 0, bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0, mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
          investmentProfits: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0, reliance: 0, tcs: 0, hdfc: 0, infosys: 0, bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0, mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
          stocks: { ...initialStocks }, // Reset stocks to initial prices
          cryptos: { ...initialCryptos }, // Reset cryptos to initial prices
          realEstates: { ...initialRealEstates }, // Reset real estate to initial prices
          stockQuantities: { reliance: 0, tcs: 0, hdfc: 0, infosys: 0 },
          cryptoQuantities: { bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0 },
          realEstateQuantities: { mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
          events: [],
          currentEvent: null,
          showEventModal: false,
          isGameOver: false,
          aiNetWorth: initialState.cash,
          gameSpeed: 1,
        });

        // Timer will be managed by the play page, not here
      },

      // Advance Time
      advanceTime: () => {
        const state = get();
        
        // Don't advance time if game is paused
        if (state.isPaused) {
          console.log(`🛑 AdvanceTime BLOCKED - Game is paused`);
          // Just update currentTime for frame tracking, but keep lastAdvanceTime and gameTime unchanged
          set({ currentTime: Date.now() });
          return;
        }
        
        const now = Date.now();
        
        // Only process time updates every 100ms to avoid excessive calls
        if (now - state.currentTime < 100) {
          return;
        }
        
        // Calculate game time advancement using last time we actually advanced
        // This ensures no time accumulates during pause periods
        const lastAdvance = state.lastAdvanceTime || state.startTime;
        const timeDelta = now - lastAdvance;
        const newGameTime = state.gameTime + timeDelta;
        
        console.log(`⏰ Game RUNNING - GameTime: ${Math.floor(state.gameTime/1000)}s → ${Math.floor(newGameTime/1000)}s (delta: ${Math.floor(timeDelta/1000)}s)`);
        
        const newTimeScale = Math.max(0.1, 1 - (newGameTime / GAME_DURATION) * 0.9);

        // Add basic timer debug every 3 seconds
        if (Math.floor(newGameTime / 3000) > Math.floor(state.gameTime / 3000)) {
          // Timer running silently - reduced logging for better performance
        }

        if (newGameTime >= GAME_DURATION) {
          set({ isGameOver: true });
          return;
        }

        // Random event trigger with 15-second minimum interval
        // Only trigger events if it's been at least 15 seconds since the last event
        if (newGameTime > 60000) { // After 1 minute
          const timeSinceLastEvent = newGameTime - state.lastEventTime;
          const minEventInterval = 15000; // 15 seconds minimum between events
          
          // Only check for events if enough time has passed since the last one
          if (timeSinceLastEvent >= minEventInterval) {
            // Reduced probability for expense events
            const shouldTriggerExpense = Math.random() < 0.002; // Very low probability
            
            if (shouldTriggerExpense) {
              // Filter to only expense events
              const expenseEvents = indianEvents.filter(event => event.type === "expense");
              const event = expenseEvents[Math.floor(Math.random() * expenseEvents.length)];
              
              set((state) => ({
                currentEvent: event,
                showEventModal: true,
                lastEventTime: newGameTime, // Update last event time
                events: [...state.events, { ...event, id: 'expense' }], // Mark as expense for tracking
              }));
            }
            // Income events with slightly higher probability but still controlled
            else if (Math.random() < 0.005) { // Slightly higher probability for income events
              const incomeEvents = indianEvents.filter(event => event.type === "income");
              if (incomeEvents.length > 0) {
                const event = incomeEvents[Math.floor(Math.random() * incomeEvents.length)];
                set((state) => ({
                  currentEvent: event,
                  showEventModal: true, // Show modal for income events too!
                  lastEventTime: newGameTime, // Update last event time
                  events: [...state.events, event],
                  cash: state.cash + event.cost,
                  netWorth: state.netWorth + event.cost,
                }));
              }
            }
          } else {
            // Silently block events that are too frequent
            // Events will try again on the next game loop
          }
        }

        // Calculate how many months have passed (each 5 seconds = 1 month in game time)
        // 600 seconds total ÷ 10 years = 60 seconds per year ÷ 12 months = 5 seconds per month
        const monthsElapsed = Math.floor(newGameTime / 5000); // 5 seconds = 1 month
        
        // Update current date based on elapsed time
        const gameStartDate = new Date(state.startDate);
        const currentGameDate = new Date(gameStartDate);
        currentGameDate.setMonth(gameStartDate.getMonth() + monthsElapsed);

        // Only process if we've moved to a new month
        if (monthsElapsed > state.lastProcessedMonth) {
          // Processing new month silently
          
          let newCash = state.cash;
          let newSalary = state.salary;
          let newEvents = [...state.events];
          let newAiNetWorth = state.aiNetWorth;
          
          // Update stock prices dynamically every month
          let updatedStocks = { ...state.stocks };
          Object.entries(updatedStocks).forEach(([symbol, stock]) => {
            // Generate random price movement within volatility range
            const randomFactor = (Math.random() - 0.5) * 2; // Range: -1 to 1
            const priceChange = stock.currentPrice * stock.volatility * randomFactor;
            const newPrice = Math.max(stock.basePrice * 0.5, stock.currentPrice + priceChange); // Don't go below 50% of base price
            
            // Calculate 24h change percentage
            const change24h = ((newPrice - stock.currentPrice) / stock.currentPrice) * 100;
            
            updatedStocks[symbol] = {
              ...stock,
              currentPrice: newPrice,
              change24h: change24h
            };
          });
          
          // Update crypto prices dynamically every month - highly volatile!
          let updatedCryptos = { ...state.cryptos };
          Object.entries(updatedCryptos).forEach(([symbol, crypto]) => {
            // Generate random price movement within volatility range (cryptos are much more volatile)
            const randomFactor = (Math.random() - 0.5) * 2; // Range: -1 to 1
            const priceChange = crypto.currentPrice * crypto.volatility * randomFactor;
            const newPrice = Math.max(crypto.basePrice * 0.3, crypto.currentPrice + priceChange); // Don't go below 30% of base price (more volatile)
            
            // Calculate 24h change percentage
            const change24h = ((newPrice - crypto.currentPrice) / crypto.currentPrice) * 100;
            
            updatedCryptos[symbol] = {
              ...crypto,
              currentPrice: newPrice,
              change24h: change24h
            };
          });
          
          // Update real estate prices dynamically every month - moderate volatility
          let updatedRealEstates = { ...state.realEstates };
          Object.entries(updatedRealEstates).forEach(([symbol, realEstate]) => {
            // Generate random price movement within volatility range (real estate is less volatile than crypto)
            const randomFactor = (Math.random() - 0.5) * 2; // Range: -1 to 1
            const priceChange = realEstate.currentPrice * realEstate.volatility * randomFactor;
            const newPrice = Math.max(realEstate.basePrice * 0.7, realEstate.currentPrice + priceChange); // Don't go below 70% of base price
            
            // Calculate 24h change percentage
            const change24h = ((newPrice - realEstate.currentPrice) / realEstate.currentPrice) * 100;
            
            updatedRealEstates[symbol] = {
              ...realEstate,
              currentPrice: newPrice,
              change24h: change24h
            };
          });
          
          // Update stock-based investment returns based on current prices
          const updatedInvestmentReturns = { ...investmentReturns };
          Object.entries(updatedStocks).forEach(([assetKey, stock]) => {
            if (assetKey in updatedInvestmentReturns) {
              // Calculate return based on monthly price change, not base price
              const monthlyChange = (stock.currentPrice - state.stocks[assetKey].currentPrice) / state.stocks[assetKey].currentPrice;
              // Convert to annualized return (monthly change * 12)
              updatedInvestmentReturns[assetKey as Asset] = monthlyChange * 12;
            }
          });
          
          // Update crypto-based investment returns based on current prices
          Object.entries(updatedCryptos).forEach(([assetKey, crypto]) => {
            if (assetKey in updatedInvestmentReturns) {
              // Calculate return based on monthly price change, not base price
              const monthlyChange = (crypto.currentPrice - state.cryptos[assetKey].currentPrice) / state.cryptos[assetKey].currentPrice;
              // Convert to annualized return (monthly change * 12)
              updatedInvestmentReturns[assetKey as Asset] = monthlyChange * 12;
            }
          });
          
          // Update real estate-based investment returns based on current prices
          Object.entries(updatedRealEstates).forEach(([assetKey, realEstate]) => {
            if (assetKey in updatedInvestmentReturns) {
              // Calculate return based on monthly price change, not base price
              const monthlyChange = (realEstate.currentPrice - state.realEstates[assetKey].currentPrice) / state.realEstates[assetKey].currentPrice;
              // Convert to annualized return (monthly change * 12)
              updatedInvestmentReturns[assetKey as Asset] = monthlyChange * 12;
            }
          });
          
          // Apply monthly AI growth - AI also gets salary and investment returns like player
          // BUT: Pause AI growth when player is handling an expense modal
          if (!state.showEventModal) {
            const aiSettings = getAISettings(state.difficulty);
            
            // AI gets same monthly income as player (no expenses)
            const aiMonthlySalary = newSalary / 12; // AI has same salary progression
            const aiMonthlyNetIncome = aiMonthlySalary; // Full salary since no expenses
            
            // AI investment returns with volatility - can have losses!
            const aiInvestedAmount = newAiNetWorth * aiSettings.investmentRatio;
            let aiBaseMonthlyReturn = (aiInvestedAmount * aiSettings.baseReturnRate) / 12;
            
            // Add volatility to AI returns - can be negative!
            const volatilityFactor = (Math.random() - 0.5) * 2; // Range: -1 to 1
            const aiReturnMultiplier = 1 + (volatilityFactor * aiSettings.volatility);
            const aiInvestmentReturns = aiBaseMonthlyReturn * aiReturnMultiplier;
            
            // AI Bonus Events System - AI gets smart financial decisions and windfalls
            let aiMonthlyBonus = 0;
            
            // Monthly chance for AI to get bonus events (similar to player income events)
            if (Math.random() < 0.08) { // 8% chance per month for bonus
              const bonusTypes = [
                { name: "Smart Investment Move", multiplier: 0.15 }, // 15% of net worth
                { name: "Side Business Profit", multiplier: 0.08 }, // 8% of net worth  
                { name: "Freelance Income", multiplier: 0.05 }, // 5% of net worth
                { name: "Investment Windfall", multiplier: 0.12 }, // 12% of net worth
                { name: "Property Appreciation", multiplier: 0.10 }, // 10% of net worth
              ];
              
              const bonusEvent = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
              aiMonthlyBonus = newAiNetWorth * bonusEvent.multiplier;
            }
            
            const totalAiMonthlyGrowth = aiMonthlyNetIncome + aiInvestmentReturns + aiMonthlyBonus;
            newAiNetWorth = Math.max(0, newAiNetWorth + totalAiMonthlyGrowth); // Prevent negative net worth
          } else {
            // AI growth paused during expense modal
          }
          
          // Apply monthly investment returns - separate principal from profits
          let updatedInvestmentProfits = { ...state.investmentProfits };
          let totalCashDividends = 0;
          
          // Calculate returns for each asset based on principal + accumulated profits
          Object.entries(state.investments).forEach(([asset, principalAmount]) => {
            if (principalAmount > 0) {
              const currentProfits = state.investmentProfits[asset as Asset];
              const totalInvestedValue = principalAmount + currentProfits; // Principal + profits
              
              let monthlyReturnRate = updatedInvestmentReturns[asset as Asset] / 12;
              
              // Add volatility to traditional investments - they can have losses too!
              if (['savings', 'fixedDeposit', 'nifty50', 'gold'].includes(asset)) {
                // Add random variation: ±50% of the base return rate
                const volatilityFactor = (Math.random() - 0.5) * 2 * 0.5; // ±50%
                monthlyReturnRate = monthlyReturnRate * (1 + volatilityFactor);
              }
              
              const totalMonthlyReturn = totalInvestedValue * monthlyReturnRate;
              
              // 70% gets added to profits (compound growth), 30% paid as cash dividend
              const profitIncrease = totalMonthlyReturn * 0.7;
              const cashDividend = totalMonthlyReturn * 0.3;
              
              updatedInvestmentProfits[asset as Asset] += profitIncrease;
              totalCashDividends += cashDividend;
            }
          });
          
          // Add cash dividends to player's cash (silently)
          newCash += totalCashDividends;
          
          // Apply monthly salary (full salary with no expenses)
          const monthlySalary = newSalary / 12;
          const monthlyNetIncome = monthlySalary; // Full salary since no expenses
          
          newCash += totalCashDividends + monthlyNetIncome;
          
          // Check if we've completed a full year (12 months)
          const isYearEnd = monthsElapsed > 0 && monthsElapsed % 12 === 0;
          
          if (isYearEnd) {
            // Calculate which year we just completed
            const completedYear = Math.floor(monthsElapsed / 12);
            
            // At year end, we just increment salary and expenses for next year
            // (We've already been paying monthly throughout the year)
            const salaryIncrementRate = state.difficulty === 'easy' ? 0.08 : 
                                      state.difficulty === 'medium' ? 0.06 : 0.05;
            
            const salaryIncrement = newSalary * salaryIncrementRate;
            
            newSalary += salaryIncrement;
            
            // Add salary increment event
            newEvents.push({
              id: Date.now().toString(),
              title: "Annual Salary Increment",
              description: `Your salary has increased by ₹${salaryIncrement.toLocaleString()} to ₹${newSalary.toLocaleString()}`,
              cost: 0,
              type: "income"
            });
            
            // AI Yearly Performance Bonus - AI gets smart about major financial decisions
            const aiYearlyBonus = newAiNetWorth * 0.12; // 12% of net worth as yearly bonus
            newAiNetWorth += aiYearlyBonus;
          }
          
          // Calculate portfolio value with updated profits
          const totalPrincipal = Object.values(state.investments).reduce((acc, value) => acc + value, 0);
          const totalProfits = Object.values(updatedInvestmentProfits).reduce((acc, value) => acc + value, 0);
          const totalInvestments = totalPrincipal + totalProfits;
          const netWorth = Math.max(0, newCash) + totalInvestments;
          
          // Store the current monthly net income for display (full salary since no expenses)
          const currentMonthlyNetIncome = newSalary / 12;
          
          // Update state with new month processed
          set({
            currentDate: currentGameDate,
            lastProcessedMonth: monthsElapsed,
            cash: Math.max(0, newCash),
            netWorth: netWorth,
            investments: state.investments, // Principal amounts stay the same
            investmentProfits: updatedInvestmentProfits, // Only profits change
            stocks: updatedStocks, // Update stock prices
            cryptos: updatedCryptos, // Update crypto prices
            realEstates: updatedRealEstates, // Update real estate prices
            salary: newSalary,
            fixedExpenses: 0, // Always 0 since no expenses
            monthlyNetIncome: currentMonthlyNetIncome,
            events: newEvents,
            passiveIncome: totalCashDividends,
            currentTime: now,
            gameTime: newGameTime,
            lastAdvanceTime: now,
            timeScale: newTimeScale,
            aiNetWorth: newAiNetWorth, // Use the monthly calculated AI growth
          });
        } else {
          // Always update the time-based state even if no month change
          set({
            currentTime: now,
            gameTime: newGameTime,
            lastAdvanceTime: now,
            timeScale: newTimeScale,
            // Remove aiNetWorth update here - it should only update monthly
          });
        }
      },

      // Handle Events
      handleEvent: (event) => {
        // Set current event and show modal for expenses, just add income directly
        if (event.type === "expense") {
          set((state) => ({
            currentEvent: event,
            showEventModal: true,
            events: [...state.events, event],
          }));
        } else {
          // Income events are applied directly
          set((state) => ({
            cash: Math.max(0, state.cash + event.cost),
            netWorth: Math.max(0, state.netWorth + event.cost),
            events: [...state.events, event],
          }));
        }
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
        set((state) => {
          const currentPrincipal = state.investments[asset];
          const currentProfits = state.investmentProfits[asset];
          const totalValue = currentPrincipal + currentProfits;
          
          if (amount > totalValue) {
            // Can't withdraw more than what you have
            return state;
          }
          
          // Calculate proportional withdrawal from principal and profits
          const principalRatio = currentPrincipal / totalValue;
          const profitRatio = currentProfits / totalValue;
          
          const principalWithdrawal = amount * principalRatio;
          const profitWithdrawal = amount * profitRatio;
          
          return {
            ...state,
            investments: { 
              ...state.investments, 
              [asset]: Math.max(0, currentPrincipal - principalWithdrawal) 
            },
            investmentProfits: { 
              ...state.investmentProfits, 
              [asset]: Math.max(0, currentProfits - profitWithdrawal) 
            },
            cash: state.cash + amount,
          };
        });
        get().updateNetWorth();
      },

      // Update Net Worth
      updateNetWorth: () => {
        set((state) => {
          const totalPrincipal = Object.values(state.investments).reduce((acc, value) => acc + value, 0);
          const totalProfits = Object.values(state.investmentProfits).reduce((acc, value) => acc + value, 0);
          const totalInvestments = totalPrincipal + totalProfits;
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
          gameTime: 0,
          lastAdvanceTime: 0,
          lastEventTime: 0,
          startDate: new Date(),
          currentDate: new Date(),
          lastProcessedMonth: 0,
          monthlyNetIncome: (initialState.salary - initialState.fixedExpenses) / 12,
          ...initialState,
          cash: initialState.cash,
          netWorth: initialState.cash,
          passiveIncome: 0,
          investments: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0, reliance: 0, tcs: 0, hdfc: 0, infosys: 0, bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0, mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
          investmentProfits: { savings: 0, fixedDeposit: 0, nifty50: 0, gold: 0, realestate: 0, crypto: 0, reliance: 0, tcs: 0, hdfc: 0, infosys: 0, bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0, mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
          stocks: { ...initialStocks }, // Reset stocks to initial prices
          cryptos: { ...initialCryptos }, // Reset cryptos to initial prices
          realEstates: { ...initialRealEstates }, // Reset real estate to initial prices
          stockQuantities: { reliance: 0, tcs: 0, hdfc: 0, infosys: 0 },
          cryptoQuantities: { bitcoin: 0, ethereum: 0, cardano: 0, polygon: 0 },
          realEstateQuantities: { mumbai: 0, bangalore: 0, delhi: 0, pune: 0 },
          events: [],
          currentEvent: null,
          showEventModal: false,
          isGameOver: false,
          aiNetWorth: initialState.cash,
          gameSpeed: 1,
        });
      },

      // Stock Trading Functions
      buyStock: (stockSymbol: string, quantity: number) => {
        set((state) => {
          const stock = state.stocks[stockSymbol];
          if (!stock) return state;
          
          const totalCost = stock.currentPrice * quantity;
          if (totalCost > state.cash) return state; // Not enough cash
          
          const asset = stockSymbol as Asset;
          return {
            ...state,
            investments: { 
              ...state.investments, 
              [asset]: state.investments[asset] + totalCost 
            },
            stockQuantities: {
              ...state.stockQuantities,
              [stockSymbol]: (state.stockQuantities[stockSymbol] || 0) + quantity
            },
            cash: state.cash - totalCost,
          };
        });
        get().updateNetWorth();
      },

      sellStock: (stockSymbol: string, quantity: number) => {
        set((state) => {
          const stock = state.stocks[stockSymbol];
          if (!stock) return state;
          
          const currentQuantity = state.stockQuantities[stockSymbol] || 0;
          if (quantity > currentQuantity) return state; // Don't have enough shares
          
          const asset = stockSymbol as Asset;
          const saleValue = stock.currentPrice * quantity;
          
          // Calculate average cost per share
          const totalInvestment = state.investments[asset] || 0;
          const totalShares = currentQuantity;
          const avgCostPerShare = totalShares > 0 ? totalInvestment / totalShares : 0;
          
          // Calculate principal and profit portions
          const principalWithdrawal = avgCostPerShare * quantity;
          const profitFromSale = saleValue - principalWithdrawal;
          
          return {
            ...state,
            investments: { 
              ...state.investments, 
              [asset]: Math.max(0, totalInvestment - principalWithdrawal) 
            },
            investmentProfits: { 
              ...state.investmentProfits, 
              [asset]: (state.investmentProfits[asset] || 0) + profitFromSale
            },
            stockQuantities: {
              ...state.stockQuantities,
              [stockSymbol]: currentQuantity - quantity
            },
            cash: state.cash + saleValue,
          };
        });
        get().updateNetWorth();
      },

      // Crypto Trading Functions
      buyCrypto: (cryptoSymbol: string, quantity: number) => {
        set((state) => {
          const crypto = state.cryptos[cryptoSymbol];
          if (!crypto) return state;
          
          const totalCost = crypto.currentPrice * quantity;
          if (totalCost > state.cash) return state; // Not enough cash
          
          const asset = cryptoSymbol as Asset;
          return {
            ...state,
            investments: { 
              ...state.investments, 
              [asset]: state.investments[asset] + totalCost 
            },
            cryptoQuantities: {
              ...state.cryptoQuantities,
              [cryptoSymbol]: (state.cryptoQuantities[cryptoSymbol] || 0) + quantity
            },
            cash: state.cash - totalCost,
          };
        });
        get().updateNetWorth();
      },

      sellCrypto: (cryptoSymbol: string, quantity: number) => {
        set((state) => {
          const crypto = state.cryptos[cryptoSymbol];
          if (!crypto) return state;
          
          const currentQuantity = state.cryptoQuantities[cryptoSymbol] || 0;
          if (quantity > currentQuantity) return state; // Don't have enough coins
          
          const asset = cryptoSymbol as Asset;
          const saleValue = crypto.currentPrice * quantity;
          
          // Calculate average cost per coin
          const totalInvestment = state.investments[asset] || 0;
          const totalCoins = currentQuantity;
          const avgCostPerCoin = totalCoins > 0 ? totalInvestment / totalCoins : 0;
          
          // Calculate principal and profit portions
          const principalWithdrawal = avgCostPerCoin * quantity;
          const profitFromSale = saleValue - principalWithdrawal;
          
          return {
            ...state,
            investments: { 
              ...state.investments, 
              [asset]: Math.max(0, totalInvestment - principalWithdrawal) 
            },
            investmentProfits: { 
              ...state.investmentProfits, 
              [asset]: (state.investmentProfits[asset] || 0) + profitFromSale
            },
            cryptoQuantities: {
              ...state.cryptoQuantities,
              [cryptoSymbol]: currentQuantity - quantity
            },
            cash: state.cash + saleValue,
          };
        });
        get().updateNetWorth();
      },

      // Buy Real Estate
      buyRealEstate: (realEstateSymbol: string, quantity: number) => {
        set((state) => {
          const realEstate = state.realEstates[realEstateSymbol];
          if (!realEstate) return state;
          
          const totalCost = realEstate.currentPrice * quantity;
          if (totalCost > state.cash) return state;
          
          const asset = realEstateSymbol as Asset;
          
          return {
            ...state,
            investments: { 
              ...state.investments, 
              [asset]: (state.investments[asset] || 0) + totalCost 
            },
            realEstateQuantities: {
              ...state.realEstateQuantities,
              [realEstateSymbol]: (state.realEstateQuantities[realEstateSymbol] || 0) + quantity
            },
            cash: state.cash - totalCost,
          };
        });
        get().updateNetWorth();
      },

      sellRealEstate: (realEstateSymbol: string, quantity: number) => {
        set((state) => {
          const realEstate = state.realEstates[realEstateSymbol];
          if (!realEstate) return state;
          
          const currentQuantity = state.realEstateQuantities[realEstateSymbol] || 0;
          if (quantity > currentQuantity) return state; // Don't have enough properties
          
          const asset = realEstateSymbol as Asset;
          const saleValue = realEstate.currentPrice * quantity;
          
          // Calculate average cost per property
          const totalInvestment = state.investments[asset] || 0;
          const totalProperties = currentQuantity;
          const avgCostPerProperty = totalProperties > 0 ? totalInvestment / totalProperties : 0;
          
          // Calculate principal and profit portions
          const principalWithdrawal = avgCostPerProperty * quantity;
          const profitFromSale = saleValue - principalWithdrawal;
          
          return {
            ...state,
            investments: { 
              ...state.investments, 
              [asset]: Math.max(0, totalInvestment - principalWithdrawal) 
            },
            investmentProfits: { 
              ...state.investmentProfits, 
              [asset]: (state.investmentProfits[asset] || 0) + profitFromSale
            },
            realEstateQuantities: {
              ...state.realEstateQuantities,
              [realEstateSymbol]: currentQuantity - quantity
            },
            cash: state.cash + saleValue,
          };
        });
        get().updateNetWorth();
      },

      // Set Current Event
      setCurrentEvent: (event) => {
        set({ currentEvent: event });
      },

      // Set Show Event Modal
      setShowEventModal: (show) => {
        set({ showEventModal: show });
      },

      // Pay for expense with cash
      payExpenseWithCash: (event: GameEvent) => {
        set((state) => ({
          cash: Math.max(0, state.cash - event.cost),
          netWorth: Math.max(0, state.netWorth - event.cost),
          events: [...state.events, event],
          currentEvent: null,
          showEventModal: false,
        }));
      },

      // Pay for expense with investments (auto-withdraw)
      payExpenseWithInvestments: (event: GameEvent) => {
        const state = get();
        let remainingCost = event.cost;
        let newInvestments = { ...state.investments };
        let newInvestmentProfits = { ...state.investmentProfits };

        // Withdraw from investments to cover the cost
        for (const asset of Object.keys(newInvestments) as Asset[]) {
          const principal = newInvestments[asset];
          const profits = newInvestmentProfits[asset];
          const totalValue = principal + profits;
          
          if (totalValue > 0 && remainingCost > 0) {
            const amountToWithdraw = Math.min(totalValue, remainingCost);
            
            // Calculate proportional withdrawal
            const principalRatio = principal / totalValue;
            const profitRatio = profits / totalValue;
            
            const principalWithdrawal = amountToWithdraw * principalRatio;
            const profitWithdrawal = amountToWithdraw * profitRatio;
            
            newInvestments[asset] = Math.max(0, principal - principalWithdrawal);
            newInvestmentProfits[asset] = Math.max(0, profits - profitWithdrawal);
            
            remainingCost -= amountToWithdraw;
          }
        }

        set((state) => ({
          investments: newInvestments,
          investmentProfits: newInvestmentProfits,
          cash: Math.max(0, state.cash - remainingCost), // Pay remaining with cash if any
          events: [...state.events, event],
          currentEvent: null,
          showEventModal: false,
        }));
        
        get().updateNetWorth();
      },

      // Set pause state
      setPaused: (paused: boolean) => {
        const state = get();
        console.log(`🎮 Setting game pause state: ${paused}`);
        
        if (paused) {
          // When pausing, save the current time as the last advance time
          // This prevents time accumulation during pause
          set({ 
            isPaused: true,
            lastAdvanceTime: Date.now()
          });
        } else {
          // When unpausing, reset the last advance time to now
          // This prevents the time jump when resuming
          set({ 
            isPaused: false,
            lastAdvanceTime: Date.now()
          });
        }
      },
    }),
    { name: "finance-sim" }
  )
);