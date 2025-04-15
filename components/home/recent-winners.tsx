"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { fetchRecentWinners, type RecentWinners} from "@/lib/services/lottery-service"

export function RecentWinners() {
  const { t } = useLanguage()
  const [winners, setWinners] = useState<RecentWinners[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWinners = async () => {
      try {
        setIsLoading(true)
        const data = await fetchRecentWinners()
        setWinners(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch winners:", err)
        setError("Failed to load recent winners. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadWinners()
  }, [])

  if (isLoading) {
    return (
      <section className="py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-500">Loading winners...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 text-center">
        <p className="text-red-500">{error}</p>
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
        {winners.map((winner, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" /> {winner.win_amount}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-emerald-100 text-emerald-800">
                    {winner.winner_addr.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{winner.winner_addr}</p>
                  <p className="text-xs text-gray-500">
                    {t("home.recentWinners.wonIn")} {winner.ticket_name} {t("home.recentWinners.on")} {winner.win_date}
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
