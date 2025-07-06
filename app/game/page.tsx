"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronRight, AlertTriangle, Trophy, Target, Coins, TrendingUp, Timer, Users, DollarSign, BarChart } from "lucide-react"
import Link from "next/link"
import { useGameStore } from "@/lib/store"

const difficulties = [
  {
    name: "Easy",
    subtitle: "Beginner Friendly",
    icon: Target,
    description: "Perfect for learning the basics of investing",
    details: {
      salary: "₹7.2L/year",
      startingCash: "₹2,00,000",
      aiReturns: "8% average",
      aiVolatility: "15% volatility",
      aiInvestment: "60% invested",
      marketCondition: "Gentle losses, forgiving market",
      difficulty: "Relaxed competition"
    },
    riskLevel: 20,
    color: "bg-green-500",
    bgGradient: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    features: [
      "Higher starting salary",
      "More starting capital",
      "Gentler AI competitor",
      "Market-friendly conditions"
    ]
  },
  {
    name: "Medium",
    subtitle: "Balanced Challenge",
    icon: Trophy,
    description: "A balanced mix of opportunity and challenge",
    details: {
      salary: "₹6L/year",
      startingCash: "₹1,50,000",
      aiReturns: "12% average",
      aiVolatility: "20% volatility",
      aiInvestment: "75% invested",
      marketCondition: "Regular losses, realistic market",
      difficulty: "Competitive AI"
    },
    riskLevel: 50,
    color: "bg-blue-500",
    bgGradient: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    features: [
      "Moderate salary & capital",
      "Balanced market conditions",
      "Smart AI competitor",
      "Realistic volatility"
    ]
  },
  {
    name: "Hard",
    subtitle: "Expert Mode",
    icon: AlertTriangle,
    description: "For experienced players seeking a real challenge",
    details: {
      salary: "₹4.8L/year",
      startingCash: "₹1,00,000",
      aiReturns: "16% average",
      aiVolatility: "25% volatility",
      aiInvestment: "85% invested",
      marketCondition: "Frequent losses, volatile market",
      difficulty: "Aggressive AI competitor"
    },
    riskLevel: 80,
    color: "bg-purple-500",
    bgGradient: "from-purple-50 to-violet-50",
    borderColor: "border-purple-200",
    features: [
      "Lower starting resources",
      "Volatile market conditions",
      "Highly competitive AI",
      "Maximum challenge"
    ]
  },
]

export default function GamePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const { setDifficulty, initializeGame } = useGameStore()

  const handleStartGame = () => {
    if (selected) {
      setDifficulty(selected.toLowerCase() as "easy" | "medium" | "hard")
      initializeGame()
    }
  }

  const selectedDifficulty = difficulties.find(d => d.name === selected)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10 text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4 font-orbitron">
            Choose Your Challenge
          </h1>
          <p className="text-lg text-muted-foreground font-poppins">
            Select your difficulty level for the 10-year investment simulation
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {difficulties.map((difficulty, index) => {
            const Icon = difficulty.icon
            const isSelected = selected === difficulty.name
            const isExpanded = showDetails === difficulty.name
            
            return (
              <motion.div
                key={difficulty.name}
                className={`
                  relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${isSelected ? 
                    "ring-4 ring-primary/50 border-primary shadow-2xl dark:shadow-primary/20 scale-105 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10" : 
                    `${difficulty.borderColor} shadow-lg hover:shadow-xl dark:hover:shadow-primary/10 hover:scale-[1.02] bg-gradient-to-br ${difficulty.bgGradient} dark:from-card/50 dark:to-card/30`
                  }
                  backdrop-blur-sm border-opacity-50 dark:border-opacity-30
                `}
                onClick={() => {
                  setSelected(difficulty.name)
                  setShowDetails(isExpanded ? null : difficulty.name)
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${difficulty.color} bg-opacity-20`}>
                        <Icon className={`w-6 h-6 ${difficulty.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-orbitron">{difficulty.name}</h3>
                        <p className="text-sm text-muted-foreground font-poppins">{difficulty.subtitle}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div 
                        className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <ChevronRight className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 font-poppins">
                    {difficulty.description}
                  </p>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-xs text-muted-foreground">Salary</div>
                        <div className="text-sm font-bold font-mono">{difficulty.details.salary}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-muted-foreground">Starting</div>
                        <div className="text-sm font-bold font-mono">{difficulty.details.startingCash}</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Difficulty Level</span>
                      <span className="text-sm font-bold">{difficulty.riskLevel}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 border border-border">
                      <motion.div
                        className={`${difficulty.color} h-2 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${difficulty.riskLevel}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {isExpanded && (
                      <div className="pt-4 border-t border-border/30">
                        <h4 className="text-sm font-bold mb-3 flex items-center">
                          <BarChart className="w-4 h-4 mr-2" />
                          AI Competitor Details
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Average Returns:</span>
                            <span className="font-mono">{difficulty.details.aiReturns}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Volatility:</span>
                            <span className="font-mono">{difficulty.details.aiVolatility}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Investment Rate:</span>
                            <span className="font-mono">{difficulty.details.aiInvestment}</span>
                          </div>
                        </div>
                        
                        <h4 className="text-sm font-bold mb-2 mt-4 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Key Features
                        </h4>
                        <ul className="space-y-1">
                          {difficulty.features.map((feature, idx) => (
                            <li key={idx} className="text-xs flex items-center">
                              <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Game Overview */}
        <motion.div 
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-8 shadow-lg dark:shadow-primary/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center font-orbitron">
            <Timer className="w-5 h-5 mr-2 text-primary" />
            Game Overview
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium font-orbitron">Duration</div>
                <div className="text-muted-foreground font-poppins">10 years (10 minutes)</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium font-orbitron">Competition</div>
                <div className="text-muted-foreground font-poppins">AI competitor with adaptive strategy</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium font-orbitron">Goal</div>
                <div className="text-muted-foreground font-poppins">Build the largest investment portfolio</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        {selected && (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-4 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg dark:shadow-primary/5">
              <h4 className="font-bold mb-2 font-orbitron">Ready to start with {selected} difficulty?</h4>
              {selectedDifficulty && (
                <p className="text-sm text-muted-foreground font-poppins">
                  You'll start with {selectedDifficulty.details.startingCash} and earn {selectedDifficulty.details.salary} annually
                </p>
              )}
            </div>
            <Link href="/game/play">
              <motion.button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl dark:shadow-primary/20 transition-all duration-300 font-orbitron border border-primary/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start 10-Year Challenge
                <ChevronRight className="inline ml-2 w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

