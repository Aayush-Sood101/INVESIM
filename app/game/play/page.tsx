"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, Asset, GameEvent } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CashChangeNotification } from "@/components/ui/cash-change-notification";

// Base return rates for investment options - Traditional investments only (4 cards)
const baseInvestmentOptions: { name: string; asset: Asset; baseReturnRate: number }[] = [
  { name: "Savings", asset: "savings", baseReturnRate: 4 },
  { name: "Fixed Deposit", asset: "fixedDeposit", baseReturnRate: 6 },
  { name: "Nifty 50", asset: "nifty50", baseReturnRate: 10 },
  { name: "Gold", asset: "gold", baseReturnRate: 8 },
];

const baseGoldPrice = 5000; // Base price of gold per gram

export default function GamePlay() {
  const {
    currentTime,
    startTime,
    cash,
    netWorth,
    aiNetWorth,
    investments,
    investmentProfits,
    stocks,
    cryptos,
    realEstates,
    stockQuantities,
    cryptoQuantities,
    realEstateQuantities,
    events,
    isGameOver,
    monthlyNetIncome,
    currentEvent,
    showEventModal,
    initializeGame,
    advanceTime,
    invest,
    withdraw,
    buyStock,
    sellStock,
    buyCrypto,
    sellCrypto,
    buyRealEstate,
    sellRealEstate,
    updateNetWorth,
    handleEvent,
    setCurrentEvent,
    setShowEventModal,
    payExpenseWithCash,
    payExpenseWithInvestments,
    gameTime,
    setPaused,
  } = useGameStore();

  const animationFrameRef = useRef<number>();
  const [amounts, setAmounts] = useState<{ [key in Asset]?: number }>({});
  const [stockBuyQuantities, setStockBuyQuantities] = useState<{ [key: string]: number }>({});
  const [cryptoBuyQuantities, setCryptoBuyQuantities] = useState<{ [key: string]: number }>({});
  const [realEstateBuyQuantities, setRealEstateBuyQuantities] = useState<{ [key: string]: number }>({});
  const [customSellAmounts, setCustomSellAmounts] = useState<{ [key: string]: number }>({});
  const [showCustomAmountFor, setShowCustomAmountFor] = useState<string | null>(null);
  const [goldQuantity, setGoldQuantity] = useState<number>(0);
  const [investmentOptions, setInvestmentOptions] = useState(baseInvestmentOptions);
  const [previousRates, setPreviousRates] = useState<{ [key in Asset]?: number }>({});
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [showCashNotification, setShowCashNotification] = useState(false);
  const [cashChange, setCashChange] = useState(0);
  const [previousCash, setPreviousCash] = useState(cash);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInvestmentSelector, setShowInvestmentSelector] = useState(false);

  useEffect(() => {
    initializeGame();
    setGameStarted(true); // Trigger the starting animation

    let logCounter = 0;
    function gameLoop() {
      // Always call advanceTime - it will handle pause logic internally
      advanceTime();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Keep empty dependency array

  const progress = Math.min(1, gameTime / (10 * 60 * 1000)); // 10 minutes total
  const year = Math.floor(progress * 10); // 10 years total
  const currentMonth = Math.floor((progress * 10 * 12) % 12); // Current month (0-11)
  
  // Debug logging for time tracking
  useEffect(() => {
    console.log(`🕐 UI Update - GameTime: ${Math.floor(gameTime/1000)}s, Year: ${year}, Month: ${currentMonth}, Modal: ${showEventModal}`);
  }, [gameTime, year, currentMonth, showEventModal]);

  useEffect(() => {
    if (year > currentYear) {
      updateInvestmentRates();
      setCurrentYear(year);
    }
  }, [year, currentYear]);

  // Track cash changes for notifications
  useEffect(() => {
    if (cash > previousCash) {
      const change = cash - previousCash;
      setCashChange(change);
      setShowCashNotification(true);
    }
    setPreviousCash(cash);
  }, [cash, previousCash]);

  // Reset investment selector when modal closes and handle pause state
  useEffect(() => {
    setPaused(showEventModal);
    if (showEventModal) {
      console.log(`🛑 Game PAUSED - Modal opened`);
    } else {
      console.log(`▶️ Game RESUMED - Modal closed`);
    }
    
    if (!showEventModal) {
      setShowInvestmentSelector(false);
    }
  }, [showEventModal, setPaused]);

  const goldReturnRate = investmentOptions.find((option) => option.asset === "gold")?.baseReturnRate || 0;
  const currentGoldRate = baseGoldPrice * Math.pow(1 + goldReturnRate / 100, year);

  const updateInvestmentRates = () => {
    setPreviousRates((prevRates) =>
      investmentOptions.reduce((acc, option) => {
        acc[option.asset] = option.baseReturnRate;
        return acc;
      }, {} as { [key in Asset]?: number })
    );

    setInvestmentOptions((prevOptions) =>
      prevOptions.map((option) => {
        const change = (Math.random() - 0.5) * 0.2; // Random change between -10% and +10%
        return {
          ...option,
          baseReturnRate: Math.max(0, option.baseReturnRate * (1 + change)), // Ensure rate doesn't go negative
        };
      })
    );
  };

  const handleInvest = (asset: Asset, amount: number) => {
    if (amount <= 0 || amount > cash) {
      alert("Invalid investment amount");
      return;
    }
    invest(asset, amount);
    setAmounts((prev) => ({ ...prev, [asset]: 0 }));
    updateNetWorth();
    alert(`Invested ₹${formatCurrency(amount)} in ${asset}!`);
  };

  const handleWithdraw = (asset: Asset, amount: number) => {
    const totalValue = getTotalValue(asset);
    if (totalValue < amount || amount <= 0) {
      alert("Insufficient funds in this investment!");
      return;
    }
    withdraw(asset, amount);
    setAmounts((prev) => ({ ...prev, [asset]: 0 }));
    updateNetWorth();
    alert(`Withdrew ₹${formatCurrency(amount)} from ${asset}`);
  };

  const handleGoldInvest = (quantity: number) => {
    const amount = quantity * currentGoldRate;
    handleInvest("gold", amount);
  };

  const handleGoldWithdraw = (quantity: number) => {
    const amount = quantity * currentGoldRate;
    const totalGoldValue = getTotalValue("gold");
    if (totalGoldValue < amount || amount <= 0) {
      alert("Insufficient gold investment!");
      return;
    }
    handleWithdraw("gold", amount);
  };

  const handleExpense = (event: GameEvent) => {
    setCurrentEvent(event);
    setShowEventModal(true);
  };

  const getTotalValue = (asset: Asset) => {
    const principal = investments[asset] || 0;
    const profits = investmentProfits[asset] || 0;
    return principal + profits;
  };

  const getProfitPercentage = (asset: Asset) => {
    const principal = investments[asset] || 0;
    const profits = investmentProfits[asset] || 0;
    if (principal === 0) return 0;
    return (profits / principal) * 100;
  };

  const hasAnyInvestments = () => {
    return Object.values(investments).some(amount => amount > 0) || 
           Object.values(investmentProfits).some(amount => amount > 0);
  };

  const getTotalInvestmentValue = () => {
    const totalPrincipal = Object.values(investments).reduce((sum, amount) => sum + amount, 0);
    const totalProfits = Object.values(investmentProfits).reduce((sum, amount) => sum + amount, 0);
    return totalPrincipal + totalProfits;
  };

  // Stock trading handlers
  const handleStockBuy = (stockSymbol: string, quantity: number) => {
    const stock = stocks[stockSymbol];
    if (!stock || quantity <= 0) {
      alert("Invalid stock or quantity!");
      return;
    }
    
    const totalCost = stock.currentPrice * quantity;
    if (totalCost > cash) {
      alert("Insufficient cash to buy stocks!");
      return;
    }
    
    buyStock(stockSymbol, quantity);
    setStockBuyQuantities((prev) => ({ ...prev, [stockSymbol]: 0 }));
    alert(`Bought ${quantity} shares of ${stock.name} for ₹${formatCurrency(totalCost)}`);
  };

  const handleStockSell = (stockSymbol: string, quantity: number) => {
    const stock = stocks[stockSymbol];
    if (!stock || quantity <= 0) {
      alert("Invalid stock or quantity!");
      return;
    }
    
    const asset = stockSymbol as Asset;
    const totalValue = getTotalValue(asset);
    const currentShares = Math.floor(totalValue / stock.currentPrice); // Approximate shares owned
    
    if (quantity > currentShares) {
      alert("You don't own enough shares!");
      return;
    }
    
    sellStock(stockSymbol, quantity);
    setStockBuyQuantities((prev) => ({ ...prev, [stockSymbol]: 0 }));
    
    const saleValue = stock.currentPrice * quantity;
    alert(`Sold ${quantity} shares of ${stock.name} for ₹${formatCurrency(saleValue)}`);
  };

  const getOwnedShares = (stockSymbol: string) => {
    return stockQuantities[stockSymbol] || 0;
  };

  // Crypto trading handlers
  const handleCryptoBuy = (cryptoSymbol: string, quantity: number) => {
    const crypto = cryptos[cryptoSymbol];
    if (!crypto || quantity <= 0) {
      alert("Invalid crypto or quantity!");
      return;
    }
    
    const totalCost = crypto.currentPrice * quantity;
    if (totalCost > cash) {
      alert("Insufficient cash to buy crypto!");
      return;
    }
    
    buyCrypto(cryptoSymbol, quantity);
    setCryptoBuyQuantities((prev) => ({ ...prev, [cryptoSymbol]: 0 }));
    alert(`Bought ${quantity} ${crypto.name} for ₹${formatCurrency(totalCost)}`);
  };

  const handleCryptoSell = (cryptoSymbol: string, quantity: number) => {
    const crypto = cryptos[cryptoSymbol];
    if (!crypto || quantity <= 0) {
      alert("Invalid crypto or quantity!");
      return;
    }
    
    const asset = cryptoSymbol as Asset;
    const totalValue = getTotalValue(asset);
    const currentCoins = Math.floor(totalValue / crypto.currentPrice); // Approximate coins owned
    
    if (quantity > currentCoins) {
      alert("You don't own enough crypto!");
      return;
    }
    
    sellCrypto(cryptoSymbol, quantity);
    setCryptoBuyQuantities((prev) => ({ ...prev, [cryptoSymbol]: 0 }));
    
    const saleValue = crypto.currentPrice * quantity;
    alert(`Sold ${quantity} ${crypto.name} for ₹${formatCurrency(saleValue)}`);
  };

  const getOwnedCoins = (cryptoSymbol: string) => {
    return cryptoQuantities[cryptoSymbol] || 0;
  };

  // Real Estate trading handlers
  const handleRealEstateBuy = (realEstateSymbol: string, quantity: number) => {
    const realEstate = realEstates[realEstateSymbol];
    if (!realEstate || quantity <= 0) {
      alert("Invalid real estate property or quantity!");
      return;
    }
    
    const totalCost = realEstate.currentPrice * quantity;
    if (totalCost > cash) {
      alert("Insufficient cash to buy real estate!");
      return;
    }
    
    buyRealEstate(realEstateSymbol, quantity);
    setRealEstateBuyQuantities((prev) => ({ ...prev, [realEstateSymbol]: 0 }));
    alert(`Bought ${quantity} ${realEstate.name} for ₹${formatCurrency(totalCost)}`);
  };

  const handleRealEstateSell = (realEstateSymbol: string, quantity: number) => {
    const realEstate = realEstates[realEstateSymbol];
    if (!realEstate || quantity <= 0) {
      alert("Invalid real estate property or quantity!");
      return;
    }
    
    const asset = realEstateSymbol as Asset;
    const totalValue = getTotalValue(asset);
    const currentProperties = Math.floor(totalValue / realEstate.currentPrice); // Approximate properties owned
    
    if (quantity > currentProperties) {
      alert("You don't own enough properties!");
      return;
    }
    
    sellRealEstate(realEstateSymbol, quantity);
    setRealEstateBuyQuantities((prev) => ({ ...prev, [realEstateSymbol]: 0 }));
    
    const saleValue = realEstate.currentPrice * quantity;
    alert(`Sold ${quantity} ${realEstate.name} for ₹${formatCurrency(saleValue)}`);
  };

  const getOwnedProperties = (realEstateSymbol: string) => {
    return realEstateQuantities[realEstateSymbol] || 0;
  };

  const handleSellInvestment = (asset: Asset, amount: number) => {
    const totalValue = getTotalValue(asset);
    if (amount > totalValue || amount <= 0) {
      alert("Invalid amount to sell!");
      return;
    }
    
    // Withdraw the investment
    withdraw(asset, amount);
    
    // Check if we've covered the expense
    const expenseCost = currentEvent?.cost || 0;
    if (cash + amount >= expenseCost) {
      // Hide investment selector and auto-pay the expense
      setShowInvestmentSelector(false);
      setTimeout(() => {
        if (currentEvent) {
          payExpenseWithCash(currentEvent);
        }
      }, 100);
    }
  };

  return (
    <div className="bg-purple-600 text-black font-roboto min-h-screen">
      <header className="p-6 bg-black bg-opacity-50 flex flex-col items-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </div>
        
        <h1 className="text-4xl font-bebas text-white relative z-10 mb-4">Investment Simulator</h1>
        
        {/* Enhanced Year Progress Section */}
        <div className="relative z-10 w-full max-w-4xl">
          {/* Year Display with Status and Month */}
          <div className="flex justify-between items-center mb-3">
            <div className="text-2xl font-bebas text-white flex items-center">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Year {year}
              </span>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-gray-300">10</span>
              
              {/* Current Month Display */}
              <span className="ml-4 text-lg text-blue-300 font-mono">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentMonth]}
              </span>
              
              {showEventModal && (
                <span className="ml-3 text-yellow-400 animate-pulse flex items-center">
                  ⏸️ <span className="ml-1 text-sm">PAUSED</span>
                </span>
              )}
            </div>
            
            {/* Time remaining */}
            <div className="text-sm font-mono text-gray-300">
              {10 - year} years remaining
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative">
            {/* Background track with gradient */}
            <div className="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-full h-4 shadow-inner">
              {/* Year markers for 10 years */}
              <div className="absolute inset-0 flex justify-between items-center px-1">
                {Array.from({ length: 11 }, (_, i) => i * 2).map((yearMark) => (
                  <div
                    key={yearMark}
                    className="w-0.5 h-3 bg-gray-500 opacity-60"
                    style={{ marginLeft: yearMark === 0 ? 0 : 'auto' }}
                  />
                ))}
              </div>
              
              {/* Progress fill with performance-based colors */}
              <div
                className={`h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                  netWorth > aiNetWorth 
                    ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600' // Winning
                    : netWorth > aiNetWorth * 0.8 
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600' // Close competition
                    : 'bg-gradient-to-r from-red-400 via-pink-500 to-red-600' // Losing
                }`}
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                
                {/* Performance glow */}
                <div className={`absolute inset-0 rounded-full blur-sm opacity-50 ${
                  netWorth > aiNetWorth 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : netWorth > aiNetWorth * 0.8 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-red-400 to-pink-500'
                }`}></div>
              </div>
              
              {/* Current position indicator with performance color */}
              <div
                className="absolute top-0 h-4 w-1 bg-white shadow-lg transition-all duration-1000"
                style={{ left: `${Math.min(100, progress * 100)}%`, transform: 'translateX(-50%)' }}
              >
                {/* Pulsing dot with performance color */}
                <div className={`absolute -top-2 -left-1 w-3 h-3 rounded-full animate-ping ${
                  netWorth > aiNetWorth ? 'bg-green-400' : netWorth > aiNetWorth * 0.8 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <div className={`absolute -top-2 -left-1 w-3 h-3 rounded-full ${
                  netWorth > aiNetWorth ? 'bg-green-300' : netWorth > aiNetWorth * 0.8 ? 'bg-yellow-300' : 'bg-red-300'
                }`}></div>
              </div>
            </div>
            
            {/* Year labels with milestones for 10 years */}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <div className="flex flex-col items-center">
                <span>Year 0</span>
                <span className="text-blue-400">🚀 Start</span>
              </div>
              <div className="flex flex-col items-center">
                <span>Year 2</span>
                {year >= 2 && <span className="text-yellow-400">📈 Early</span>}
              </div>
              <div className="flex flex-col items-center">
                <span>Year 4</span>
                {year >= 4 && <span className="text-orange-400">💪 Growth</span>}
              </div>
              <div className="flex flex-col items-center">
                <span>Year 6</span>
                {year >= 6 && <span className="text-purple-400">⚡ Advanced</span>}
              </div>
              <div className="flex flex-col items-center">
                <span>Year 8</span>
                {year >= 8 && <span className="text-red-400">🏃 Sprint</span>}
              </div>
              <div className="flex flex-col items-center">
                <span>Year 10</span>
                {year >= 10 && <span className="text-green-400">🏁 Finish</span>}
              </div>
            </div>
          </div>
          
          {/* Progress Stats with Performance Indicators */}
          <div className="flex justify-between items-center mt-3 text-sm">
            <div className="text-gray-300 flex items-center">
              <span className="font-semibold">{Math.round(progress * 100)}%</span> 
              <span className="ml-1">Complete</span>
              {year >= 2 && (
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-bold transition-all duration-500 ${
                  netWorth > aiNetWorth * 1.5
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black animate-bounce' // Dominating
                    : netWorth > aiNetWorth 
                    ? 'bg-green-500 text-white' // Winning
                    : netWorth > aiNetWorth * 0.8 
                    ? 'bg-yellow-500 text-black'  // Close
                    : 'bg-red-500 text-white' // Behind
                }`}>
                  {netWorth > aiNetWorth * 1.5 ? '👑 DOMINATING' 
                   : netWorth > aiNetWorth ? '🏆 WINNING' 
                   : netWorth > aiNetWorth * 0.8 ? '⚡ CLOSE' 
                   : '📉 BEHIND'}
                </span>
              )}
            </div>
            <div className="text-gray-300 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                showEventModal ? 'bg-yellow-400' : 'bg-green-400'
              }`}></div>
              {showEventModal ? 'Event Active' : 'Game in Progress'}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[300px,1fr,300px] min-h-[calc(100vh-120px)]">
        {/* Pause overlay */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-20 z-10 pointer-events-none">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-bebas text-lg">
              ⏸️ GAME PAUSED - Handle the expense to continue
            </div>
          </div>
        )}
        
        {/* Left Sidebar - Game Info */}
        <div className="bg-yellow-300 p-6 border-r-4 border-black">
          <div className="space-y-6">
            <div>
              <div className="text-2xl font-bebas">Year {year} of 10</div>
              <div className="text-lg font-mono text-gray-700">
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'][currentMonth]}
              </div>
              
              {/* Month Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Jan</span>
                  <span>Jun</span>
                  <span>Dec</span>
                </div>
                <div className="w-full bg-gray-400 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentMonth / 11) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
              <h2 className="font-bebas">POCKET CASH</h2>
              <div className="text-2xl font-mono">
                <AnimatedCounter 
                  value={cash} 
                  duration={2000} 
                  prefix="₹" 
                  className="text-green-400"
                  isCurrency={true}
                  startFromZero={gameStarted}
                />
              </div>
              <CashChangeNotification 
                amount={cashChange}
                show={showCashNotification}
                onComplete={() => setShowCashNotification(false)}
              />
            </div>

            <div className="space-y-2">
              <h2 className="font-bebas">NET WORTH</h2>
              <div className="text-2xl font-mono">
                <AnimatedCounter 
                  value={netWorth} 
                  duration={2000} 
                  prefix="₹" 
                  className="text-blue-400"
                  isCurrency={true}
                  startFromZero={gameStarted}
                />
              </div>
            </div>

            {/* Monthly Income Display with Warning */}
            <div className="space-y-2">
              <h2 className="font-bebas">MONTHLY INCOME</h2>
              <div className={`text-lg font-mono ${monthlyNetIncome < 1000 ? 'text-red-400' : 'text-green-400'}`}>
                <AnimatedCounter 
                  value={monthlyNetIncome} 
                  duration={800} 
                  prefix="₹" 
                  isCurrency={true}
                />
              </div>
              {monthlyNetIncome < 1000 && (
                <div className="text-xs text-red-400 animate-pulse">
                  ⚠️ Low monthly income! Invest wisely.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="font-bebas">AI COMPETITOR</h2>
              <div className="text-xl font-mono">
                <AnimatedCounter 
                  value={aiNetWorth} 
                  duration={2000} 
                  prefix="₹" 
                  className="text-red-400"
                  isCurrency={true}
                  startFromZero={gameStarted}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {netWorth > aiNetWorth ? "You're winning! 🎉" : "AI is ahead 🤖"}
              </div>
              
              {/* Progress comparison bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, (netWorth / (netWorth + aiNetWorth)) * 100))}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>You</span>
                <span>AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 relative bg-purple-600 min-h-full">
          {/* Investment Section */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            {investmentOptions.map((option) => {
              const previousRate = previousRates[option.asset] || option.baseReturnRate;
              const rateColor = year === 0 || option.baseReturnRate > previousRate ? "text-green-500" : "text-red-500";

              return (
                <motion.div
                  key={option.asset}
                  className="bg-yellow-300 p-3 rounded-lg shadow-lg border-4 border-black"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h3 className="text-base font-bebas">{option.name}</h3>
                  <p className={`text-xs ${rateColor}`}>{option.baseReturnRate.toFixed(2)}% annual return</p>
                  <p className="mt-2 text-xs">Total Invested: ₹{formatCurrency(getTotalValue(option.asset))}</p>

                  {option.asset === "gold" ? (
                    <div className="space-y-2">
                      <div className="text-xs font-bebas text-black mt-2">₹{formatCurrency(currentGoldRate)} per gram</div>
                      <input
                        type="number"
                        className="w-full p-1 border-2 border-black rounded mt-2 bg-white text-black text-sm"
                        placeholder="Qty (grams)"
                        value={goldQuantity}
                        onChange={(e) => setGoldQuantity(Number(e.target.value))}
                      />
                      <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-black"
                        onClick={() => handleGoldInvest(goldQuantity)}
                      >
                        Buy Gold
                      </button>
                      <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-black"
                        onClick={() => handleGoldWithdraw(goldQuantity)}
                      >
                        Sell Gold
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="number"
                        className="w-full p-1 border-2 border-black rounded mt-2 bg-white text-black text-sm"
                        placeholder="Amount"
                        step="1000"
                        value={amounts[option.asset] || ""}
                        onChange={(e) =>
                          setAmounts((prev) => ({ ...prev, [option.asset]: Number(e.target.value) }))
                        }
                      />

                      <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mt-2 text-xs transition duration-300 border-2 border-black"
                        onClick={() => handleInvest(option.asset, amounts[option.asset] || 0)}
                      >
                        Invest
                      </button>

                      <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mt-2 text-xs transition duration-300 border-2 border-black"
                        onClick={() => handleWithdraw(option.asset, amounts[option.asset] || 0)}
                      >
                        Withdraw
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Stock Trading Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bebas mb-4 text-center">📈 STOCK MARKET</h2>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(stocks).map(([symbol, stock]) => {
                const ownedShares = getOwnedShares(symbol);
                const stockValue = getTotalValue(symbol as Asset);
                const profitPercentage = getProfitPercentage(symbol as Asset);
                
                return (
                  <motion.div
                    key={symbol}
                    className="bg-white p-4 rounded-lg shadow-lg border-4 border-black"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bebas text-black">{stock.symbol}</h3>
                      <p className="text-xs text-gray-600 mb-2">{stock.name}</p>
                      
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-black">
                          ₹{stock.currentPrice.toFixed(2)}
                        </div>
                        <div className={`text-sm font-semibold ${stock.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change24h >= 0 ? '↗' : '↘'} {stock.change24h.toFixed(2)}%
                        </div>
                        
                        {ownedShares > 0 && (
                          <div className="text-xs text-blue-600 mt-2">
                            Owned: {ownedShares} shares
                            <div className="text-xs">
                              Value: ₹{formatCurrency(stockValue)}
                            </div>
                            {profitPercentage !== 0 && (
                              <div className={`text-xs ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <input
                          type="number"
                          className="w-full p-1 border-2 border-black rounded text-black text-sm"
                          placeholder="Qty"
                          min="1"
                          value={stockBuyQuantities[symbol] || ""}
                          onChange={(e) =>
                            setStockBuyQuantities((prev) => ({ ...prev, [symbol]: Number(e.target.value) }))
                          }
                        />
                        
                        <div className="flex space-x-1">
                          <button
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-black"
                            onClick={() => handleStockBuy(symbol, stockBuyQuantities[symbol] || 0)}
                          >
                            BUY
                          </button>
                          <button
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-black"
                            onClick={() => handleStockSell(symbol, stockBuyQuantities[symbol] || 0)}
                            disabled={ownedShares === 0}
                          >
                            SELL
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Crypto Trading Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bebas mb-4 text-center">🪙 CRYPTO MARKET</h2>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(cryptos).map(([symbol, crypto]) => {
                const ownedCoins = getOwnedCoins(symbol);
                const cryptoValue = getTotalValue(symbol as Asset);
                const profitPercentage = getProfitPercentage(symbol as Asset);
                
                return (
                  <motion.div
                    key={symbol}
                    className="bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-lg shadow-lg border-4 border-purple-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bebas text-purple-800">{crypto.symbol}</h3>
                      <p className="text-xs text-gray-700 mb-2">{crypto.name}</p>
                      
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-purple-800">
                          ₹{crypto.currentPrice.toFixed(2)}
                        </div>
                        <div className={`text-sm font-semibold ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.change24h >= 0 ? '🚀' : '📉'} {crypto.change24h.toFixed(2)}%
                        </div>
                        
                        {ownedCoins > 0 && (
                          <div className="text-xs text-purple-700 mt-2">
                            Owned: {ownedCoins} coins
                            <div className="text-xs">
                              Value: ₹{formatCurrency(cryptoValue)}
                            </div>
                            {profitPercentage !== 0 && (
                              <div className={`text-xs ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <input
                          type="number"
                          className="w-full p-1 border-2 border-purple-800 rounded text-purple-800 text-sm"
                          placeholder="Qty"
                          min="0.1"
                          step="0.1"
                          value={cryptoBuyQuantities[symbol] || ""}
                          onChange={(e) =>
                            setCryptoBuyQuantities((prev) => ({ ...prev, [symbol]: Number(e.target.value) }))
                          }
                        />
                        
                        <div className="flex space-x-1">
                          <button
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-green-800"
                            onClick={() => handleCryptoBuy(symbol, cryptoBuyQuantities[symbol] || 0)}
                          >
                            BUY
                          </button>
                          <button
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-red-800"
                            onClick={() => handleCryptoSell(symbol, cryptoBuyQuantities[symbol] || 0)}
                            disabled={ownedCoins === 0}
                          >
                            SELL
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Real Estate Market Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bebas mb-4 text-center">🏠 REAL ESTATE MARKET</h2>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(realEstates).map(([symbol, realEstate]) => {
                const ownedProperties = getOwnedProperties(symbol);
                const realEstateValue = getTotalValue(symbol as Asset);
                const profitPercentage = getProfitPercentage(symbol as Asset);
                
                return (
                  <motion.div
                    key={symbol}
                    className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg shadow-lg border-4 border-green-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bebas text-green-800">{realEstate.symbol}</h3>
                      <p className="text-xs text-gray-700 mb-2">{realEstate.name}</p>
                      
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-green-800">
                          ₹{(realEstate.currentPrice / 100000).toFixed(1)}L
                        </div>
                        <div className={`text-sm font-semibold ${realEstate.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {realEstate.change24h >= 0 ? '🏗️' : '📉'} {realEstate.change24h.toFixed(2)}%
                        </div>
                        
                        {ownedProperties > 0 && (
                          <div className="text-xs text-green-700 mt-2">
                            Owned: {ownedProperties} properties
                            <div className="text-xs">
                              Value: ₹{formatCurrency(realEstateValue)}
                            </div>
                            {profitPercentage !== 0 && (
                              <div className={`text-xs ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <input
                          type="number"
                          className="w-full p-1 border-2 border-green-800 rounded text-green-800 text-sm"
                          placeholder="Qty"
                          min="1"
                          value={realEstateBuyQuantities[symbol] || ""}
                          onChange={(e) =>
                            setRealEstateBuyQuantities((prev) => ({ ...prev, [symbol]: Number(e.target.value) }))
                          }
                        />
                        
                        <div className="flex space-x-1">
                          <button
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-green-800"
                            onClick={() => handleRealEstateBuy(symbol, realEstateBuyQuantities[symbol] || 0)}
                          >
                            BUY
                          </button>
                          <button
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 py-1 rounded text-xs transition duration-300 border-2 border-red-800"
                            onClick={() => handleRealEstateSell(symbol, realEstateBuyQuantities[symbol] || 0)}
                            disabled={ownedProperties === 0}
                          >
                            SELL
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Investments */}
        <div className="bg-yellow-300 p-6 border-l-4 border-black">
          <h2 className="text-2xl font-bebas">Your Investments</h2>
          <div className="space-y-4">
            {investmentOptions.map((option) => {
              const principal = investments[option.asset] || 0;
              const profits = investmentProfits[option.asset] || 0;
              const totalValue = getTotalValue(option.asset);
              const profitPercentage = getProfitPercentage(option.asset);
              const profitColor = profits >= 0 ? "text-green-600" : "text-red-600";

              return (
                <div key={option.asset} className="bg-white p-4 rounded-lg shadow-lg border-4 border-black">
                  <h3 className="text-xl font-bebas">{option.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-600">Principal: ₹{formatCurrency(principal)}</p>
                    <p className={profitColor}>
                      Profits: ₹{formatCurrency(profits)} 
                      {principal > 0 && (
                        <span className="text-xs ml-1">
                          ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
                        </span>
                      )}
                    </p>
                    <p className="font-semibold border-t border-gray-300 pt-1">
                      Total Value: ₹{formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Stock Holdings */}
          <div className="mt-6">
            <h3 className="text-xl font-bebas mb-3">Stock Holdings</h3>
            <div className="space-y-3">
              {(() => {
                const ownedStocks = Object.entries(stocks).filter(([symbol, stock]) => {
                  const totalValue = getTotalValue(symbol as Asset);
                  return totalValue > 0;
                });
                
                if (ownedStocks.length === 0) {
                  return (
                    <div className="bg-gray-100 p-4 rounded-lg shadow-lg border-4 border-gray-400 text-center">
                      <div className="text-gray-500 mb-2 text-2xl">📈</div>
                      <h4 className="text-sm font-bebas text-gray-600 mb-1">No Stock Investments</h4>
                      <p className="text-xs text-gray-500">Start investing in stocks to see your holdings here!</p>
                    </div>
                  );
                }
                
                return ownedStocks.map(([symbol, stock]) => {
                  const principal = investments[symbol as Asset] || 0;
                  const profits = investmentProfits[symbol as Asset] || 0;
                  const totalValue = getTotalValue(symbol as Asset);
                  const profitPercentage = getProfitPercentage(symbol as Asset);
                  const profitColor = profits >= 0 ? "text-green-600" : "text-red-600";
                  const ownedShares = getOwnedShares(symbol);
                
                  return (
                    <div key={symbol} className="bg-white p-3 rounded-lg shadow-lg border-4 border-black">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bebas">{stock.symbol}</h4>
                          <p className="text-xs text-gray-600">{ownedShares} shares</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ₹{stock.currentPrice.toFixed(2)}
                          </div>
                          <div className={`text-xs ${stock.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change24h >= 0 ? '↗' : '↘'} {stock.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm mt-2">
                        <p className="text-blue-600">Principal: ₹{formatCurrency(principal)}</p>
                        <p className={profitColor}>
                          Profits: ₹{formatCurrency(profits)} 
                          {principal > 0 && (
                            <span className="text-xs ml-1">
                              ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
                            </span>
                          )}
                        </p>
                        <p className="font-semibold border-t border-gray-300 pt-1">
                          Total Value: ₹{formatCurrency(totalValue)}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          
          {/* Crypto Holdings */}
          <div className="mt-6">
            <h3 className="text-xl font-bebas mb-3">Crypto Holdings</h3>
            <div className="space-y-3">
              {(() => {
                const ownedCryptos = Object.entries(cryptos).filter(([symbol, crypto]) => {
                  const totalValue = getTotalValue(symbol as Asset);
                  return totalValue > 0;
                });
                
                if (ownedCryptos.length === 0) {
                  return (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg shadow-lg border-4 border-purple-400 text-center">
                      <div className="text-purple-500 mb-2 text-2xl">₿</div>
                      <h4 className="text-sm font-bebas text-purple-600 mb-1">No Crypto Investments</h4>
                      <p className="text-xs text-purple-500">Start investing in cryptocurrency to see your holdings here!</p>
                    </div>
                  );
                }
                
                return ownedCryptos.map(([symbol, crypto]) => {
                  const principal = investments[symbol as Asset] || 0;
                  const profits = investmentProfits[symbol as Asset] || 0;
                  const totalValue = getTotalValue(symbol as Asset);
                  const profitPercentage = getProfitPercentage(symbol as Asset);
                  const profitColor = profits >= 0 ? "text-green-600" : "text-red-600";
                  const ownedCoins = getOwnedCoins(symbol);
                
                  return (
                    <div key={symbol} className="bg-gradient-to-br from-purple-50 to-blue-50 p-3 rounded-lg shadow-lg border-4 border-purple-800">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bebas text-purple-800">{crypto.symbol}</h4>
                          <p className="text-xs text-purple-600">{ownedCoins} coins</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-800">
                            ₹{crypto.currentPrice.toFixed(2)}
                          </div>
                          <div className={`text-xs ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {crypto.change24h >= 0 ? '🚀' : '📉'} {crypto.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm mt-2">
                        <p className="text-blue-600">Principal: ₹{formatCurrency(principal)}</p>
                        <p className={profitColor}>
                          Profits: ₹{formatCurrency(profits)} 
                          {principal > 0 && (
                            <span className="text-xs ml-1">
                              ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
                            </span>
                          )}
                        </p>
                        <p className="font-semibold border-t border-purple-300 pt-1">
                          Total Value: ₹{formatCurrency(totalValue)}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          
          {/* Real Estate Holdings */}
          <div className="mt-6">
            <h3 className="text-xl font-bebas mb-3">Real Estate Holdings</h3>
            <div className="space-y-3">
              {(() => {
                const ownedRealEstates = Object.entries(realEstates).filter(([symbol, realEstate]) => {
                  const totalValue = getTotalValue(symbol as Asset);
                  return totalValue > 0;
                });
                
                if (ownedRealEstates.length === 0) {
                  return (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg shadow-lg border-4 border-green-400 text-center">
                      <div className="text-green-500 mb-2 text-2xl">🏠</div>
                      <h4 className="text-sm font-bebas text-green-600 mb-1">No Real Estate Investments</h4>
                      <p className="text-xs text-green-500">Start investing in real estate to see your holdings here!</p>
                    </div>
                  );
                }
                
                return ownedRealEstates.map(([symbol, realEstate]) => {
                  const principal = investments[symbol as Asset] || 0;
                  const profits = investmentProfits[symbol as Asset] || 0;
                  const totalValue = getTotalValue(symbol as Asset);
                  const profitPercentage = getProfitPercentage(symbol as Asset);
                  const profitColor = profits >= 0 ? "text-green-600" : "text-red-600";
                  const ownedProperties = getOwnedProperties(symbol);
                
                  return (
                    <div key={symbol} className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg shadow-lg border-4 border-green-800">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bebas text-green-800">{realEstate.symbol}</h4>
                          <p className="text-xs text-green-600">{ownedProperties} properties</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-800">
                            ₹{(realEstate.currentPrice / 100000).toFixed(1)}L
                          </div>
                          <div className={`text-xs ${realEstate.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {realEstate.change24h >= 0 ? '🏗️' : '📉'} {realEstate.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm mt-2">
                        <p className="text-blue-600">Principal: ₹{formatCurrency(principal)}</p>
                        <p className={profitColor}>
                          Profits: ₹{formatCurrency(profits)} 
                          {principal > 0 && (
                            <span className="text-xs ml-1">
                              ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
                            </span>
                          )}
                        </p>
                        <p className="font-semibold border-t border-green-300 pt-1">
                          Total Value: ₹{formatCurrency(totalValue)}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal - Handles both Income and Expense Events */}
      <AnimatePresence>
        {showEventModal && currentEvent && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-4 ${
              currentEvent.type === 'income' ? 'border-2 border-green-400' : 'border-2 border-red-400'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {currentEvent.type === 'income' ? '🎉' : '💸'}
                </span>
                <h2 className="text-xl font-bebas">{currentEvent.title}</h2>
              </div>
              <p className="mt-2">{currentEvent.description}</p>
              <p className={`mt-2 font-semibold ${
                currentEvent.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentEvent.type === 'income' ? 'Amount Received:' : 'Cost:'} {currentEvent.type === 'income' ? '+' : ''}₹{formatCurrency(currentEvent.cost)}
              </p>
              
              {/* For Income Events - Just show acknowledgment */}
              {currentEvent.type === 'income' && (
                <div className="mt-4">
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                    <p className="text-sm text-green-700">
                      💰 Your cash has been increased by ₹{formatCurrency(currentEvent.cost)}!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      New cash balance: ₹{formatCurrency(cash)}
                    </p>
                  </div>
                  <button
                    className="w-full px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      setShowEventModal(false);
                      setCurrentEvent(null);
                    }}
                  >
                    🎉 Awesome! Continue Playing
                  </button>
                </div>
              )}
              
              {/* For Expense Events - Show payment options */}
              {currentEvent.type === 'expense' && (
                <>
                  {/* Show investment value if player has investments */}
                  {hasAnyInvestments() && (
                    <p className="mt-1 text-sm text-gray-600">
                      Total Investment Value: ₹{formatCurrency(getTotalInvestmentValue())}
                    </p>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <button
                      className={`w-full px-4 py-2 rounded ${
                        cash >= (currentEvent?.cost || 0)
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                      onClick={() => currentEvent && payExpenseWithCash(currentEvent)}
                      title={cash < (currentEvent?.cost || 0) ? 'You don\'t have enough cash, but you can still try to pay' : ''}
                    >
                      💰 Pay with Cash (₹{formatCurrency(cash)} available)
                      {cash < (currentEvent?.cost || 0) && (
                        <span className="block text-xs">⚠️ Insufficient cash - will go negative</span>
                      )}
                    </button>
                    
                    {hasAnyInvestments() && !showInvestmentSelector && (
                      <button
                        className="w-full px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => setShowInvestmentSelector(true)}
                      >
                        📈 Choose Investments to Sell (₹{formatCurrency(getTotalInvestmentValue())} available)
                      </button>
                    )}
                    
                    {hasAnyInvestments() && showInvestmentSelector && (
                      <div className="bg-gray-50 border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-sm">Select investments to sell:</h4>
                          <button 
                            onClick={() => setShowInvestmentSelector(false)}
                            className="text-gray-500 hover:text-gray-700"
                            >
                            ✕
                          </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {/* Traditional Investments */}
                          {investmentOptions
                            .filter(option => getTotalValue(option.asset) > 0)
                            .map((option) => {
                              const principal = investments[option.asset] || 0;
                              const profits = investmentProfits[option.asset] || 0;
                              const totalValue = getTotalValue(option.asset);
                              
                              return (
                                <div key={option.asset} className="bg-white border rounded p-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-semibold text-xs">{option.name}</p>
                                      <p className="text-xs text-gray-600">
                                        Principal: ₹{formatCurrency(principal)} | 
                                        Profits: ₹{formatCurrency(profits)}
                                      </p>
                                      <p className="text-xs font-semibold">Total: ₹{formatCurrency(totalValue)}</p>
                                    </div>
                                    <div className="ml-2">
                                      <div className="flex space-x-1 mb-1">
                                        <button
                                          className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
                                          onClick={() => handleSellInvestment(option.asset, totalValue * 0.25)}
                                          title="Sell 25%"
                                        >
                                          25%
                                        </button>
                                        <button
                                          className="bg-red-200 hover:bg-red-300 text-red-700 px-2 py-1 rounded text-xs"
                                          onClick={() => handleSellInvestment(option.asset, totalValue * 0.5)}
                                          title="Sell 50%"
                                        >
                                          50%
                                        </button>
                                        <button
                                          className="bg-red-300 hover:bg-red-400 text-red-700 px-2 py-1 rounded text-xs"
                                          onClick={() => handleSellInvestment(option.asset, totalValue)}
                                          title="Sell All"
                                        >
                                          ALL
                                        </button>
                                      </div>
                                      <div className="flex space-x-1">
                                        <button
                                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs"
                                          onClick={() => setShowCustomAmountFor(showCustomAmountFor === option.asset ? null : option.asset)}
                                          title="Custom Amount"
                                        >
                                          Custom
                                        </button>
                                      </div>
                                      {showCustomAmountFor === option.asset && (
                                        <div className="mt-2 flex space-x-1">
                                          <input
                                            type="number"
                                            placeholder="Amount"
                                            value={customSellAmounts[option.asset] || ''}
                                            onChange={(e) => setCustomSellAmounts({...customSellAmounts, [option.asset]: parseInt(e.target.value) || 0})}
                                            className="w-20 px-1 py-1 border rounded text-xs"
                                            max={totalValue}
                                          />
                                          <button
                                            className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs"
                                            onClick={() => {
                                              const amount = customSellAmounts[option.asset] || 0;
                                              if (amount > 0 && amount <= totalValue) {
                                                handleSellInvestment(option.asset, amount);
                                                setShowCustomAmountFor(null);
                                              }
                                            }}
                                          >
                                            Sell
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          
                          {/* Stock Investments */}
                          {Object.entries(stocks)
                            .filter(([symbol, stock]) => getTotalValue(symbol as Asset) > 0)
                            .map(([symbol, stock]) => {
                              const asset = symbol as Asset;
                              const principal = investments[asset] || 0;
                              const profits = investmentProfits[asset] || 0;
                              const totalValue = getTotalValue(asset);
                              const ownedShares = getOwnedShares(symbol);
                              
                              return (
                                <div key={symbol} className="bg-blue-50 border border-blue-200 rounded p-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-semibold text-xs">📈 {stock.name}</p>
                                      <p className="text-xs text-gray-600">
                                        {ownedShares} shares @ ₹{stock.currentPrice.toFixed(2)}
                                      </p>
                                      <p className="text-xs font-semibold">Total: ₹{formatCurrency(totalValue)}</p>
                                    </div>
                                    <div className="ml-2 space-x-1">
                                      <button
                                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue * 0.25)}
                                        title="Sell 25%"
                                      >
                                        25%
                                      </button>
                                      <button
                                        className="bg-red-200 hover:bg-red-300 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue * 0.5)}
                                        title="Sell 50%"
                                      >
                                        50%
                                      </button>
                                      <button
                                        className="bg-red-300 hover:bg-red-400 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue)}
                                        title="Sell All"
                                      >
                                        ALL
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          
                          {/* Crypto Investments */}
                          {Object.entries(cryptos)
                            .filter(([symbol, crypto]) => getTotalValue(symbol as Asset) > 0)
                            .map(([symbol, crypto]) => {
                              const asset = symbol as Asset;
                              const principal = investments[asset] || 0;
                              const profits = investmentProfits[asset] || 0;
                              const totalValue = getTotalValue(asset);
                              const ownedCoins = getOwnedCoins(symbol);
                              
                              return (
                                <div key={symbol} className="bg-purple-50 border border-purple-200 rounded p-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-semibold text-xs">🪙 {crypto.name}</p>
                                      <p className="text-xs text-gray-600">
                                        {ownedCoins} coins @ ₹{crypto.currentPrice.toFixed(2)}
                                      </p>
                                      <p className="text-xs font-semibold">Total: ₹{formatCurrency(totalValue)}</p>
                                    </div>
                                    <div className="ml-2 space-x-1">
                                      <button
                                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue * 0.25)}
                                        title="Sell 25%"
                                      >
                                        25%
                                      </button>
                                      <button
                                        className="bg-red-200 hover:bg-red-300 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue * 0.5)}
                                        title="Sell 50%"
                                      >
                                        50%
                                      </button>
                                      <button
                                        className="bg-red-300 hover:bg-red-400 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue)}
                                        title="Sell All"
                                      >
                                        ALL
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          
                          {/* Real Estate Investments */}
                          {Object.entries(realEstates)
                            .filter(([symbol, realEstate]) => getTotalValue(symbol as Asset) > 0)
                            .map(([symbol, realEstate]) => {
                              const asset = symbol as Asset;
                              const principal = investments[asset] || 0;
                              const profits = investmentProfits[asset] || 0;
                              const totalValue = getTotalValue(asset);
                              const ownedProperties = getOwnedProperties(symbol);
                              
                              return (
                                <div key={symbol} className="bg-green-50 border border-green-200 rounded p-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-semibold text-xs">🏠 {realEstate.name}</p>
                                      <p className="text-xs text-gray-600">
                                        {ownedProperties} properties @ ₹{(realEstate.currentPrice / 100000).toFixed(1)}L
                                      </p>
                                      <p className="text-xs font-semibold">Total: ₹{formatCurrency(totalValue)}</p>
                                    </div>
                                    <div className="ml-2 space-x-1">
                                      <button
                                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue * 0.25)}
                                        title="Sell 25%"
                                      >
                                        25%
                                      </button>
                                      <button
                                        className="bg-red-200 hover:bg-red-300 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue * 0.5)}
                                        title="Sell 50%"
                                      >
                                        50%
                                      </button>
                                      <button
                                        className="bg-red-300 hover:bg-red-400 text-red-700 px-2 py-1 rounded text-xs"
                                        onClick={() => handleSellInvestment(asset, totalValue)}
                                        title="Sell All"
                                      >
                                        ALL
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                          💡 Current cash: ₹{formatCurrency(cash)} | Need: ₹{formatCurrency(Math.max(0, (currentEvent?.cost || 0) - cash))} more
                          {cash >= (currentEvent?.cost || 0) && (
                            <div className="text-green-600 font-semibold mt-1">
                              ✅ You now have enough cash to pay the expense!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!hasAnyInvestments() && cash < (currentEvent?.cost || 0) && (
                      <div className="bg-yellow-100 border border-yellow-400 rounded p-3 text-sm">
                        <p className="text-yellow-800 font-semibold">⚠️ Emergency Situation!</p>
                        <p className="text-yellow-700">You have insufficient funds. You'll need to pay with available cash and go into debt.</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 text-center mt-2">
                      💡 You must pay this expense to continue the game
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}