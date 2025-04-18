"use client"

import { useState, useEffect } from "react"
import { LotteryResults } from "@/components/results/lottery-results"
import { PastDraws } from "@/components/results/past-draws"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
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
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t("results.title")}</h1>
        <p className="text-muted-foreground">{t("results.description")}</p>
      </div>
      <LotteryResults />
      <PastDraws />
    </div>
  )
}
