// @/lib/services/lottery-service-v2.ts
import {
    getLotteryTypes as apiGetLotteryTypes,
    getLotteries as apiGetLotteries,
    getLotteryIssues as apiGetLotteryIssues,
    getLotteryTickets as apiGetLotteryTickets,
    getLotteryWinners as apiGetLotteryWinners,
    getPrizePool as apiGetPrizePool,
    buyTicket as apiBuyTicket,
    createLottery as apiCreateLottery,
    createLotteryIssue as apiCreateLotteryIssue,
    createLotteryType as apiCreateLotteryType,
    drawLottery as apiDrawLottery,
    type Lottery,
    type LotteryType,
    type LotteryIssue,
    type LotteryTicket,
    type LotteryWinner,
    type LotteryRequest,
    type LotteryTypeRequest,
    type LotteryIssueRequest,
    type BuyTicketRequest,
  } from "@/lib/api/lotteryV2";
  
  import { convertLotteryToUIFormat, convertTicketToUIFormat, convertWinnerToUIFormat, convertResultToUIFormat } from "@/lib/utils/lottery";
  
  export interface LotteryUI {
    id: string;
    name: string;
    type: string;
    typeId: string;
    price: number;
    supply: number;
    bettingRules: string;
    prizeStructure: string;
    contractAddress: string;
    registeredAddress: string;
    rolloutContractAddress: string;
    createdAt: string;
    issue: {
      id: string;
      number: string;
      saleEndTime: string;
      drawTime: string;
      status: string;
      prizePool: number;
      winningNumbers: string;
    } | null;
  }
  // 开奖
  export async function drawLottery(issueId: string): Promise<number> {
    console.log("Drawing lottery...");
    return apiDrawLottery(issueId);
  }
  
  // 获取彩票类型列表
  export async function fetchLotteryTypes(): Promise<LotteryType[]> {
    console.log("Fetching lottery types...");
    return apiGetLotteryTypes();
  }
  
  // 获取彩票列表
  export async function fetchLotteries(params?: {
    ticket_name?: string;
    type_id?: string;
  }): Promise<LotteryUI[]> {
    try {
      console.log("Fetching lotteries...");
      const { lotteries, total } = await apiGetLotteries(params);
      if (total === 0) return [];
  
      const result = [];
      for (const lottery of lotteries) {
        try {
          const { issues } = await apiGetLotteryIssues({ lottery_id: lottery.lottery_id, status: "PENDING" });
          const latestIssue = issues[0]; // Assume first issue is the latest
          result.push(convertLotteryToUIFormat(lottery, latestIssue));
        } catch (error) {
          console.error(`获取彩票 ${lottery.lottery_id} 的最新期号失败:`, error);
          result.push(convertLotteryToUIFormat(lottery));
        }
      }
      console.log("result", result);
      return result;
    } catch (error) {
      console.error("获取彩票列表失败:", error);
      throw error;
    }
  }
  
  // 获取特定彩票
  export async function fetchLottery(id: string): Promise<any | undefined> {
    try {
      const { lotteries } = await apiGetLotteries();
      const lottery = lotteries.find((l) => l.lottery_id === id);
      if (!lottery) return undefined;
  
      const { issues } = await apiGetLotteryIssues({ lottery_id: id, status: "PENDING" });
      const latestIssue = issues[0]; // Assume first issue is the latest
      return convertLotteryToUIFormat(lottery, latestIssue);
    } catch (error) {
      console.error(`获取彩票 ${id} 失败:`, error);
      throw error;
    }
  }
  
  // 获取购买记录
  export async function fetchTicketPurchases(
    address: string,
    status = "all",
    page = 1,
    page_size = 20
  ): Promise<any[]> {
    try {
      const { Tickets: tickets, Total: total } = await apiGetLotteryTickets({
        buyer_address: address,
        page,
        page_size,
      });
      if (total === 0) return [];
  
      const { lotteries } = await apiGetLotteries();
      const { issues } = await apiGetLotteryIssues({});
  
      const purchases = tickets.map((ticket) => {
        const relatedIssue = issues.find((issue) => issue.issue_id === ticket.issue_id);
        const relatedLottery = relatedIssue
          ? lotteries.find((lottery: Lottery) => lottery.lottery_id === relatedIssue.lottery_id)
          : undefined;
        return convertTicketToUIFormat(
          ticket,
          relatedLottery ? [relatedLottery] : [],
          relatedIssue ? [relatedIssue] : []
        );
      });
  
      if (status === "all") return purchases;
      return purchases.filter(
        (purchase) => purchase.status?.toLowerCase() === status.toLowerCase()
      );
    } catch (error) {
      console.error("获取购买记录失败:", error);
      throw error;
    }
  }
  
  // 获取最近开奖结果
  export async function fetchRecentResults(page = 1, page_size = 20): Promise<any[]> {
    try {
      const { issues, total } = await apiGetLotteryIssues({ status: "DRAWN", page, page_size });
      if (total === 0) return [];
  
      const { lotteries } = await apiGetLotteries();
  
      return issues
        .filter((issue) => issue.winning_numbers)
        .map((issue) => {
          const relatedLottery = lotteries.find((lottery) => lottery.lottery_id === issue.lottery_id);
          return convertResultToUIFormat({
            issue,
            lottery: relatedLottery,
            type: relatedLottery?.LotteryType,
          });
        });
    } catch (error) {
      console.error("获取最近开奖结果失败:", error);
      throw error;
    }
  }
  
  // 获取最近获奖者
  export async function fetchRecentWinners(page = 1, page_size = 20): Promise<any[]> {
    try {
      const { Winners: winners, Total: total } = await apiGetLotteryWinners({ page, page_size });
      if (total === 0) return [];
  
      return winners.map((winner) => convertWinnerToUIFormat(winner));
    } catch (error) {
      console.error("获取最近获奖者失败:", error);
      throw error;
    }
  }
  
  // 获取总奖池
  export async function fetchPrizePool(): Promise<number> {
    return apiGetPrizePool();
  }
  
  // 购买彩票
  export async function purchaseTickets(
    issueId: string,
    buyerAddress: string,
    betContent: string,
    amount: number
  ): Promise<boolean> {
    try {
      const ticketData: BuyTicketRequest = {
        issue_id: issueId,
        buyer_address: buyerAddress,
        bet_content: betContent,
        purchase_amount: amount,
      };
  
      await apiBuyTicket(ticketData);
      return true;
    } catch (error) {
      console.error("购买彩票失败:", error);
      throw error;
    }
  }
  
  // 创建彩票类型
  export async function createNewLotteryType(typeName: string, description: string): Promise<LotteryType> {
    try {
      const typeData: LotteryTypeRequest = {
        type_name: typeName,
        description: description,
      };
  
      return apiCreateLotteryType(typeData);
    } catch (error) {
      console.error("创建彩票类型失败:", error);
      throw error;
    }
  }
  
  // 创建彩票
  export async function createNewLottery(lotteryData: LotteryRequest): Promise<Lottery> {
    try {
      return apiCreateLottery(lotteryData);
    } catch (error) {
      console.error("创建彩票失败:", error);
      throw error;
    }
  }
  
  // 创建彩票期号
  export async function createNewLotteryIssue(
    lotteryId: string,
    issueNumber: string,
    saleEndTime: string,
    drawTime: string,
    status = "PENDING"
  ): Promise<LotteryIssue> {
    try {
      const issueData: LotteryIssueRequest = {
        lottery_id: lotteryId,
        issue_number: issueNumber,
        sale_end_time: saleEndTime,
        draw_time: drawTime,
        status,
      };
  
      return apiCreateLotteryIssue(issueData);
    } catch (error) {
      console.error("创建彩票期号失败:", error);
      throw error;
    }
  }
  
  // 加载更多彩票
  export async function loadMoreLotteries(page = 1, count = 3): Promise<any[]> {
    try {
      const { lotteries } = await apiGetLotteries({ page, page_size: count });
      const result = [];
  
      for (const lottery of lotteries) {
        try {
          const { issues } = await apiGetLotteryIssues({ lottery_id: lottery.lottery_id, status: "PENDING" });
          const latestIssue = issues[0];
          result.push(convertLotteryToUIFormat(lottery, latestIssue));
        } catch (error) {
          console.error(`获取彩票 ${lottery.lottery_id} 的最新期号失败:`, error);
          result.push(convertLotteryToUIFormat(lottery));
        }
      }
      return result;
    } catch (error) {
      console.error("加载更多彩票失败:", error);
      throw error;
    }
  }
  
  // 加载更多购买记录
  export async function loadMoreTicketPurchases(address: string, page = 1, count = 5): Promise<any[]> {
    try {
      const { Tickets: tickets } = await apiGetLotteryTickets({ buyer_address: address, page, page_size: count });
      const { lotteries } = await apiGetLotteries();
      const { issues } = await apiGetLotteryIssues({});
  
      return tickets.map((ticket) => {
        const relatedIssue = issues.find((issue) => issue.issue_id === ticket.issue_id);
        const relatedLottery = relatedIssue
          ? lotteries.find((lottery: Lottery) => lottery.lottery_id === relatedIssue.lottery_id)
          : undefined;
        return convertTicketToUIFormat(
          ticket,
          relatedLottery ? [relatedLottery] : [],
          relatedIssue ? [relatedIssue] : []
        );
      });
    } catch (error) {
      console.error("加载更多购买记录失败:", error);
      throw error;
    }
  }
  
  // 导出类型
  export type {
    Lottery,
    LotteryType,
    LotteryIssue,
    LotteryTicket,
    LotteryWinner,
    LotteryRequest,
    LotteryTypeRequest,
    LotteryIssueRequest,
    BuyTicketRequest,
  };