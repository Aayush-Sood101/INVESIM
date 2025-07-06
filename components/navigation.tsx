"use client"

import Link from "next/link"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from "./theme-toggle"

export function Navigation() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="font-semibold">
            Invesim
          </Link>
          <nav className="flex gap-4">

            <Link href="/results">Past Results</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded bg-blue-500 text-white">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

