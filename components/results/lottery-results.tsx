"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function LotteryResults() {
  const [activeTab, setActiveTab] = useState("weekly")

  const results = {
    weekly: {
      drawDate: "April 10, 2023",
      numbers: [7, 14, 22, 36, 41, 49],
      jackpot: "50 ETH",
      winners: 2,
      nextDraw: "April 17, 2023",
      nextJackpot: "55 ETH",
    },
    daily: {
      drawDate: "April 12, 2023",
      numbers: [3, 11, 17, 25, 29, 33],
      jackpot: "5 ETH",
      winners: 1,
      nextDraw: "April 13, 2023",
      nextJackpot: "5.5 ETH",
    },
    monthly: {
      drawDate: "April 1, 2023",
      numbers: [5, 18, 23, 37, 42, 50],
      jackpot: "100 ETH",
      winners: 0,
      nextDraw: "May 1, 2023",
      nextJackpot: "125 ETH",
    },
  }

  return (
    <div>
      <Tabs defaultValue="weekly" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="weekly">Weekly Mega Draw</TabsTrigger>
          <TabsTrigger value="daily">Daily Quick Draw</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Jackpot</TabsTrigger>
        </TabsList>
        {Object.entries(results).map(([key, data]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Draw Results - {data.drawDate}</span>
                  <Badge variant="outline" className="ml-2">
                    Jackpot: {data.jackpot}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-center gap-4">
                    {data.numbers.map((number, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-lg border-2 border-emerald-200"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">Winners</p>
                      <p className="font-bold text-xl">{data.winners}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">Next Draw</p>
                      <p className="font-bold text-xl">{data.nextDraw}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">Next Jackpot</p>
                      <p className="font-bold text-xl">{data.nextJackpot}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
