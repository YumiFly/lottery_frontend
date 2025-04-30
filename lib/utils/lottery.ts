// @/lib/utils/lottery.ts
import { Lottery, LotteryIssue, LotteryTicket, LotteryWinner, LotteryType } from "@/lib/api/lotteryV2";
import { LotteryUI } from "../services/lottery-service-v2";

// Helper function to format dates
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date.getFullYear() < 1970) {
      return "N/A";
    }
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "N/A";
  }
};

// Convert Lottery to UI format
export const convertLotteryToUIFormat = (lottery: Lottery, issue?: LotteryIssue): LotteryUI => {
  return {
    id: lottery.lottery_id,
    name: lottery.ticket_name,
    type: lottery.LotteryType?.type_name || "未知类型",
    typeId: lottery.type_id,
    price: lottery.ticket_price,
    supply: lottery.ticket_supply,
    bettingRules: lottery.betting_rules,
    prizeStructure: lottery.prize_structure,
    contractAddress: lottery.contract_address,
    registeredAddress: lottery.registered_addr,
    rolloutContractAddress: lottery.rollout_contract_address,
    createdAt: formatDate(lottery.created_at),
    issue: issue
      ? {
          id: issue.issue_id,
          number: issue.issue_number,
          saleEndTime: formatDate(issue.sale_end_time),
          drawTime: formatDate(issue.draw_time) === "N/A" ? formatDate(issue.sale_end_time) : formatDate(issue.draw_time),
          status: issue.status,
          prizePool: issue.prize_pool,
          winningNumbers: issue.winning_numbers || "未开奖",
        }
      : null,
  };
};

// Convert LotteryTicket to UI format
export const convertTicketToUIFormat = (
  ticket: LotteryTicket,
  lotteries: Lottery[] = [],
  issues: LotteryIssue[] = []
): any => {
  const relatedIssue = issues.find((issue) => issue.issue_id === ticket.issue_id);
  const relatedLottery = lotteries.find((lottery) => lottery.lottery_id === relatedIssue?.lottery_id);

  return {
    id: ticket.ticket_id,
    issueId: ticket.issue_id,
    lotteryName: relatedLottery?.ticket_name || "未知彩票",
    lotteryType: relatedLottery?.LotteryType?.type_name || "未知类型",
    issueNumber: relatedIssue?.issue_number || "未知期号",
    buyerAddress: ticket.buyer_address,
    purchaseTime: formatDate(ticket.purchase_time),
    betContent: ticket.bet_content,
    purchaseAmount: ticket.purchase_amount,
    transactionHash: ticket.transaction_hash,
    status: relatedIssue?.status || "未知状态",
    winningNumbers: relatedIssue?.winning_numbers || "未开奖",
  };
};

// Convert LotteryWinner to UI format
export const convertWinnerToUIFormat = (winner: LotteryWinner): any => {
  const issue = winner.LotteryIssue;
  const ticket = winner.LotteryTicket;
  const lottery = issue?.Lottery;

  return {
    id: winner.winner_id,
    issueId: winner.issue_id,
    ticketId: winner.ticket_id,
    lotteryName: lottery?.ticket_name || "未知彩票",
    lotteryType: lottery?.LotteryType?.type_name || "未知类型",
    issueNumber: issue?.issue_number || "未知期号",
    winnerAddress: winner.address,
    prizeLevel: winner.prize_level,
    prizeAmount: winner.prize_amount,
    claimTxHash: winner.claim_tx_hash,
    createdAt: formatDate(winner.created_at),
    winningNumbers: issue?.winning_numbers || "未知",
    betContent: ticket?.bet_content || "未知",
  };
};

// Convert LotteryIssue to UI format for results
export const convertResultToUIFormat = (data: {
  issue: LotteryIssue;
  lottery?: Lottery;
  type?: LotteryType;
}): any => {
  const { issue, lottery, type } = data;

  return {
    issueId: issue.issue_id,
    lotteryId: issue.lottery_id,
    lotteryName: lottery?.ticket_name || "未知彩票",
    typeName: type?.type_name || "未知类型",
    issueNumber: issue.issue_number,
    winningNumbers: issue.winning_numbers || "未开奖",
    drawTime: formatDate(issue.draw_time) === "N/A" ? formatDate(issue.sale_end_time) : formatDate(issue.draw_time),
    prizePool: issue.prize_pool,
    status: issue.status,
  };
};