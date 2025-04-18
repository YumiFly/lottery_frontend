"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useLotteryData } from "@/hooks/use-lottery-data"

export function LotteryResults() {
  const [activeTab, setActiveTab] = useState("1") // 默认选中第一个彩票类型
  const { t } = useLanguage()
  const { lotteryResults, lotteryTypes, isLoadingResults, errorResults, refreshResults } = useLotteryData()

  if (isLoadingResults) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-500">{t("common.loading")}</p>
      </div>
    )
  }

  if (errorResults) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{errorResults}</p>
        <Button variant="outline" className="mt-4" onClick={refreshResults}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      </div>
    )
  }

  // 根据彩票类型组织结果
  const resultsByType: Record<string, any> = {}

  // 如果有彩票类型，则按类型组织结果
  if (lotteryTypes.length > 0) {
    lotteryTypes.forEach((type) => {
      const typeResults = lotteryResults[type.type_id]
      if (typeResults) {
        resultsByType[type.type_id] = {
          ...typeResults,
          typeName: type.type_name,
        }
      }
    })
  } else {
    // 如果没有彩票类型，则使用默认结果
    resultsByType["1"] = {
      drawDate: "April 10, 2023",
      numbers: [7, 14, 22, 36, 41, 49],
      jackpot: "50 ETH",
      winners: 2,
      nextDraw: "April 17, 2023",
      nextJackpot: "55 ETH",
      typeName: "Weekly Mega Draw",
    }
    resultsByType["2"] = {
      drawDate: "April 12, 2023",
      numbers: [3, 11, 17, 25, 29, 33],
      jackpot: "5 ETH",
      winners: 1,
      nextDraw: "April 13, 2023",
      nextJackpot: "5.5 ETH",
      typeName: "Daily Quick Draw",
    }
    resultsByType["3"] = {
      drawDate: "April 1, 2023",
      numbers: [5, 18, 23, 37, 42, 50],
      jackpot: "100 ETH",
      winners: 0,
      nextDraw: "May 1, 2023",
      nextJackpot: "125 ETH",
      typeName: "Monthly Jackpot",
    }
  }

  // 确保有可用的彩票类型
  const availableTypes = Object.keys(resultsByType)
  if (availableTypes.length > 0 && !availableTypes.includes(activeTab)) {
    setActiveTab(availableTypes[0])
  }

  return (
    <div>
      <Tabs defaultValue={availableTypes[0]} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {availableTypes.map((typeId) => (
            <TabsTrigger key={typeId} value={typeId}>
              {resultsByType[typeId].typeName}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTypes.map((typeId) => {
          const data = resultsByType[typeId]
          return (
            <TabsContent key={typeId} value={typeId}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>
                      {t("results.drawResults")} - {data.drawDate}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {t("results.jackpot")}: {data.jackpot}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-center gap-4">
                      {Array.isArray(data.numbers)
                        ? data.numbers.map((number: number, index: number) => (
                            <div
                              key={index}
                              className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-lg"
                            />
                          ))
                        : null}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{t("results.nextDraw")}</h3>
                      <p>{data.nextDraw}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{t("results.nextJackpot")}</h3>
                      <p>{data.nextJackpot}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{t("results.winners")}</h3>
                      <p>{data.winners}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
