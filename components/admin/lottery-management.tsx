"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Edit, Play } from "lucide-react";
import { format } from "date-fns";
import {
  fetchLotteries,
  createNewLottery,
  createNewLotteryIssue,
  fetchPastDraws,
  FeaturedLottery,
} from "@/lib/services/lottery-service";

export function LotteryManagement() {
  const [activeTab, setActiveTab] = useState("lotteries");
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [lotteries, setLotteries] = useState<FeaturedLottery[]>([]);
  const [pastDraws, setPastDraws] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawFrequency, setDrawFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");

  // 加载彩票和抽奖数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const lotteryData = await fetchLotteries();
        setLotteries(lotteryData);
        const drawData = await fetchPastDraws("all");
        setPastDraws(drawData);
        setError(null);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load lotteries or draws. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 创建彩票
  const handleCreateLottery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const lotteryName = formData.get("lottery-name") as string;
    const ticketPrice = parseFloat(formData.get("ticket-price") as string);
    const numberRange = parseInt(formData.get("number-range") as string);
    const numbersPerTicket = parseInt(formData.get("numbers-per-ticket") as string);
    const autoDraw = formData.get("auto-draw") === "on";
    const firstDrawDate = date?.toISOString();

    if (!lotteryName || !ticketPrice || !numberRange || !numbersPerTicket || !firstDrawDate) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 构造 API 所需的彩票数据
      const lotteryData = {
        type_id: "1", // 固定类型，实际可从 UI 获取
        ticket_name: lotteryName,
        ticket_price: ticketPrice,
        ticket_supply: 1000, // 默认供应量，API 要求但表单未提供
        betting_rules: `Choose ${numbersPerTicket} numbers between 1 and ${numberRange}`,
        prize_structure: `1st Prize: 50% of pool`, // 默认奖池结构，可从 UI 扩展
        contract_address: "0x1234567890abcdef1234567890abcdef12345678", // 默认合约地址，实际可从 UI 获取
      };

      // 调用 API 创建彩票
      const newLottery = await createNewLottery(lotteryData);

      // 创建期号
      const issueNumber = `ISSUE-${newLottery.lottery_id}-1`;
      const saleEndTime = firstDrawDate;
      await createNewLotteryIssue(newLottery.lottery_id, issueNumber, saleEndTime);

      // 刷新彩票列表
      const updatedLotteries = await fetchLotteries();
      setLotteries(updatedLotteries);

      toast({
        title: "Lottery created",
        description: `The lottery "${lotteryName}" has been created successfully.`,
      });

      // 重置表单
      form.reset();
      setDate(undefined);
      setDrawFrequency("weekly");
    } catch (error) {
      console.error("Failed to create lottery:", error);
      toast({
        title: "Creation failed",
        description: "Failed to create the lottery. Please try again.",
        variant: "destructive",
      });
    }
  };

  // 抽奖（占位逻辑）
  const handleDrawLottery = async (id: string) => {
    try {
      toast({
        title: "Drawing initiated",
        description: `Drawing process for lottery #${id} has been initiated.`,
      });
      const updatedDraws = await fetchPastDraws("all");
      setPastDraws(updatedDraws);
    } catch (error) {
      console.error("Failed to initiate draw:", error);
      toast({
        title: "Draw failed",
        description: "Failed to initiate the draw. Please try again.",
        variant: "destructive",
      });
    }
  };

  // 删除彩票（占位逻辑）
  const handleDeleteLottery = async (id: string) => {
    try {
      setLotteries(lotteries.filter((lottery) => lottery.lottery_id !== id));
      toast({
        title: "Lottery deleted",
        description: `Lottery #${id} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete lottery:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete the lottery. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading lotteries...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="lotteries">Manage Lotteries</TabsTrigger>
        <TabsTrigger value="create">Create Lottery</TabsTrigger>
        <TabsTrigger value="draws">Manage Draws</TabsTrigger>
      </TabsList>

      <TabsContent value="lotteries" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Lotteries</CardTitle>
            <CardDescription>Manage your active lottery games and their settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Ticket Price</TableHead>
                    <TableHead>Prize Pool</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Draw</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotteries.map((lottery) => (
                    <TableRow key={lottery.lottery_id}>
                      <TableCell className="font-medium">{lottery.ticket_name}</TableCell>
                      <TableCell>{lottery.ticket_price} ETH</TableCell>
                      <TableCell>{lottery.prize_structure}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            lottery.lotteryIssue[0]?.status === "OPEN"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {lottery.lotteryIssue[0]?.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lottery.lotteryIssue[0]?.sale_end_time
                          ? format(new Date(lottery.lotteryIssue[0].sale_end_time), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDrawLottery(lottery.lottery_id)}
                        >
                          <Play className="h-4 w-4" />
                          <span className="sr-only">Draw</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Are you sure?</DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will permanently delete the lottery and all
                                associated data.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteLottery(lottery.lottery_id)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="create" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Lottery</CardTitle>
            <CardDescription>Set up a new lottery game with custom parameters.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateLottery}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lottery-name">Lottery Name</Label>
                <Input id="lottery-name" name="lottery-name" placeholder="Enter lottery name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-price">Ticket Price (ETH)</Label>
                  <Input
                    id="ticket-price"
                    name="ticket-price"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number-range">Number Range</Label>
                  <Input
                    id="number-range"
                    name="number-range"
                    type="number"
                    min="10"
                    max="99"
                    placeholder="36"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numbers-per-ticket">Numbers Per Ticket</Label>
                  <Input
                    id="numbers-per-ticket"
                    name="numbers-per-ticket"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="3"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>First Draw Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Draw Frequency</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant={drawFrequency === "daily" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setDrawFrequency("daily")}
                  >
                    Daily
                  </Button>
                  <Button
                    type="button"
                    variant={drawFrequency === "weekly" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setDrawFrequency("weekly")}
                  >
                    Weekly
                  </Button>
                  <Button
                    type="button"
                    variant={drawFrequency === "monthly" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setDrawFrequency("monthly")}
                  >
                    Monthly
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="auto-draw" name="auto-draw" />
                <Label htmlFor="auto-draw">Enable automatic drawing</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" /> Create Lottery
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="draws" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Draws</CardTitle>
            <CardDescription>Schedule and execute lottery draws.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lottery</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prize Pool</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastDraws.map((draw) => (
                      <TableRow key={draw.id}>
                        <TableCell>{draw.type}</TableCell>
                        <TableCell>{draw.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{draw.status || "Scheduled"}</Badge>
                        </TableCell>
                        <TableCell>{draw.jackpot}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDrawLottery(draw.id)}
                          >
                            <Play className="h-4 w-4" />
                            <span className="sr-only">Execute</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Schedule New Draw
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}