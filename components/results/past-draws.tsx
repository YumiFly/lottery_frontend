"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

export function PastDraws() {
  const [lotteryType, setLotteryType] = useState("all")
  const [page, setPage] = useState(1)

  const pastDraws = [
    {
      id: "draw-001",
      date: "Apr 10, 2023",
      type: "Weekly Mega Draw",
      numbers: "7, 14, 22, 36, 41, 49",
      jackpot: "50 ETH",
      winners: 2,
      txHash: "0x1a2b3c...",
    },
    {
      id: "draw-002",
      date: "Apr 12, 2023",
      type: "Daily Quick Draw",
      numbers: "3, 11, 17, 25, 29, 33",
      jackpot: "5 ETH",
      winners: 1,
      txHash: "0x4d5e6f...",
    },
    {
      id: "draw-003",
      date: "Apr 11, 2023",
      type: "Daily Quick Draw",
      numbers: "8, 15, 19, 27, 31, 42",
      jackpot: "5 ETH",
      winners: 3,
      txHash: "0x7g8h9i...",
    },
    {
      id: "draw-004",
      date: "Apr 3, 2023",
      type: "Weekly Mega Draw",
      numbers: "2, 9, 18, 24, 39, 45",
      jackpot: "45 ETH",
      winners: 1,
      txHash: "0xj0k1l2...",
    },
    {
      id: "draw-005",
      date: "Apr 1, 2023",
      type: "Monthly Jackpot",
      numbers: "5, 18, 23, 37, 42, 50",
      jackpot: "100 ETH",
      winners: 0,
      txHash: "0xm3n4o5...",
    },
  ]

  const filteredDraws = lotteryType === "all" ? pastDraws : pastDraws.filter((draw) => draw.type === lotteryType)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Past Draws</h3>
        <Select value={lotteryType} onValueChange={setLotteryType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lotteries</SelectItem>
            <SelectItem value="Weekly Mega Draw">Weekly Mega Draw</SelectItem>
            <SelectItem value="Daily Quick Draw">Daily Quick Draw</SelectItem>
            <SelectItem value="Monthly Jackpot">Monthly Jackpot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Lottery Type</TableHead>
              <TableHead className="hidden md:table-cell">Winning Numbers</TableHead>
              <TableHead>Jackpot</TableHead>
              <TableHead>Winners</TableHead>
              <TableHead className="text-right">Verify</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDraws.map((draw) => (
              <TableRow key={draw.id}>
                <TableCell>{draw.date}</TableCell>
                <TableCell>{draw.type}</TableCell>
                <TableCell className="hidden md:table-cell">{draw.numbers}</TableCell>
                <TableCell>{draw.jackpot}</TableCell>
                <TableCell>{draw.winners}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Verify on blockchain</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <div className="text-sm text-gray-500">Page {page} of 3</div>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === 3}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  )
}
