"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, Asset } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

// Investment options with return rates
const investmentOptions: { name: string; asset: Asset; returnRate: number }[] = [
  { name: "Savings", asset: "savings", returnRate: 4 },
  { name: "Fixed Deposit", asset: "fixedDeposit", returnRate: 6 },
  
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
  const [amounts, setAmounts] = useState<{ [key in Asset]?: number }>({});
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

  const progress = Math.min(1, (currentTime - startTime) / (10 * 100 * 1000));

  const handleInvest = (asset: Asset) => {
    const amount = amounts[asset] || 0;
    if (amount <= 0 || amount > cash) {
      alert("Invalid investment amount");
      return;
    }
    invest(asset, amount);
    setAmounts((prev) => ({ ...prev, [asset]: 0 }));
    alert(`Invested ₹${formatCurrency(amount)} in ${asset}!`);
  };

  const handleWithdraw = (asset: Asset) => {
    const amount = amounts[asset] || 0;
    if (investments[asset] < amount || amount <= 0) {
      alert("Insufficient funds in this investment!");
      return;
    }
    withdraw(asset, amount);
    setAmounts((prev) => ({ ...prev, [asset]: 0 }));
    alert(`Withdrew ₹${formatCurrency(amount)} from ${asset}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-[300px,1fr,300px] h-screen">
        {/* Left Sidebar - Game Info */}
        <div className="bg-primary/10 p-6 border-r border-primary/20">
          <div className="space-y-6">
            <div className="text-2xl font-heading">Year {Math.floor(progress * 20)} of 20</div>

            <div className="space-y-2">
              <h2 className="font-heading">POCKET CASH</h2>
              <div className="text-2xl font-mono">₹{formatCurrency(cash)}</div>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading">NET WORTH</h2>
              <div className="text-2xl font-mono">₹{formatCurrency(netWorth)}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 relative">
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
                  value={amounts[option.asset] || ""}
                  onChange={(e) =>
                    setAmounts((prev) => ({ ...prev, [option.asset]: Number(e.target.value) }))
                  }
                />

                <button
                  className="w-full bg-green-500 text-white px-3 py-1 rounded mt-2"
                  onClick={() => handleInvest(option.asset)}
                >
                  Invest
                </button>

                <button
                  className="w-full bg-red-500 text-white px-3 py-1 rounded mt-2"
                  onClick={() => handleWithdraw(option.asset)}
                >
                  Withdraw
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}