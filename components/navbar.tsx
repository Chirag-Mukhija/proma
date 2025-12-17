"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Boxes } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto glass-effect rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Boxes className="h-6 w-6 text-primary" />
            <span>Proma</span>
          </Link>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
