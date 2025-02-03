"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, Asset } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

// Define available investment options
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
    timeScale,
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

  const progress = Math.min(1, (currentTime - startTime) / (10 * 60 * 1000));
  const timeRemaining = Math.max(0, 10 * 60 - (currentTime - startTime) / 1000);
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);

  const handleInvest = () => {
    if (!selectedAsset || amount <= 0 || amount > cash) {
      alert("Invalid investment amount");
      return;
    }
    invest(selectedAsset, amount);
    setAmount(0);
    alert(`Invested ₹${formatCurrency(amount)} in ${selectedAsset}!`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-[300px,1fr] h-screen">
        {/* Left Sidebar */}
        <div className="bg-primary/10 p-6 border-r border-primary/20">
          <div className="space-y-6">
            <div className="text-2xl font-heading">Year {Math.floor(progress * 20)} of 20</div>

            <div className="w-full bg-primary/20 h-2 rounded-full">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
            </div>

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
          <div className="mt-24 grid grid-cols-2 gap-6">
            {/* Investment Form */}
            <div className="bg-primary/10 p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-heading mb-4">💰 Invest Your Money</h2>
              <p className="text-sm mb-2">Available Cash: ₹{formatCurrency(cash)}</p>

              <select
                onChange={(e) => setSelectedAsset(e.target.value as Asset)}
                className="w-full p-2 mb-2 border rounded"
              >
                <option value="">Select Investment</option>
                {investmentOptions.map((option) => (
                  <option key={option.asset} value={option.asset}>
                    {option.name} - {option.returnRate}% annual return
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount to invest"
                className="w-full p-2 mb-2 border rounded"
              />

              <button
                onClick={handleInvest}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg"
                disabled={!selectedAsset || amount <= 0 || amount > cash}
              >
                Invest
              </button>
            </div>

            {/* Investment Summary */}
            <div className="bg-primary/10 p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-heading mb-4">📈 Your Investments</h2>
              {Object.entries(investments).map(([asset, amount]) =>
                amount > 0 ? (
                  <div key={asset} className="flex justify-between text-sm border-b py-2">
                    <span>{asset}</span>
                    <span className="font-mono">₹{formatCurrency(amount)}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background p-8 rounded-lg shadow-xl max-w-md w-full"
          >
            <h2 className="text-2xl font-heading mb-4">Game Over!</h2>
            <p className="mb-4">Final Net Worth: ₹{formatCurrency(netWorth)}</p>
            <button onClick={initializeGame} className="w-full bg-primary text-white px-4 py-2 rounded-lg">
              Play Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
