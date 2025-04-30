"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { fetchRecentResults } from "@/lib/services/lottery-service-v2"
import { convertResultToUIFormat } from "@/lib/utils/lottery"

export function PastDraws() {
  const [lotteryType, setLotteryType] = useState("all")
  const [page, setPage] = useState(1)
  const { t } = useLanguage()
  const [draws, setDraws] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDraws() {
      try {
        setIsLoading(true)
        const rawResults = await fetchRecentResults()
        const formattedResults = rawResults.map(convertResultToUIFormat)
        setDraws(formattedResults)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch past draws:", err)
        setError("Failed to load past draws. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    loadDraws()
  }, [])

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-500">{t("common.loading")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      </div>
    )
  }

  // 筛选
  const filteredDraws = lotteryType === "all" ? draws : draws.filter(draw => draw.typeName === lotteryType)

  // 分页
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredDraws.length / itemsPerPage)
  const paginatedDraws = filteredDraws.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // 提取所有类型
  const lotteryTypes = Array.from(new Set(draws.map(draw => draw.typeName)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{t("results.pastDraws")}</h3>
        <Select value={lotteryType} onValueChange={setLotteryType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("results.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("results.allLotteries")}</SelectItem>
            {lotteryTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("results.lotteryName")}</TableHead>
              <TableHead>{t("results.issueNumber")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("results.winningNumbers")}</TableHead>
              <TableHead>{t("results.drawTime")}</TableHead>
              <TableHead>{t("results.prizePool")}</TableHead>
              <TableHead>{t("results.status")}</TableHead>
              <TableHead className="text-right">{t("results.verify")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDraws.length > 0 ? (
              paginatedDraws.map((draw) => (
                <TableRow key={draw.issueId}>
                  <TableCell>{draw.lotteryName}</TableCell>
                  <TableCell>{draw.issueNumber}</TableCell>
                  <TableCell className="hidden md:table-cell">{draw.winningNumbers}</TableCell>
                  <TableCell>{draw.drawTime}</TableCell>
                  <TableCell>{draw.prizePool} ETH</TableCell>
                  <TableCell>{draw.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">{t("results.verify")}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {t("common.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t("common.previous")}</span>
          </Button>
          <div className="text-sm text-gray-500">
            {t("results.page")} {page} {t("results.of")} {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">{t("common.next")}</span>
          </Button>
        </div>
      )}
    </div>
  )
}