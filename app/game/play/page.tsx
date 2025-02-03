"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"

export default function GamePlay() {
  const {
    currentTime,
    startTime,
    timeScale,
    cash,
    netWorth,
    aiNetWorth,
    events,
    isGameOver,
    initializeGame,
    advanceTime,
    addInvestment,
    removeInvestment,
  } = useGameStore()

  const animationFrameRef = useRef<number>()

  useEffect(() => {
    initializeGame()

    function gameLoop() {
      advanceTime()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [advanceTime]) // Added advanceTime to dependencies

  const progress = Math.min(1, (currentTime - startTime) / (10 * 60 * 1000))
  const timeRemaining = Math.max(0, 10 * 60 - (currentTime - startTime) / 1000)
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = Math.floor(timeRemaining % 60)

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

          <div className="mt-24 grid grid-cols-2 gap-6">
            {/* Investment options */}
            {/* Add your investment components here */}
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
            <p className="mb-6">
              {netWorth > aiNetWorth ? "Congratulations! You beat the market!" : "Better luck next time!"}
            </p>
            <button onClick={initializeGame} className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg">
              Play Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

