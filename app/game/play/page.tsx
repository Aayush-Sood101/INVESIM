"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, Asset } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

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
    initializeGame,
    advanceTime,
    invest,
    withdraw,
    updateNetWorth,
  } = useGameStore();

  const animationFrameRef = useRef<number>();
  const [amounts, setAmounts] = useState<{ [key in Asset]?: number }>({});
  const [goldQuantity, setGoldQuantity] = useState<number>(0);
  const [investmentOptions, setInvestmentOptions] = useState(baseInvestmentOptions);
  const [previousRates, setPreviousRates] = useState<{ [key in Asset]?: number }>({});
  const [currentYear, setCurrentYear] = useState<number>(0);

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
  }, [advanceTime]);

  const progress = Math.min(1, (currentTime - startTime) / (10 * 100 * 1000));
  const year = Math.floor(progress * 20);

  useEffect(() => {
    if (year > currentYear) {
      updateInvestmentRates();
      setCurrentYear(year);
    }
  }, [year, currentYear]);

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

            <div className="space-y-2">
              <h2 className="font-bebas">POCKET CASH</h2>
              <div className="text-2xl font-mono">₹{formatCurrency(cash)}</div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bebas">NET WORTH</h2>
              <div className="text-2xl font-mono">₹{formatCurrency(netWorth)}</div>
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
                      <div className="text-lg font-bebas text-black mt-2">Current Gold Rate: ₹{formatCurrency(currentGoldRate)} per gram</div>
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
            {investmentOptions.map((option) => (
              <div key={option.asset} className="bg-white p-4 rounded-lg shadow-lg border-4 border-black">
                <h3 className="text-xl font-bebas">{option.name}</h3>
                <p className="text-sm">Amount: ₹{formatCurrency(investments[option.asset])}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}