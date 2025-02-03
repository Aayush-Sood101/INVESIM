"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface GameResult {
  date: string
  netWorth: number
  passiveIncome: number
}

export default function Results() {
  const [results, setResults] = useState<GameResult[]>([])

  useEffect(() => {
    const storedResults = localStorage.getItem("gameResults")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <h1 className="text-3xl font-bold mb-6">Past Game Results</h1>
      {results.length > 0 ? (
        <div className="grid gap-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              className="bg-card p-6 rounded-xl border-4 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="font-bold">Date: {result.date}</p>
              <p>Final Net Worth: ₹{result.netWorth.toLocaleString()}</p>
              <p>Final Passive Income: ₹{result.passiveIncome.toLocaleString()}/month</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p>No past game results found.</p>
      )}
    </div>
  )
}

