"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, Asset } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

// Investment options with return rates
const investmentOptions: { name: string; asset: Asset; returnRate: number }[] = [
  { name: "Savings", asset: "savings", returnRate: 4 },
  { name: "Fixed Deposit", asset: "fixedDeposit", returnRate: 6 },
  { name: "PPF", asset: "ppf", returnRate: 7 },
  { name: "Nifty 50", asset: "nifty50", returnRate: 10 },
  { name: "Gold", asset: "gold", returnRate: 8 },
  { name: "Real Estate", asset: "realestate", returnRate: 12 },
  { name: "Crypto", asset: "crypto", returnRate: 20 },
];

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
  } = useGameStore();

  const animationFrameRef = useRef<number>();
  const [amount, setAmount] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

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

  const progress = Math.min(1, (currentTime - startTime) / (10 * 600 * 1000));

  const handleInvest = () => {
    if (!selectedAsset || amount <= 0 || amount > cash) {
      alert("Invalid investment amount");
      return;
    }
    invest(selectedAsset, amount);
    setAmount(0);
    alert(`Invested ₹${formatCurrency(amount)} in ${selectedAsset}!`);
  };

  const handleWithdraw = (asset: Asset, amount: number) => {
    if (investments[asset] < amount) {
      alert("Insufficient funds in this investment!");
      return;
    }
    withdraw(asset, amount);
    alert(`Withdrew ₹${formatCurrency(amount)} from ${asset}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-[300px,1fr,300px] h-screen">
        {/* Left Sidebar - Game Info */}
        <div className="bg-primary/10 p-6 border-r border-primary/20">
          <div className="space-y-6">
            <div className="text-2xl font-heading">Year {Math.floor(progress * 1.3)} of 20</div>

            <div className="space-y-2">
              <h2 className="font-heading">POCKET CASH</h2>
              <div className="text-2xl font-mono">₹{formatCurrency(cash)}</div>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading">NET WORTH</h2>
              <div className="text-2xl font-mono">₹{formatCurrency(netWorth)}</div>
            </div>

            <div className="border-t border-primary/20 pt-4">
              <h2 className="font-heading mb-4">LEADERBOARD</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>1. {aiNetWorth > netWorth ? "COMPUTER" : "YOU"}</span>
                  <span className="font-mono">₹{formatCurrency(Math.max(aiNetWorth, netWorth))}</span>
                </div>
                <div className="flex justify-between">
                  <span>2. {aiNetWorth > netWorth ? "YOU" : "COMPUTER"}</span>
                  <span className="font-mono">₹{formatCurrency(Math.min(aiNetWorth, netWorth))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 relative">
          <AnimatePresence>
            {events.slice(-1).map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute inset-x-6 top-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-heading mb-2">{event.title}</h3>
                <p>{event.description}</p>
                <p className="mt-2 font-mono">
                  {event.type === "expense" ? "-" : "+"}₹{formatCurrency(event.cost)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Investment Section */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {investmentOptions.map((option) => (
              <div key={option.asset} className="bg-primary/10 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-heading">{option.name}</h3>
                <p className="text-sm text-gray-500">{option.returnRate}% annual return</p>
                <p className="mt-2 text-sm">Invested: ₹{formatCurrency(investments[option.asset] || 0)}</p>

                <input
                  type="number"
                  className="w-full p-2 border rounded mt-2"
                  placeholder="Amount"
                  onChange={(e) => setAmount(Number(e.target.value))}
                />

                <button
                  className="w-full bg-green-500 text-white px-3 py-1 rounded mt-2"
                  onClick={() => {
                    setSelectedAsset(option.asset);
                    handleInvest();
                  }}
                >
                  Invest
                </button>

                <button
                  className="w-full bg-red-500 text-white px-3 py-1 rounded mt-2"
                  onClick={() => handleWithdraw(option.asset, amount)}
                >
                  Withdraw
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Investment Summary */}
        <div className="bg-secondary/10 p-6 border-l border-secondary/20">
          <h2 className="text-2xl font-heading mb-4">📈 Your Investments</h2>
          <div className="space-y-4">
            {investmentOptions.map((option) =>
              investments[option.asset] > 0 ? (
                <div key={option.asset} className="p-4 bg-secondary/20 rounded-lg shadow">
                  <h3 className="text-lg">{option.name}</h3>
                  <p className="text-sm text-gray-500">Annual Return: {option.returnRate}%</p>
                  <p className="text-sm">Invested: ₹{formatCurrency(investments[option.asset])}</p>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
