"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useLotteryData } from "@/hooks/use-lottery-data";
import { useWallet } from "@/hooks/use-wallet";

export function CreateLotteryForm() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { address } = useWallet();
  const { lotteryTypes, createLottery, createIssue, refreshLotteries, refreshIssues } = useLotteryData();
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [issueNumber, setIssueNumber] = useState<string>("");
  const [saleEndDate, setSaleEndDate] = useState<Date | undefined>();

  // 表单状态
  const [lotteryForm, setLotteryForm] = useState({
    ticket_name: "",
    ticket_price: 1,
    ticket_supply: 1000,
    betting_rules: "选择3个1-49之间的数字",
    prize_structure: "一等奖: 50% LOT, 二等奖: 10% LOT, 三等奖: 5% LOT",
    rollout_contract_address: "",
    register_contract_address: address || "",
  });

  // 设置默认彩票类型
  useEffect(() => {
    if (lotteryTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(lotteryTypes[0].type_id);
    }
  }, [lotteryTypes, selectedTypeId]);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLotteryForm((prev) => ({
      ...prev,
      [name]: name === "ticket_price" || name === "ticket_supply" ? Number.parseFloat(value) : value,
    }));
  };

  // 创建彩票和第一期彩票
  const handleCreateLottery = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!selectedTypeId) {
      toast({
        title: t("common.error"),
        description: t("admin.manage.selectLotteryType"),
        variant: "destructive",
      });
      return;
    }

    if (!lotteryForm.ticket_name) {
      toast({
        title: t("common.error"),
        description: t("admin.manage.lotteryNamePlaceholder"),
        variant: "destructive",
      });
      return;
    }

    // 验证期号字段（如果填写了一个，必须填写另一个）
    if (issueNumber || saleEndDate) {
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
    }

    setIsCreating(true);

    try {
      // 创建彩票
      const lotteryData = {
        type_id: selectedTypeId,
        ...lotteryForm,
      };
      const lotteryResult = await createLottery(lotteryData);
      const newLotteryId = lotteryResult.lottery_id; // 假设返回 { lottery_id: string, ... }

      // 如果填写了期号信息，创建第一期彩票
      let issueCreated = false;
      if (issueNumber && saleEndDate) {
        await createIssue(newLotteryId, issueNumber, saleEndDate.toISOString());
        issueCreated = true;
      }

      // 刷新数据
      await Promise.all([refreshLotteries(), refreshIssues()]);

      // 显示成功提示
      toast({
        title: t("common.success"),
        description: issueCreated
          ? t("admin.manage.createLotteryAndIssueSuccess")
          : t("admin.manage.createLotterySuccess"),
      });

      // 重置表单
      setLotteryForm({
        ticket_name: "",
        ticket_price: 1,
        ticket_supply: 1000,
        betting_rules: "选择3个1-49之间的数字",
        prize_structure: "一等奖: 50% LOT, 二等奖: 10% LOT, 三等奖: 5% LOT",
        rollout_contract_address: "",
        register_contract_address: address || "",
      });
      setIssueNumber("");
      setSaleEndDate(undefined);
      setSelectedTypeId(lotteryTypes[0]?.type_id || "");
    } catch (error) {
      console.error("创建彩票或期号失败:", error);
      toast({
        title: t("common.error"),
        description: t("admin.manage.createLotteryError"),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
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
          {/* 第一期彩票字段 */}
          <div className="space-y-2">
            <Label htmlFor="issue_number">{t("admin.manage.firstIssueNumber")}</Label>
            <Input
              id="issue_number"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              placeholder={t("admin.manage.firstIssueNumberPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.manage.firstIssueSaleEndDate")}</Label>
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
        </CardContent>
        <CardFooter>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isCreating}>
            {isCreating ? (
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
  );
}