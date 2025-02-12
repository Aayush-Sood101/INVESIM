"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronRight, AlertTriangle, Trophy, Target } from "lucide-react"
import Link from "next/link"
import { useGameStore } from "@/lib/store"

const difficulties = [
  {
    name: "Easy",
    icon: Target,
    description: "Start with ₹75,000/month and learn the basics",
    riskLevel: 20,
    startingCapital: "₹75,000",
    color: "bg-green-500",
  },
  {
    name: "Medium",
    icon: Trophy,
    description: "Start with ₹50,000/month and take calculated risks",
    riskLevel: 50,
    startingCapital: "₹50,000",
    color: "bg-blue-500",
  },
  {
    name: "Hard",
    icon: AlertTriangle,
    description: "Start with ₹35,000/month and master advanced strategies",
    riskLevel: 80,
    startingCapital: "₹35,000",
    color: "bg-purple-500",
  },
]

export default function GamePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const { setDifficulty, initializeGame } = useGameStore()

  const handleStartGame = () => {
    if (selected) {
      setDifficulty(selected.toLowerCase() as "easy" | "medium" | "hard")
      initializeGame()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 className="text-4xl font-black mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Choose Your Difficulty
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-6">
          {difficulties.map((difficulty, index) => {
            const Icon = difficulty.icon
            return (
              <motion.div
                key={difficulty.name}
                className={`${
                  selected === difficulty.name ? "ring-4 ring-primary" : ""
                } bg-card p-6 rounded-xl border-4 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer`}
                onClick={() => setSelected(difficulty.name)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">{difficulty.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{difficulty.description}</p>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium mb-1">Risk Level</div>
                    <div className="w-full bg-muted rounded-full h-2 border-2 border-primary">
                      <motion.div
                        className={`${difficulty.color} h-2 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${difficulty.riskLevel}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-bold">Starting Salary: {difficulty.startingCapital}</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {selected && (
          <motion.div className="mt-8 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href="/game/play">
              <motion.button
                onClick={handleStartGame}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Game <ChevronRight className="inline ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

