"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Clock, Ticket, RefreshCw } from "lucide-react"
import { FeaturedLottery, fetchLotteries, purchaseTickets } from "@/lib/services/lottery-service"
import dayjs from 'dayjs'
import { useWallet } from "@/hooks/use-wallet"

const extractBettingRules = (rules: string): { maxNumbers: number; numberRange: number } => {
  const parts = rules.split(',')
  const maxNumbersMatch = parts.find((part) => part.includes('numbers'))
  const rangeMatch = parts.find((part) => part.includes('from'))

  const maxNumbers = 3
  const numberRange = 36

  return { maxNumbers, numberRange }
}

export function LotteryPurchase() {
  const searchParams = useSearchParams()
  const initialLotteryIdFromURL = searchParams.get("id")
  const [activeTab, setActiveTab] = useState<string>(initialLotteryIdFromURL || "")
  const [allLotteries, setAllLotteries] = useState<FeaturedLottery[]>([])
  const [filteredLottery, setFilteredLottery] = useState<FeaturedLottery | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [ticketCount, setTicketCount] = useState(1)
  const { toast } = useToast()
  const { address } = useWallet()

  useEffect(() => {
    const loadLotteries = async () => {
      try {
        setIsLoading(true)
        const data = await fetchLotteries()
        setAllLotteries(data)
        setError(null)
        if (!initialLotteryIdFromURL && data.length > 0) {
          setActiveTab(data[0].lottery_id)
        }
      } catch (err) {
        console.error("Failed to fetch lotteries:", err)
        setError("Failed to load lotteries. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    loadLotteries()
  }, [initialLotteryIdFromURL])

  useEffect(() => {
    const lottery = allLotteries.find(lottery => lottery.lottery_id === activeTab);
    setFilteredLottery(lottery);
  }, [allLotteries, activeTab]);

  if (isLoading) {
    return <div>Loading lotteries...</div>
  }

  if (error) {
    return <div>Error loading lotteries: {error}</div>
  }

  if (!address) {
    return <div>Please connect your wallet.</div>
  }

  if (!allLotteries || allLotteries.length === 0) {
    return <div>No lotteries available.</div>
  }

  const activeLottery = filteredLottery;

  if (!activeLottery) {
    return <div>No lottery details available for the selected tab.</div>
  }

  const { maxNumbers, numberRange } = extractBettingRules(activeLottery.betting_rules)
  const endTime = activeLottery.lotteryIssue[0]?.sale_end_time ? dayjs(activeLottery.lotteryIssue[0]?.sale_end_time).format('YYYY-MM-DD HH:mm:ss') : 'N/A'
  const prize = activeLottery.prize_structure
  const ticketPrice = activeLottery.ticket_price
  const lotteryName = activeLottery.ticket_name
  const currentIssueId = activeLottery.lotteryIssue[0]?.issue_id

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number))
    } else if (selectedNumbers.length < maxNumbers) {
      setSelectedNumbers([...selectedNumbers, number])
    } else {
      toast({
        title: "Maximum numbers selected",
        description: `You can only select ${maxNumbers} numbers for this lottery.`,
        variant: "destructive",
      })
    }
  }

  const generateRandomNumbers = () => {
    const numbers: number[] = []
    while (numbers.length < maxNumbers) {
      const randomNumber = Math.floor(Math.random() * numberRange) + 1
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber)
      }
    }
    setSelectedNumbers(numbers)
  }

  const handlePurchase = async () => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to purchase tickets.",
        variant: "destructive",
      })
      return
    }

    if (selectedNumbers.length !== maxNumbers) {
      toast({
        title: "Incorrect number of selections",
        description: `Please select exactly ${maxNumbers} numbers to purchase tickets.`,
        variant: "destructive",
      })
      return
    }

    if (!currentIssueId) {
      toast({
        title: "No active issue",
        description: "There is no active issue for this lottery.",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)
    try {
      const betContent = selectedNumbers.sort((a, b) => a - b).join(',')
      const purchaseAmount = parseFloat(ticketPrice) * ticketCount

      const success = await purchaseTickets(
        currentIssueId,
        address,
        betContent,
        purchaseAmount
      )

      if (success) {
        toast({
          title: "Tickets purchased successfully!",
          description: `You have purchased ${ticketCount} ticket(s) for the ${lotteryName}.`,
        })
        setSelectedNumbers([])
        setTicketCount(1)
      } else {
        toast({
          title: "Purchase Failed",
          description: "There was an error processing your purchase. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error purchasing tickets:", error)
      toast({
        title: "Purchase Failed",
        description: error?.message || "An unexpected error occurred during purchase.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {allLotteries.map((lottery) => (
            <TabsTrigger key={lottery.lottery_id} value={lottery.lottery_id}>
              {lottery.ticket_name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Select Your Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">
                    Select {maxNumbers} numbers from 1 to {numberRange}
                  </p>
                  <Button variant="outline" size="sm" onClick={generateRandomNumbers}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Random
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: numberRange }, (_, i) => i + 1).map((number) => (
                    <Button
                      key={number}
                      variant={selectedNumbers.includes(number) ? "default" : "outline"}
                      className={`h-10 w-10 p-0 ${
                        selectedNumbers.includes(number) ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      }`}
                      onClick={() => handleNumberClick(number)}
                    >
                      {number}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Lottery:</span>
                  <span className="font-medium">{activeLottery?.ticket_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Prize Pool:</span>
                  <span className="font-medium">{activeLottery?.prize_structure}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ticket Price:</span>
                  <span className="font-medium">{activeLottery?.ticket_price} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ends in:</span>
                  <span className="font-medium text-orange-600 flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {activeLottery?.lotteryIssue[0]?.sale_end_time ? (
                      dayjs(activeLottery.lotteryIssue[0]?.sale_end_time).format('YYYY-MM-DD HH:mm:ss')
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <Label htmlFor="ticket-count">Number of Tickets</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}>
                      -
                    </Button>
                    <Input
                      id="ticket-count"
                      type="number"
                      min="1"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Number.parseInt(e.target.value) || 1)}
                      className="text-center"
                    />
                    <Button variant="outline" size="sm" onClick={() => setTicketCount(ticketCount + 1)}>
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                  <span>Total:</span>
                  <span>{Number.parseFloat(activeLottery?.ticket_price || '0') * ticketCount} ETH</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handlePurchase}
                  disabled={selectedNumbers.length !== maxNumbers || isPurchasing || !address || !activeLottery?.lotteryIssue[0]?.issue_id}
                >
                  <Ticket className="mr-2 h-4 w-4" /> Purchase Tickets
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}