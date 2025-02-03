"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Trophy, Wallet, TrendingUp, Target } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-black">Invesim</h1>
        <ThemeToggle />
      </header>
      <div className="max-w-7xl mx-auto p-8">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-7xl font-black leading-tight">
              Learn to Build
              <span className="block text-primary">Real Wealth</span>
            </h2>
            <p className="text-2xl text-muted-foreground">
              Master investing through our interactive financial simulator
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/game" className="inline-block">
                <button className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">
                  Start Playing <ArrowRight className="inline ml-2" />
                </button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card p-8 rounded-xl border-4 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Trophy className="mr-2" /> Top Investors
            </h3>
            <div className="space-y-4">
              {[
                { name: "Alex M.", worth: "₹2.5M", rank: 1 },
                { name: "Sarah K.", worth: "₹2.1M", rank: 2 },
                { name: "John D.", worth: "₹1.8M", rank: 3 },
              ].map((player, index) => (
                <motion.div
                  key={player.name}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg border-2 border-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <span className="font-bold mr-4">#{player.rank}</span>
                    <span>{player.name}</span>
                  </div>
                  <span className="font-mono font-bold">{player.worth}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Wallet,
              title: "Portfolio Management",
              description: "Build and manage your investment portfolio with virtual money",
            },
            {
              icon: TrendingUp,
              title: "Market Simulation",
              description: "Experience real market conditions and learn to make informed decisions",
            },
            {
              icon: Target,
              title: "Risk Management",
              description: "Learn to balance risk and reward in your investment strategy",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card p-6 rounded-xl border-4 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <feature.icon className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

