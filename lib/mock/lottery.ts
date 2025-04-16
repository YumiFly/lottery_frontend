import Mock from "mockjs"
import { Random } from "./setup"
import type { Lottery, LotteryType, LotteryIssue, LotteryTicket, LatestLotteryResults,FeaturedLottery } from "@/lib/api/lottery"

// 模拟彩票类型数据
export const getMockLotteryTypes = (): LotteryType[] => {
  return [
    {
      type_id: "1",
      type_name: "每周大奖",
      description: "每周一次的大奖彩票，奖金丰厚",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
    {
      type_id: "2",
      type_name: "每日快速",
      description: "每天开奖的快速彩票",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
    },
    {
      type_id: "3",
      type_name: "月度头奖",
      description: "每月一次的超级大奖彩票",
      created_at: "2023-01-03T00:00:00Z",
      updated_at: "2023-01-03T00:00:00Z",
    },
  ]
}

// 模拟彩票数据
export const getMockLotteries = (): Lottery[] => {
  return [
    {
      lottery_id: "1",
      type_id: "1",
      ticket_name: "Weekly Mega Draw",
      ticket_price: "0.01",
      betting_rules: "选择6个1-49之间的数字",
      prize_structure: "一等奖: 50 LOT, 二等奖: 10 LOT, 三等奖: 5 LOT",
      contract_address: "0x1234567890abcdef1234567890abcdef12345678",
      created_at: "2023-02-01T00:00:00Z",
      updated_at: "2023-02-01T00:00:00Z",
    },
    {
      lottery_id: "2",
      type_id: "2",
      ticket_name: "Daily Quick Draw",
      ticket_price: "0.001",
      betting_rules: "选择6个1-33之间的数字",
      prize_structure: "一等奖: 5 LOT, 二等奖: 1 LOT, 三等奖: 0.5 LOT",
      contract_address: "0xabcdef1234567890abcdef1234567890abcdef12",
      created_at: "2023-02-02T00:00:00Z",
      updated_at: "2023-02-02T00:00:00Z",
    },
    {
      lottery_id: "3",
      type_id: "3",
      ticket_name: "Monthly Jackpot",
      ticket_price: "0.05",
      betting_rules: "选择6个1-50之间的数字",
      prize_structure: "一等奖: 100 LOT, 二等奖: 20 LOT, 三等奖: 10 LOT",
      contract_address: "0x7890abcdef1234567890abcdef1234567890abcd",
      created_at: "2023-02-03T00:00:00Z",
      updated_at: "2023-02-03T00:00:00Z",
    },
  ]
}

// 模拟彩票期号数据
export const getMockLotteryIssues = (): LotteryIssue[] => {
  return [
    {
      issue_id: "1",
      lottery_id: "1",
      issue_number: "202304",
      status: "DRAWN", // 已开奖
      sale_end_time: "2023-04-10T18:00:00Z",
      draw_time: "2023-04-10T20:00:00Z",
      prize_pool: "50",
      winning_numbers: "7,14,22,36,41,49",
      random_seed: "0x123456789abcdef",
      draw_tx_hash: "0x1a2b3c4d5e6f7g8h9i0j",
      created_at: "2023-04-01T00:00:00Z",
      updated_at: "2023-04-10T20:05:00Z",
    },
    {
      issue_id: "2",
      lottery_id: "2",
      issue_number: "20230412",
      status: "DRAWN", // 已开奖
      sale_end_time: "2023-04-12T18:00:00Z",
      draw_time: "2023-04-12T20:00:00Z",
      prize_pool: "5",
      winning_numbers: "3,11,17,25,29,33",
      random_seed: "0xabcdef123456789",
      draw_tx_hash: "0xa1b2c3d4e5f6g7h8i9j0",
      created_at: "2023-04-12T00:00:00Z",
      updated_at: "2023-04-12T20:05:00Z",
    },
    {
      issue_id: "3",
      lottery_id: "3",
      issue_number: "202304",
      status: "DRAWN", // 已开奖
      sale_end_time: "2023-04-01T18:00:00Z",
      draw_time: "2023-04-01T20:00:00Z",
      prize_pool: "100",
      winning_numbers: "5,18,23,37,42,50",
      random_seed: "0x9876543210fedcba",
      draw_tx_hash: "0x9i8h7g6f5e4d3c2b1a0",
      created_at: "2023-04-01T00:00:00Z",
      updated_at: "2023-04-01T20:05:00Z",
    },
    {
      issue_id: "4",
      lottery_id: "1",
      issue_number: "202305",
      status: "OPEN", // 开放销售
      sale_end_time: "2023-05-17T18:00:00Z",
      draw_time: "2023-05-17T20:00:00Z",
      prize_pool: "55",
      winning_numbers: "",
      random_seed: "",
      draw_tx_hash: "",
      created_at: "2023-05-01T00:00:00Z",
      updated_at: "2023-05-01T00:00:00Z",
    },
    {
      issue_id: "5",
      lottery_id: "2",
      issue_number: "20230413",
      status: "OPEN", // 开放销售
      sale_end_time: "2023-04-13T18:00:00Z",
      draw_time: "2023-04-13T20:00:00Z",
      prize_pool: "5.5",
      winning_numbers: "",
      random_seed: "",
      draw_tx_hash: "",
      created_at: "2023-04-13T00:00:00Z",
      updated_at: "2023-04-13T00:00:00Z",
    },
  ]
}

// 模拟彩票票据数据
export const getMockLotteryTickets = (): LotteryTicket[] => {
  return [
    {
      ticket_id: "ticket-001",
      issue_id: "1",
      buyer_address: "0x1234567890123456789012345678901234567890",
      purchase_time: "2023-04-10T10:00:00Z",
      bet_content: "7,14,22,36,41,49",
      purchase_amount: "0.01",
      transaction_hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      claim_tx_hash: "",
      created_at: "2023-04-10T10:00:00Z",
      updated_at: "2023-04-10T10:00:00Z",
    },
    {
      ticket_id: "ticket-002",
      issue_id: "2",
      buyer_address: "0x1234567890123456789012345678901234567890",
      purchase_time: "2023-04-12T10:00:00Z",
      bet_content: "3,11,17,25,29,33",
      purchase_amount: "0.001",
      transaction_hash: "0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
      claim_tx_hash: "",
      created_at: "2023-04-12T10:00:00Z",
      updated_at: "2023-04-12T10:00:00Z",
    },
    {
      ticket_id: "ticket-003",
      issue_id: "1",
      buyer_address: "0x1234567890123456789012345678901234567890",
      purchase_time: "2023-04-05T10:00:00Z",
      bet_content: "2,9,18,24,39,45",
      purchase_amount: "0.01",
      transaction_hash: "0x2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t",
      claim_tx_hash: "",
      created_at: "2023-04-05T10:00:00Z",
      updated_at: "2023-04-05T10:00:00Z",
    },
    {
      ticket_id: "ticket-004",
      issue_id: "3",
      buyer_address: "0x1234567890123456789012345678901234567890",
      purchase_time: "2023-04-01T10:00:00Z",
      bet_content: "5,18,23,37,42,50",
      purchase_amount: "0.05",
      transaction_hash: "0x3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t",
      claim_tx_hash: "0x4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4",
      created_at: "2023-04-01T10:00:00Z",
      updated_at: "2023-04-01T21:00:00Z",
    },
  ]
}

// 模拟最新彩票结果
export const getMockLatestLotteryResults = (): LatestLotteryResults[] => {
  return [
    {
      type_id: "1",
      type_name: "每周大奖",
      lottery_id: "1",
      ticket_name: "Weekly Mega Draw",
      issue_id: "1",
      issue_number: "202304",
      winning_numbers: "7,14,22,36,41,49",
      draw_date: "2023-04-10T20:00:00Z",
    },
    {
      type_id: "2",
      type_name: "每日快速",
      lottery_id: "2",
      ticket_name: "Daily Quick Draw",
      issue_id: "2",
      issue_number: "20230412",
      winning_numbers: "3,11,17,25,29,33",
      draw_date: "2023-04-12T20:00:00Z",
    },
    {
      type_id: "3",
      type_name: "月度头奖",
      lottery_id: "3",
      ticket_name: "Monthly Jackpot",
      issue_id: "3",
      issue_number: "202304",
      winning_numbers: "5,18,23,37,42,50",
      draw_date: "2023-04-01T20:00:00Z",
    },
  ]
}

// 模拟获取最近的发行信息
export const getMockLatestIssue = (lotteryId: string): LotteryIssue | undefined => {
  const issues = getMockLotteryIssues()
  // 按照创建时间降序排序，找到指定彩票ID的最新期号
  return issues
    .filter((issue) => issue.lottery_id === lotteryId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
}

// 模拟获取用户购买的彩票列表
export const getMockUserTickets = (address: string): LotteryTicket[] => {
  const tickets = getMockLotteryTickets()
  return tickets.filter((ticket) => ticket.buyer_address.toLowerCase() === address.toLowerCase())
}

// 模拟获取总奖池
export const getMockPrizePool = (): number => {
  return 160.5 // 模拟总奖池金额
}

// 模拟获取最近获奖者
export const getMockRecentWinners = () => {
  return [
    {
      lottery_id: "1",
      issue_id: "1",
      issue_number: "202304",
      winning_number: "7,14,22,36,41,49",
      winner_addr: "0x1a2...3b4c",
      win_amount: "25 LOT",
      ticket_name: "Weekly Mega Draw",
      win_date: "Apr 10, 2023",
    },
    {
      lottery_id: "2",
      issue_id: "2",
      issue_number: "202404",
      winning_number: "7,14,22,36,40,49",
      winner_addr: "0x5d6...7e8f",
      win_amount: "3 LOT",
      ticket_name: "Daily Quick Draw",
      win_date: "Apr 12, 2023",
    },
    {
      lottery_id: "3",
      issue_id: "3",
      issue_number: "202504",
      winning_number: "7,14,22,37,41,49",
      winner_addr: "0x9a0...b1c2",
      win_amount: "75 LOT",
      ticket_name: "Monthly Jackpot",
      win_date: "Apr 5, 2023",
    },
  ]
}

// 动态生成更多模拟彩票数据
export const generateMoreMockLotteries = (count: number): Lottery[] => {
  return Mock.mock({
    [`lotteries|${count}`]: [
      {
        "lottery_id|+1": 4,
        "type_id|1": ["1", "2", "3"],
        "ticket_name|1": ["Special Draw", "Weekend Jackpot", "Flash Lottery", "Crypto Millions"],
        "ticket_price|0.001-0.1": 0.001,
        betting_rules: "选择6个1-50之间的数字",
        prize_structure: "一等奖: 50 LOT, 二等奖: 10 LOT, 三等奖: 5 LOT",
        contract_address: () => `0x${Random.string("0123456789abcdef", 40)}`,
        created_at: () => Random.datetime("yyyy-MM-ddTHH:mm:ssZ"),
        updated_at: () => Random.datetime("yyyy-MM-ddTHH:mm:ssZ"),
      },
    ],
  }).lotteries.map((lottery: any) => ({
    ...lottery,
    lottery_id: String(lottery.lottery_id),
    ticket_price: String(lottery.ticket_price.toFixed(3)),
  }))
}

// 动态生成更多模拟彩票票据数据
export const generateMoreMockTickets = (count: number, address: string): LotteryTicket[] => {
  return Mock.mock({
    [`tickets|${count}`]: [
      {
        "ticket_id|+1": 5,
        "issue_id|1": ["1", "2", "3", "4", "5"],
        buyer_address: address,
        purchase_time: () => Random.datetime("yyyy-MM-ddTHH:mm:ssZ"),
        bet_content: () => {
          const nums = []
          for (let i = 0; i < 6; i++) {
            nums.push(Random.integer(1, 50))
          }
          return nums.sort((a, b) => a - b).join(",")
        },
        "purchase_amount|1": ["0.01", "0.001", "0.05"],
        transaction_hash: () => `0x${Random.string("0123456789abcdef", 64)}`,
        claim_tx_hash: () => (Math.random() > 0.7 ? `0x${Random.string("0123456789abcdef", 64)}` : ""),
        created_at: () => Random.datetime("yyyy-MM-ddTHH:mm:ssZ"),
        updated_at: () => Random.datetime("yyyy-MM-ddTHH:mm:ssZ"),
      },
    ],
  }).tickets.map((ticket: any, index: number) => ({
    ...ticket,
    ticket_id: `ticket-${5 + index}`,
  }))
}
// 辅助函数：将API彩票数据转换为UI显示格式
export const convertLotteryToUIFormat = (lottery: Lottery, issue?: LotteryIssue): FeaturedLottery => {
  return {
    lottery_id: lottery.lottery_id,
    type_id: lottery.type_id,
    ticket_name: lottery.ticket_name,
    ticket_price: lottery.ticket_price,
    betting_rules: lottery.betting_rules,
    prize_structure: lottery.prize_structure,
    contract_address: lottery.contract_address,
    lotteryIssue: [issue || {
      issue_id: "",
      lottery_id: lottery.lottery_id,
      issue_number: "",
      status: "",
      sale_end_time: "",
      draw_time: "",
      prize_pool: "",
      winning_numbers: "",
      random_seed: "",
      draw_tx_hash: "",
      created_at: "",
      updated_at: "",
    }], // 确保包含一个 LotteryIssue 数组
  };
};

// 辅助函数：格式化剩余时间
function formatTimeRemaining(endTime: Date): string {
  const now = new Date()
  const diff = endTime.getTime() - now.getTime()

  if (diff <= 0) return "已结束"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  let result = ""
  if (days > 0) result += `${days}d `
  if (hours > 0 || days > 0) result += `${hours}h `
  result += `${minutes}m`

  return result
}

// 辅助函数：将API彩票结果转换为UI显示格式
export const convertResultToUIFormat = (result: LatestLotteryResults) => {
  return {
    drawDate: new Date(result.draw_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    numbers: result.winning_numbers.split(",").map(Number),
    jackpot: `${Math.floor(Math.random() * 100) + 5} LOT`, // 模拟奖金
    winners: Math.floor(Math.random() * 3), // 模拟获奖人数
    nextDraw: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    nextJackpot: `${Math.floor(Math.random() * 100) + 10} LOT`, // 模拟下次奖金
  }
}

// 辅助函数：将API彩票票据转换为UI显示格式
export const convertTicketToUIFormat = (ticket: LotteryTicket, lotteries: Lottery[], issues: LotteryIssue[]) => {
  const issue = issues.find((i) => i.issue_id === ticket.issue_id)
  const lottery = lotteries.find((l) => l.lottery_id === issue?.lottery_id)

  return {
    id: ticket.ticket_id,
    date: new Date(ticket.purchase_time).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    lottery:lottery?.ticket_name || "Unknown",
    numbers: ticket.bet_content,
    price: `${ticket.purchase_amount} LOT`,
    status: getTicketStatus(ticket, issue),
    drawDate: issue
      ? new Date(issue.draw_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Unknown",
    prize: ticket.claim_tx_hash ? `${(Math.random() * 5).toFixed(2)} LOT` : undefined,
  }
}

// 辅助函数：获取彩票状态
function getTicketStatus(ticket: LotteryTicket, issue?: LotteryIssue): "Active" | "Won" | "Lost" {
  if (!issue) return "Active"

  if (issue.status !== "DRAWN") return "Active"

  if (ticket.claim_tx_hash) return "Won"

  return "Lost"
}
