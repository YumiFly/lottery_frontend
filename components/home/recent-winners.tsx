"use client"

import {useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Loader2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import {fetchRecentWinners} from "@/lib/services/lottery-service-v2"

export function RecentWinners() {
  const { t } = useLanguage()
  const [recentWinners, setRecentWinners] = useState<any[]>([])
  const [isLoadingWinners, setIsLoadingWinners] = useState<boolean>(true)
  const [errorWinners, setErrorWinners] = useState<string | null>(null)

  async function refreshWinners() {
    setIsLoadingWinners(true)
    try {
      const winners = await fetchRecentWinners()
      console.log("Recent winners:", winners) // Add this line
      setRecentWinners(winners)
      setErrorWinners(null)
    } catch (error) {
      setErrorWinners("Error loading recent winners. Please try again later.")
    } finally {
      setIsLoadingWinners(false)
    }
  }

  useEffect(() => {
    refreshWinners()
  }, [])

  if (isLoadingWinners) {
    return (
      <section className="py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-500">{t("common.loading")}</p>
      </section>
    )
  }

  if (errorWinners) {
    return (
      <section className="py-12 text-center">
        <p className="text-red-500">{errorWinners}</p>
        <Button variant="outline" className="mt-4" onClick={refreshWinners}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      </section>
    )
  }


  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{t("home.recentWinners.title")}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t("home.recentWinners.description")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentWinners.map((winner, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" /> {winner.prizeAmount}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-emerald-100 text-emerald-800">
                    {winner.winnerAddress.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{winner.winnerAddress}</p>
                  <p className="text-xs text-gray-500">
                    {t("home.recentWinners.wonIn")} {winner.lotteryName} {t("home.recentWinners.on")} {winner.createdAt}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
