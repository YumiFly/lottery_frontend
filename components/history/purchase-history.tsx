"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Search, Loader2, RefreshCw } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useLanguage } from "@/hooks/use-language"
import { fetchTicketPurchases } from "@/lib/services/lottery-service"

interface TicketStats {
  total: number
  active: number
  won: number
  lost: number
}

interface TicketPurchase {
  id: string
  date: string
  lottery: string
  numbers: string
  price: string
  status: "Active" | "Won" | "Lost"
  drawDate: string
  prize?: string
}

export function PurchaseHistory() {
  const [activeTab, setActiveTab] = useState("all")
  const [purchaseHistory, setPurchaseHistory] = useState<TicketPurchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TicketStats>({ total: 0, active: 0, won: 0, lost: 0 })
  const { address } = useWallet()
  const { t } = useLanguage()

  const loadPurchaseHistory = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchTicketPurchases(address)
      setPurchaseHistory(data)

      // Calculate stats
      const newStats = {
        total: data.length,
        active: data.filter((ticket) => ticket.status === "Active").length,
        won: data.filter((ticket) => ticket.status === "Won").length,
        lost: data.filter((ticket) => ticket.status === "Lost").length,
      }
      setStats(newStats)
    } catch (err) {
      console.error("Failed to fetch purchase history:", err)
      setError("Failed to load purchase history. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPurchaseHistory()
  }, [address])

  const filteredHistory =
    activeTab === "all"
      ? purchaseHistory
      : purchaseHistory.filter((ticket) => ticket.status.toLowerCase() === activeTab)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadPurchaseHistory} variant="outline" className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      </div>
    )
  }

  if (purchaseHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">{t("common.noData")}</h3>
        <p className="text-gray-500 mb-6">You haven't purchased any lottery tickets yet.</p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <a href="/buy">{t("common.buyTickets")}</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("history.totalTickets")}</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("history.activeTickets")}</CardDescription>
            <CardTitle className="text-2xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("history.winningTickets")}</CardDescription>
            <CardTitle className="text-2xl">{stats.won}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("history.lostTickets")}</CardDescription>
            <CardTitle className="text-2xl">{stats.lost}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t("history.allTickets")}</TabsTrigger>
          <TabsTrigger value="active">{t("history.active")}</TabsTrigger>
          <TabsTrigger value="won">{t("history.won")}</TabsTrigger>
          <TabsTrigger value="lost">{t("history.lost")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("history.date")}</TableHead>
                  <TableHead>{t("history.lottery")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("history.numbers")}</TableHead>
                  <TableHead>{t("history.price")}</TableHead>
                  <TableHead>{t("history.status")}</TableHead>
                  <TableHead className="text-right">{t("history.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.date}</TableCell>
                      <TableCell>{ticket.lottery}</TableCell>
                      <TableCell className="hidden md:table-cell">{ticket.numbers}</TableCell>
                      <TableCell>{ticket.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.status === "Active" ? "outline" : ticket.status === "Won" ? "default" : "secondary"
                          }
                          className={
                            ticket.status === "Won"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ticket.status === "Lost"
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                : ""
                          }
                        >
                          {ticket.status}
                          {ticket.status === "Won" && ticket.prize && ` (${ticket.prize})`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Search className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View on blockchain</span>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
