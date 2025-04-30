"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedLotteries } from "@/components/home/featured-lotteries"
import { HowItWorks } from "@/components/home/how-it-works"
import { RecentWinners } from "@/components/home/recent-winners"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      <HeroSection/>
      <FeaturedLotteries />
      <HowItWorks />
      <RecentWinners />
    </div>
  )
}
