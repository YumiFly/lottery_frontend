"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, RefreshCw, Edit, Trash2, Play, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useWallet } from "@/hooks/use-wallet";
import { useLotteryData } from "@/hooks/use-lottery-data";
import { CreateLotteryForm } from "./CreateLotteryForm";

export function LotteryManagement() {
  const [activeTab, setActiveTab] = useState("lotteries");
  const { toast } = useToast();
  const { t } = useLanguage();
  const { address, isConnected } = useWallet();
  const [saleEndDate, setSaleEndDate] = useState<Date | undefined>();
  const [issueNumber, setIssueNumber] = useState<string>("");
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>("");
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  // New state to track expansion of all lotteries
  const [expandedLotteries, setExpandedLotteries] = useState<{ [key: string]: boolean }>({});

  const {
    lotteries,
    lotteryTypes,
    isLoadingLotteries,
    isLoadingTypes,
    refreshLotteries,
    refreshTypes,
    createIssue,
    executeDraw,
  } = useLotteryData();

  // 设置默认选中的彩票
  useEffect(() => {
    if (lotteries.length > 0 && !selectedLotteryId) {
      setSelectedLotteryId(lotteries[0].lottery_id);
    }
  }, [lotteries, selectedLotteryId]);

  // Toggle expansion state for a specific lottery
  const toggleLotteryExpansion = (lotteryId: string) => {
    setExpandedLotteries((prev) => ({
      ...prev,
      [lotteryId]: !prev[lotteryId],
    }));
  };

  // 创建彩票期号
  const handleCreateIssue = async () => {
    if (!selectedLotteryId) {
      toast({
        title: t("common.error"),
        description: t("admin.manage.selectLottery"),
        variant: "destructive",
      });
      return;
    }

    if (!issueNumber) {
      toast({
        title: t("common.error"),
        description: "请输入期号",
        variant: "destructive",
      });
      return;
    }

    if (!saleEndDate) {
      toast({
        title: t("common.error"),
        description: t("admin.manage.selectSaleEndDate"),
        variant: "destructive",
      });
      return;
    }

    setIsCreatingIssue(true);

    try {
      await createIssue(selectedLotteryId, issueNumber, saleEndDate.toISOString());

      toast({
        title: t("common.success"),
        description: t("admin.manage.createIssueSuccess"),
      });

      setIssueNumber("");
      setSaleEndDate(undefined);
    } catch (error) {
      console.error("创建彩票期号失败:", error);
      toast({
        title: t("common.error"),
        description: t("admin.manage.createIssueError"),
        variant: "destructive",
      });
    } finally {
      setIsCreatingIssue(false);
    }
  };

  // 执行开奖
  const handleDrawLottery = async (issueId: string) => {
    setIsDrawing(true);

    try {
      const statusCode = await executeDraw(issueId);

      if (statusCode === 200) {
        toast({
          title: t("common.success"),
          description: "开奖成功，请稍等，随时查看开奖结果。",
        });
      } else {
        toast({
          title: t("common.error"),
          description: "开奖失败，请稍后再试。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("执行开奖失败:", error);
      toast({
        title: t("common.error"),
        description: t("admin.manage.drawError"),
        variant: "destructive",
      });
    } finally {
      setIsDrawing(false);
    }
  };

  // 刷新数据
  const refreshData = async () => {
    try {
      await Promise.all([refreshLotteries(), refreshTypes()]);
      toast({
        title: t("common.success"),
        description: t("admin.manage.refreshSuccess"),
      });
    } catch (error) {
      console.error("刷新数据失败:", error);
      toast({
        title: t("common.error"),
        description: t("admin.manage.refreshError"),
        variant: "destructive",
      });
    }
  };

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
                        const lotteryType = lotteryTypes.find((t) => t.type_id === lottery.type_id);
                        return (
                          <TableRow key={lottery.lottery_id}>
                            <TableCell>{lottery.ticket_name}</TableCell>
                            <TableCell>{lottery.ticket_price}</TableCell>
                            <TableCell>{lottery.ticket_supply}</TableCell>
                            <TableCell>
                              {lotteryType ? lotteryType.type_name : t("admin.manage.unknownType")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 hover:bg-green-100"
                              >
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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">{t("common.delete")}</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{t("admin.manage.confirmDelete")}</DialogTitle>
                                    <DialogDescription>
                                      {t("admin.manage.confirmDeleteDesc")}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline">{t("common.cancel")}</Button>
                                    <Button variant="destructive">{t("common.delete")}</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
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
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="create" className="mt-6">
        <CreateLotteryForm />
      </TabsContent>

      <TabsContent value="issues" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.manage.manageDrawsTitle")}</CardTitle>
            <CardDescription>{t("admin.manage.manageDrawsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                  <Label htmlFor="issue_number">{t("admin.manage.issueNumber")}</Label>
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
                        {saleEndDate ? (
                          format(saleEndDate, "PPP")
                        ) : (
                          <span>{t("admin.manage.selectDate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={saleEndDate}
                        onSelect={setSaleEndDate}
                        initialFocus
                      />
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
                        const issues = lottery.lotteryIssue || [];
                        const isExpanded = expandedLotteries[lottery.lottery_id] || false;

                        return (
                          <React.Fragment key={lottery.lottery_id}>
                            <TableRow>
                              <TableCell
                                className="font-medium cursor-pointer"
                                onClick={() => toggleLotteryExpansion(lottery.lottery_id)}
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
                            {isExpanded &&
                              issues.map(
                                (issue: {
                                  issue_id: string;
                                  issue_number: string;
                                  status: string;
                                  winning_numbers?: string;
                                  sale_end_time: string;
                                }) => (
                                  <TableRow key={issue.issue_id} className="bg-gray-50">
                                    <TableCell className="pl-8"></TableCell>
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
                                ),
                              )}
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
  );
}