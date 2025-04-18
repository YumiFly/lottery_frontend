"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useLotteryData } from "@/hooks/use-lottery-data"

export function PastDraws() {
  const [lotteryType, setLotteryType] = useState("all")
  const [page, setPage] = useState(1)
  const { t } = useLanguage()
  const {
    pastDraws,
    lotteryTypes,
    lotteryIssues,
    isLoadingPastDraws,
    isLoadingIssues,
    errorPastDraws,
    refreshPastDraws,
  } = useLotteryData()

  // 结合彩票期号和历史抽奖数据
  const combinedDraws = lotteryIssues
    .filter((issue) => issue.status === "DRAWN")
    .map((issue) => {
      // 查找对应的彩票
      const lottery = lotteryTypes.find((type) => {
        const pastDraw = pastDraws.find((draw) => draw.id === issue.issue_id)
        return pastDraw && pastDraw.type === type.type_name
      })

      return {
        id: issue.issue_id,
        date: new Date(issue.draw_time || issue.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        type: lottery ? lottery.type_name : "未知类型",
        numbers: issue.winning_numbers,
        jackpot: `${Math.floor(Math.random() * 100) + 5} ETH`, // 模拟奖金
        winners: Math.floor(Math.random() * 5), // 模拟获奖人数
        txHash: issue.draw_tx_hash || `0x${Math.random().toString(16).substring(2, 10)}...`,
      }
    })

  if (isLoadingPastDraws || isLoadingIssues) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-500">{t("common.loading")}</p>
      </div>
    )
  }

  if (errorPastDraws) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{errorPastDraws}</p>
        <Button variant="outline" className="mt-4" onClick={refreshPastDraws}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      </div>
    )
  }

  // 根据选择的彩票类型过滤数据
  const filteredDraws =
    lotteryType === "all" ? combinedDraws : combinedDraws.filter((draw) => draw.type === lotteryType)

  // 计算分页
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredDraws.length / itemsPerPage)
  const paginatedDraws = filteredDraws.slice((page - 1) * itemsPerPage, page * itemsPerPage)

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
              <SelectItem key={type.type_id} value={type.type_name}>
                {type.type_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("results.date")}</TableHead>
              <TableHead>{t("results.lotteryType")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("results.winningNumbers")}</TableHead>
              <TableHead>{t("results.jackpot")}</TableHead>
              <TableHead>{t("results.winners")}</TableHead>
              <TableHead className="text-right">{t("results.verify")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDraws.length > 0 ? (
              paginatedDraws.map((draw) => (
                <TableRow key={draw.id}>
                  <TableCell>{draw.date}</TableCell>
                  <TableCell>{draw.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{draw.numbers}</TableCell>
                  <TableCell>{draw.jackpot}</TableCell>
                  <TableCell>{draw.winners}</TableCell>
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
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
