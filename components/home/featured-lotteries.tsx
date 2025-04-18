"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Ticket, Loader2,RefreshCw } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useLotteryData } from "@/hooks/use-lottery-data"
export function FeaturedLotteries() {
  const { t } = useLanguage()
  const { lotteries, isLoadingLotteries, errorLotteries, refreshLotteries } = useLotteryData()

  if (isLoadingLotteries) {
    return (
      <section className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-500">{t("common.loading")}</p>
      </section>
    )
  }

  if (errorLotteries) {
    return (
      <section className="py-8 text-center">
        <p className="text-red-500">{errorLotteries}</p>
        <Button variant="outline" className="mt-4" onClick={refreshLotteries}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      </section>
    )
  }

  // Lottery images mapping
  const lotteryImages = ["/images/lottery-ticket.png", "/images/lottery-draw.png", "/images/lottery-winner.png"]

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">{t("home.featured.title")}</h2>
        <Link href="/buy" className="text-emerald-600 hover:text-emerald-700 font-medium">
          {t("home.featured.viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotteries.map((lottery, index) => (
          <Card key={lottery.lottery_id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video relative">
              <Image
                src={lotteryImages[index % lotteryImages.length] || "/placeholder.svg"}
                alt={lottery.ticket_name}
                width={400}
                height={225}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 right-3 bg-emerald-600">Prize: {lottery.ticket_price}</Badge>
            </div>
            <CardHeader>
              <CardTitle>{lottery.ticket_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("home.featured.ticketPrice")}:</span>
                  <span className="font-medium">{lottery.ticket_price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("home.featured.participants")}:</span>
                  <span className="font-medium">{lottery.prize_structure}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {t("home.featured.endsIn")}:
                  </span>
                  <span className="font-medium text-orange-600">{lottery.lotteryIssue[0].sale_end_time}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/buy?id=${lottery.lottery_id}`}>
                  <Ticket className="mr-2 h-4 w-4" /> {t("home.featured.buyTickets")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
