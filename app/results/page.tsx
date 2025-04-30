"use client"

import { useState, useEffect } from "react"
import LotteryResults from "@/components/results/lottery-results"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export default function ResultsPage() {
  const { t } = useLanguage()
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
    <div className="container mx-auto px-4 py-8 space-y-12">
      <LotteryResults />
    </div>
  )
}
