"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useLotteryData } from "@/hooks/use-lottery-data";

interface CreateFirstIssueDialogProps {
  lotteryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFirstIssueDialog({ lotteryId, open, onOpenChange }: CreateFirstIssueDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { createIssue } = useLotteryData();
  const [issueNumber, setIssueNumber] = useState<string>("");
  const [saleEndDate, setSaleEndDate] = useState<Date | undefined>();
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);

  const handleCreateIssue = async () => {
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
      await createIssue(lotteryId, issueNumber, saleEndDate.toISOString());
      toast({
        title: t("common.success"),
        description: t("admin.manage.createIssueSuccess"),
      });
      setIssueNumber("");
      setSaleEndDate(undefined);
      onOpenChange(false); // 关闭弹框
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.manage.createFirstIssue")}</DialogTitle>
          <DialogDescription>{t("admin.manage.createFirstIssueDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
                  {saleEndDate ? format(saleEndDate, "PPP") : <span>{t("admin.manage.selectDate")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={saleEndDate} onSelect={setSaleEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
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
              t("admin.manage.createIssueBtn")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}