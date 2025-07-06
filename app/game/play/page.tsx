"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, Asset, GameEvent } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CashChangeNotification } from "@/components/ui/cash-change-notification";

// Base return rates for investment options
const baseInvestmentOptions: { name: string; asset: Asset; baseReturnRate: number }[] = [
  { name: "Savings", asset: "savings", baseReturnRate: 4 },
  { name: "Fixed Deposit", asset: "fixedDeposit", baseReturnRate: 6 },
  { name: "Nifty 50", asset: "nifty50", baseReturnRate: 10 },
  { name: "Gold", asset: "gold", baseReturnRate: 8 },
  { name: "Real Estate", asset: "realestate", baseReturnRate: 12 },
  { name: "Crypto", asset: "crypto", baseReturnRate: 20 },
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
    events,
    isGameOver,
    monthlyNetIncome,
    initializeGame,
    advanceTime,
    invest,
    withdraw,
    updateNetWorth,
    handleEvent,
  } = useGameStore();

  const animationFrameRef = useRef<number>();
  const [amounts, setAmounts] = useState<{ [key in Asset]?: number }>({});
  const [goldQuantity, setGoldQuantity] = useState<number>(0);
  const [investmentOptions, setInvestmentOptions] = useState(baseInvestmentOptions);
  const [previousRates, setPreviousRates] = useState<{ [key in Asset]?: number }>({});
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [showCashNotification, setShowCashNotification] = useState(false);
  const [cashChange, setCashChange] = useState(0);
  const [previousCash, setPreviousCash] = useState(cash);

  useEffect(() => {
    initializeGame();

    function gameLoop() {
      advanceTime();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Remove advanceTime dependency

  const progress = Math.min(1, (currentTime - startTime) / (10 * 100 * 1000));
  const year = Math.floor(progress * 20);

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
    if (investments[asset] < amount || amount <= 0) {
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
    handleWithdraw("gold", amount);
  };

  const handleExpense = (event: GameEvent) => {
    setCurrentEvent(event);
    setShowExpenseModal(true);
  };

  const payExpenseWithCash = () => {
    if (currentEvent) {
      handleEvent(currentEvent);
      setShowExpenseModal(false);
    }
  };

  const payExpenseWithInvestments = () => {
    if (currentEvent) {
      let remainingCost = currentEvent.cost;
      const updatedInvestments = { ...investments };

      for (const asset of Object.keys(updatedInvestments) as Asset[]) {
        if (updatedInvestments[asset] > 0) {
          const amountToWithdraw = Math.min(updatedInvestments[asset], remainingCost);
          withdraw(asset, amountToWithdraw);
          remainingCost -= amountToWithdraw;
          if (remainingCost <= 0) break;
        }
      }

      handleEvent(currentEvent);
      setShowExpenseModal(false);
    }
  };

  const calculateProfitOrLoss = (asset: Asset) => {
    if (year === 0) {
      return 0; // Initial profit or loss is 0
    }
    const initialInvestment = 0; // Initial investment is 0
    const currentInvestment = investments[asset] || 0;
    const profitOrLoss = currentInvestment - initialInvestment;
    return profitOrLoss;
  };

  return (
    <div className="min-h-screen bg-purple-600 text-black font-roboto">
      <header className="p-4 bg-black bg-opacity-50 flex flex-col items-center">
        <h1 className="text-3xl font-bebas text-white">Investment Simulator</h1>
        <div className="text-xl font-bebas text-white mt-2">Year {year} of 20</div>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </header>

      <div className="grid grid-cols-[300px,1fr,300px] h-screen">
        {/* Left Sidebar - Game Info */}
        <div className="bg-yellow-300 p-6 border-r-4 border-black">
          <div className="space-y-6">
            <div className="text-2xl font-bebas">Year {year} of 20</div>

            <div className="space-y-2 relative">
              <h2 className="font-bebas">POCKET CASH</h2>
              <div className="text-2xl font-mono">
                <AnimatedCounter 
                  value={cash} 
                  duration={800} 
                  prefix="₹" 
                  className="text-green-400"
                  isCurrency={true}
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
                  duration={800} 
                  prefix="₹" 
                  className="text-blue-400"
                  isCurrency={true}
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
                  duration={800} 
                  prefix="₹" 
                  className="text-red-400"
                  isCurrency={true}
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
        <div className="p-6 relative">
          {/* Investment Section */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {investmentOptions.map((option) => {
              const previousRate = previousRates[option.asset] || option.baseReturnRate;
              const rateColor = year === 0 || option.baseReturnRate > previousRate ? "text-green-500" : "text-red-500";

              return (
                <motion.div
                  key={option.asset}
                  className="bg-yellow-300 p-4 rounded-lg shadow-lg border-4 border-black"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h3 className="text-lg font-bebas">{option.name}</h3>
                  <p className={`text-sm ${rateColor}`}>{option.baseReturnRate.toFixed(2)}% annual return</p>
                  <p className="mt-2 text-sm">Invested: ₹{formatCurrency(investments[option.asset] || 0)}</p>

                  {option.asset === "gold" ? (
                    <div className="space-y-2">
                      <div className="text-sm font-bebas text-black mt-2">₹{formatCurrency(currentGoldRate)} per gram</div>
                      <input
                        type="number"
                        className="w-full p-2 border-2 border-black rounded mt-2 bg-white text-black"
                        placeholder="Quantity (grams)"
                        value={goldQuantity}
                        onChange={(e) => setGoldQuantity(Number(e.target.value))}
                      />
                      <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-300 border-2 border-black"
                        onClick={() => handleGoldInvest(goldQuantity)}
                      >
                        Buy Gold
                      </button>
                      <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-300 border-2 border-black"
                        onClick={() => handleGoldWithdraw(goldQuantity)}
                      >
                        Sell Gold
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="number"
                        className="w-full p-2 border-2 border-black rounded mt-2 bg-white text-black"
                        placeholder="Amount"
                        step="1000"
                        value={amounts[option.asset] || ""}
                        onChange={(e) =>
                          setAmounts((prev) => ({ ...prev, [option.asset]: Number(e.target.value) }))
                        }
                      />

                      <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mt-2 transition duration-300 border-2 border-black"
                        onClick={() => handleInvest(option.asset, amounts[option.asset] || 0)}
                      >
                        Invest
                      </button>

                      <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2 transition duration-300 border-2 border-black"
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
        </div>

        {/* Right Sidebar - Investments */}
        <div className="bg-yellow-300 p-6 border-l-4 border-black">
          <h2 className="text-2xl font-bebas">Your Investments</h2>
          <div className="space-y-4">
            {investmentOptions.map((option) => {
              const profitOrLoss = calculateProfitOrLoss(option.asset);
              const profitOrLossColor = profitOrLoss >= 0 ? "text-green-500" : "text-red-500";

              return (
                <div key={option.asset} className="bg-white p-4 rounded-lg shadow-lg border-4 border-black">
                  <h3 className="text-xl font-bebas">{option.name}</h3>
                  <p className="text-sm">Amount: ₹{formatCurrency(investments[option.asset])}</p>
                  <p className={`text-sm ${profitOrLossColor}`}>
                    {profitOrLoss >= 0 ? "Profit" : "Loss"}: ₹{formatCurrency(profitOrLoss)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <AnimatePresence>
        {showExpenseModal && currentEvent && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bebas">{currentEvent.title}</h2>
              <p className="mt-2">{currentEvent.description}</p>
              <p className="mt-2">Cost: ₹{formatCurrency(currentEvent.cost)}</p>
              <div className="mt-4 space-x-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  onClick={payExpenseWithCash}
                >
                  Pay with Cash
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={payExpenseWithInvestments}
                >
                  Pay with Investments
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}