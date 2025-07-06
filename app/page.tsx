"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Trophy, Wallet, TrendingUp, Target } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10 text-foreground">
      <header className="p-4 flex justify-between items-center backdrop-blur-xl bg-background/80 border-b border-border/50 sticky top-0 z-50">
        <h1 className="text-2xl font-black font-orbitron bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Invesim</h1>
        <ThemeToggle />
      </header>
      <div className="max-w-7xl mx-auto p-8">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-7xl font-black leading-tight font-orbitron">
              Learn to Build
              <span className="block bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">Real Wealth</span>
            </h2>
            <p className="text-2xl text-muted-foreground font-poppins">
              Master investing through our interactive financial simulator
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/game" className="inline-block">
                <button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-xl font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-300 font-orbitron">
                  Start Playing <ArrowRight className="inline ml-2" />
                </button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border-2 border-primary/20 shadow-2xl dark:shadow-primary/10 relative overflow-hidden"
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center font-orbitron">
                <Trophy className="mr-2 text-primary" /> What is Invesim?
              </h3>
              <div className="space-y-4 text-lg font-poppins">
                <p>
                  <strong className="text-primary">Invesim</strong> is a realistic investment simulator that teaches you wealth-building strategies without risking real money.
                </p>
                <p>
                  Experience <span className="text-primary font-semibold font-orbitron">10 years of investing</span> in just 10 minutes. Trade stocks, crypto, and real estate while managing life events like weddings, medical bills, and career growth.
                </p>
                <p>
                  Compete against our intelligent AI opponent that adapts to your skill level and see who can build the most wealth!
                </p>
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-lg border-l-4 border-primary backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground italic font-poppins">
                    "Perfect for beginners learning the basics and experienced investors testing new strategies."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Features Section */}
        <div className="mb-16 mt-2">
          <h2 className="text-4xl font-bold text-center mb-12 font-orbitron bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Why Choose Invesim?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl dark:hover:shadow-primary/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-orbitron">Realistic Market Simulation</h3>
                <p className="text-muted-foreground font-poppins">
                  Experience real market volatility with dynamic stock prices, crypto swings, and property values that change monthly.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl dark:hover:shadow-primary/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-orbitron">Life Event Challenges</h3>
                <p className="text-muted-foreground font-poppins">
                  Handle unexpected expenses like weddings, medical bills, and home repairs while staying on track with your goals.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl dark:hover:shadow-primary/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-orbitron">AI Competition</h3>
                <p className="text-muted-foreground font-poppins">
                  Race against an intelligent AI that makes smart financial decisions. Choose your difficulty and see if you can outperform!
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Key Stats Section */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/5 to-transparent dark:from-primary/10 dark:via-primary/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-primary/20">
          <h2 className="text-3xl font-bold text-center mb-8 font-orbitron">Game Features</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-black text-primary mb-2 font-orbitron group-hover:text-primary/80 transition-colors">10 Years</div>
              <p className="text-muted-foreground font-poppins">Simulated in 10 minutes</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-black text-primary mb-2 font-orbitron group-hover:text-primary/80 transition-colors">4 Assets</div>
              <p className="text-muted-foreground font-poppins">Stocks, Crypto, Real Estate, Traditional</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-black text-primary mb-2 font-orbitron group-hover:text-primary/80 transition-colors">3 Levels</div>
              <p className="text-muted-foreground font-poppins">Easy, Medium, Hard difficulty</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-black text-primary mb-2 font-orbitron group-hover:text-primary/80 transition-colors">Real-time</div>
              <p className="text-muted-foreground font-poppins">Live market changes & events</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-primary to-primary/80 p-8 rounded-2xl text-primary-foreground relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 font-orbitron">Ready to Build Wealth?</h2>
              <p className="text-xl mb-6 opacity-90 font-poppins">
                Start your investment journey today. No sign-up required!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/game" className="inline-block">
                  <button className="bg-background text-foreground px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 font-orbitron border-2 border-background/20 hover:border-background/40">
                    Play Now - It's Free! <ArrowRight className="inline ml-2" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
      </div>
    </div>
  )
}

