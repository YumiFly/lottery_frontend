"use client"

import  React from "react"
import { useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2, Edit, Play, Loader2, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { useLotteryData } from "@/hooks/use-lottery-data"
import { useWallet } from "@/hooks/use-wallet"
import { useLanguage } from "@/hooks/use-language"

export function LotteryManagement() {
  const [activeTab, setActiveTab] = useState("lotteries")
  const { toast } = useToast()
  const { t } = useLanguage()
  const [saleEndDate, setSaleEndDate] = useState<Date>()
  const [issueNumber, setIssueNumber] = useState<string>("")
  const { address, isConnected} = useWallet()

  // 使用useLotteryData钩子获取数据和方法
  const {
    lotteries,
    lotteryTypes,
    isLoadingLotteries,
    isLoadingTypes,
    refreshLotteries,
    refreshTypes,
    createLottery,
    createIssue,
    executeDraw,
  } = useLotteryData()

  // 状态管理
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>("")
  const [selectedTypeId, setSelectedTypeId] = useState<string>("")
  const [isCreatingLottery, setIsCreatingLottery] = useState(false)
  const [isCreatingIssue, setIsCreatingIssue] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  // 表单状态
  const [lotteryForm, setLotteryForm] = useState({
    ticket_name: "",
    ticket_price: 1,
    ticket_supply: 1000,
    betting_rules: "选择3个1-49之间的数字",
    prize_structure: "一等奖: 50% LOT, 二等奖: 10% LOT, 三等奖: 5% LOT",
    rollout_contract_address: "",
    register_contract_address: address,
  })

  // 设置默认选中的彩票类型
  useEffect(() => {
    console.log("lotteryTypes", lotteryTypes)
    if (lotteryTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(lotteryTypes[0].type_id)
    }
  }, [lotteryTypes, selectedTypeId])

  // 设置默认选中的彩票
  useEffect(() => {
    console.log("lotteries", lotteries)
    if (lotteries.length > 0 && !selectedLotteryId) {
      setSelectedLotteryId(lotteries[0].id)
    }
  }, [lotteries, selectedLotteryId])

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLotteryForm((prev) => ({
      ...prev,
      [name]: name === "ticket_price" || name === "ticket_supply" ? Number.parseFloat(value) : value,
    }))
  }

  // 创建新彩票
  const handleCreateLottery = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTypeId) {
      toast({
        title: t("common.error"),
        description: t("admin.manage.selectLotteryType"),
        variant: "destructive",
      })
      return
    }

    setIsCreatingLottery(true)

    try {
      const lotteryData = {
        type_id: selectedTypeId,
        ...lotteryForm,
      }

      await createLottery(lotteryData)

      toast({
        title: t("common.success"),
        description: t("admin.manage.createLotterySuccess"),
      })

      // 重置表单
      setLotteryForm({
        ticket_name: "",
        ticket_price: 1,
        ticket_supply: 1000,
        betting_rules: "选择3个1-49之间的数字",
        prize_structure: "一等奖: 50% LOT, 二等奖: 10% LOT, 三等奖: 5% LOT",
        rollout_contract_address: "",
        register_contract_address: address,
      })
    } catch (error) {
      console.error("创建彩票失败:", error)
      toast({
        title: t("common.error"),
        description: t("admin.manage.createLotteryError"),
        variant: "destructive",
      })
    } finally {
      setIsCreatingLottery(false)
    }
  }

  // 创建彩票期号
  const handleCreateIssue = async () => {
    if (!selectedLotteryId) {
      toast({
        title: t("common.error"),
        description: t("admin.manage.selectLottery"),
        variant: "destructive",
      })
      return
    }

    if (!issueNumber) {
      toast({
        title: t("common.error"),
        description: "请输入期号",
        variant: "destructive",
      })
      return
    }

    if (!saleEndDate) {
      toast({
        title: t("common.error"),
        description: t("admin.manage.selectSaleEndDate"),
        variant: "destructive",
      })
      return
    }

    setIsCreatingIssue(true)

    try {
      await createIssue(selectedLotteryId, issueNumber, saleEndDate.toISOString())

      toast({
        title: t("common.success"),
        description: t("admin.manage.createIssueSuccess"),
      })

      // 重置表单
      setIssueNumber("")
      setSaleEndDate(undefined)
    } catch (error) {
      console.error("创建彩票期号失败:", error)
      toast({
        title: t("common.error"),
        description: t("admin.manage.createIssueError"),
        variant: "destructive",
      })
    } finally {
      setIsCreatingIssue(false)
    }
  }

  // 执行开奖
  const handleDrawLottery = async (issueId: string) => {
    setIsDrawing(true)

    try {
      const statusCode = await executeDraw(issueId)

      if (statusCode === 200) {
        toast({
          title: t("common.success"),
          description: "开奖成功，请稍等，随时查看开奖结果。",
        })
      } else {
        toast({
          title: t("common.error"),
          description: "开奖失败，请稍后再试。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("执行开奖失败:", error)
      toast({
        title: t("common.error"),
        description: t("admin.manage.drawError"),
        variant: "destructive",
      })
    } finally {
      setIsDrawing(false)
    }
  }

  // 刷新数据
  const refreshData = async () => {
    try {
      await Promise.all([refreshLotteries(), refreshTypes()])
      console.log("刷新数据成功",lotteryTypes, lotteries)

      toast({
        title: t("common.success"),
        description: t("admin.manage.refreshSuccess"),
      })
    } catch (error) {
      console.error("刷新数据失败:", error)
      toast({
        title: t("common.error"),
        description: t("admin.manage.refreshError"),
        variant: "destructive",
      })
    }
  }

  // 获取彩票名称
  const getLotteryName = (lotteryId: string) => {
    const lottery = lotteries.find((l) => l.id === lotteryId)
    return lottery ? lottery.name : t("admin.manage.unknownLottery")
  }

  return (
    <Tabs defaultValue="lotteries" onValueChange={setActiveTab}>
      <div className="flex justify-between items-center mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="lotteries">{t("admin.manage.manageLotteries")}</TabsTrigger>
          <TabsTrigger value="create">{t("admin.manage.createLottery")}</TabsTrigger>
          <TabsTrigger value="issues">{t("admin.manage.manageDraws")}</TabsTrigger>
        </TabsList>

        <Button
          variant="outline"
          onClick={refreshData}
          disabled={isLoadingLotteries || isLoadingTypes}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> {t("common.refreshData")}
        </Button>
      </div>

      <TabsContent value="lotteries" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.manage.activeLotteries")}</CardTitle>
            <CardDescription>{t("admin.manage.activeLotteriesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLotteries ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead>{t("admin.manage.lotteryId")}</TableHead> */}
                      <TableHead>{t("admin.manage.name")}</TableHead>
                      <TableHead>{t("admin.manage.ticketPrice")}</TableHead>
                      <TableHead>{t("admin.manage.supply")}</TableHead>
                      <TableHead>{t("admin.manage.type")}</TableHead>
                      <TableHead>{t("admin.manage.status")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotteries.length > 0 ? (
                      lotteries.map((lottery) => {
                        const lotteryType = lotteryTypes.find((t) => t.type_id === lottery.type_id)
                        return (
                          <TableRow key={lottery.lottery_id}>
                            <TableCell>{lottery.ticket_name}</TableCell>
                            <TableCell>{lottery.ticket_price}</TableCell>
                            <TableCell>{lottery.ticket_supply}</TableCell>
                            <TableCell>{lotteryType ? lotteryType.type_name : t("admin.manage.unknownType")}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                {t("admin.manage.active")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">{t("common.edit")}</span>
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">{t("common.delete")}</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{t("admin.manage.confirmDelete")}</DialogTitle>
                                    <DialogDescription>{t("admin.manage.confirmDeleteDesc")}</DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline">{t("common.cancel")}</Button>
                                    <Button variant="destructive">{t("common.delete")}</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {t("admin.manage.noLotteryData")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="create" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.manage.createNewLottery")}</CardTitle>
            <CardDescription>{t("admin.manage.createNewLotteryDesc")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateLottery}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type_id">{t("admin.manage.lotteryType")}</Label>
                <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.manage.selectLotteryType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {lotteryTypes.map((type) => (
                      <SelectItem key={type.type_id} value={type.type_id}>
                        {type.type_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket_name">{t("admin.manage.lotteryName")}</Label>
                <Input
                  id="ticket_name"
                  name="ticket_name"
                  placeholder={t("admin.manage.lotteryNamePlaceholder")}
                  value={lotteryForm.ticket_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket_price">{t("admin.manage.ticketPriceEth")}</Label>
                  <Input
                    id="ticket_price"
                    name="ticket_price"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.01"
                    value={lotteryForm.ticket_price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket_supply">{t("admin.manage.supply")}</Label>
                  <Input
                    id="ticket_supply"
                    name="ticket_supply"
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={lotteryForm.ticket_supply}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="betting_rules">{t("admin.manage.bettingRules")}</Label>
                <Textarea
                  id="betting_rules"
                  name="betting_rules"
                  placeholder={t("admin.manage.bettingRulesPlaceholder")}
                  value={lotteryForm.betting_rules}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize_structure">{t("admin.manage.prizeStructure")}</Label>
                <Textarea
                  id="prize_structure"
                  name="prize_structure"
                  placeholder={t("admin.manage.prizeStructurePlaceholder")}
                  value={lotteryForm.prize_structure}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollout_contract_address">{t("admin.manage.contractAddress")}</Label>
                <Input
                  id="rollout_contract_address"
                  name="rollout_contract_address"
                  placeholder={t("admin.manage.contractAddressPlaceholder")}
                  value={lotteryForm.rollout_contract_address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isCreatingLottery}>
                {isCreatingLottery ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("common.creating")}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> {t("admin.manage.createLotteryBtn")}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="issues" className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>{t("admin.manage.manageDrawsTitle")}</CardTitle>
      <CardDescription>{t("admin.manage.manageDrawsDesc")}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* 保持原有的期号创建表单 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
          <div className="space-y-2">
            <Label htmlFor="lottery_id">{t("admin.manage.selectLottery")}</Label>
            <Select value={selectedLotteryId} onValueChange={setSelectedLotteryId}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.manage.selectLottery")} />
              </SelectTrigger>
              <SelectContent>
                {lotteries.map((lottery) => (
                  <SelectItem key={lottery.lottery_id} value={lottery.lottery_id}>
                    {lottery.ticket_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue_number">期号</Label>
            <Input
              id="issue_number"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              placeholder="请输入期号，如：202401"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.manage.saleEndDate")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {saleEndDate ? format(saleEndDate, "PPP") : <span>{t("admin.manage.selectDate")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={saleEndDate} onSelect={setSaleEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="col-span-1 md:col-span-3 flex justify-end">
            <Button
              onClick={handleCreateIssue}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isCreatingIssue}
            >
              {isCreatingIssue ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("common.creating")}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> {t("admin.manage.createIssueBtn")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 修改后的表格部分 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.manage.lotteryName")}</TableHead>
                <TableHead>{t("admin.manage.issueNumber")}</TableHead>
                <TableHead>{t("admin.manage.saleEndTime")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("admin.manage.winningNumbers")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingLotteries ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : lotteries.length > 0 ? (
                lotteries.map((lottery) => {
                  const [isExpanded, setIsExpanded] = useState(false);
                  const issues = lottery.lotteryIssue || [];

                  return (
                    <React.Fragment key={lottery.lottery_id}>
                      {/* 主行：显示彩票信息 */}
                      <TableRow>
                        <TableCell
                          className="font-medium cursor-pointer"
                          onClick={() => setIsExpanded(!isExpanded)}
                        >
                          <div className="flex items-center">
                            {isExpanded ? "▼" : "▶"} {lottery.ticket_name}
                          </div>
                        </TableCell>
                        <TableCell colSpan={5}>
                          {issues.length > 0
                            ? `${issues.length} issue(s)`
                            : t("admin.manage.noIssueData")}
                        </TableCell>
                      </TableRow>

                      {/* 展开行：显示期号列表 */}
                      {isExpanded &&
                        issues.map((issue:{issue_id:string,issue_number: string; status: string; winning_numbers?: string; sale_end_time: string }) => (
                          <TableRow
                            key={issue.issue_id}
                            className="bg-gray-50"
                          >
                            <TableCell className="pl-8">
                              {/* 缩进以示层级 */}
                            </TableCell>
                            <TableCell>{issue.issue_number}</TableCell>
                            <TableCell>
                              {new Date(issue.sale_end_time).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={issue.status === "DRAWN" ? "default" : "outline"}
                                className={
                                  issue.status === "DRAWN"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                }
                              >
                                {issue.status === "DRAWN"
                                  ? t("admin.manage.drawn")
                                  : t("admin.manage.selling")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {issue.winning_numbers || t("admin.manage.notDrawn")}
                            </TableCell>
                            <TableCell className="text-right">
                              {issue.status !== "DRAWN" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDrawLottery(issue.issue_id)}
                                  disabled={isDrawing}
                                >
                                  <Play className="h-4 w-4" />
                                  <span className="sr-only">{t("admin.manage.draw")}</span>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {t("admin.manage.noLotteryData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
    </Tabs>
  )
}
