import {
  getLotteries as apiGetLotteries,
  getLotteryTypes as apiGetLotteryTypes,
  getLatestIssue as apiGetLatestIssue,
  getLatestLotteryResult as apiGetLatestLotteryResult,
  getUserTickets as apiGetUserTickets,
  getPrizePool as apiGetPrizePool,
  buyTicket as apiBuyTicket,
  createLottery as apiCreateLottery,
  createLotteryIssue as apiCreateLotteryIssue,
  createLotteryType as apiCreateLotteryType,
  getRecentWinners as apiGetRecentWinners,
  getIssueById as apiGetIssueById,
  type Lottery,
  type LotteryType,
  type LotteryIssue,
  type LotteryTicket,
  type FeaturedLottery,
  type LotteryRequest,
  type LatestLotteryResults,
  type LotteryTypeRequest,
  type LotteryIssueRequest,
  type BuyTicketRequest,
  type RecentWinners
} from "@/lib/api/lottery"

import {
  getMockLotteries,
  getMockLotteryTypes,
  getMockLatestIssue,
  getMockLatestLotteryResults,
  getMockUserTickets,
  getMockPrizePool,
  generateMoreMockLotteries,
  generateMoreMockTickets,
  convertLotteryToUIFormat,
  convertResultToUIFormat,
  convertTicketToUIFormat,
  getMockLotteryIssues,
  getMockRecentWinners, // Import getMockRecentWinners
} from "@/lib/mock/lottery"

// 环境变量，控制是否使用模拟数据
//const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false" // Default to using mock data unless explicitly set to "false"
const USE_MOCK = false
// 获取彩票类型列表
export async function fetchLotteryTypes(): Promise<LotteryType[]> {
  console.log("Fetching lottery types...",USE_MOCK)
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockLotteryTypes())
      }, 300)
    })
  }
  return apiGetLotteryTypes()
}

// 获取彩票列表
export async function fetchLotteries(): Promise<any[]> {
  try {
    console.log("Fetching lotteries...",USE_MOCK)
    if (USE_MOCK) {
      const mockLotteries = getMockLotteries()
      const mockIssues = getMockLotteryIssues()

      // 转换为UI格式
      return mockLotteries.map((lottery) => {
        const latestIssue = mockIssues.find(
          (issue) => issue.lottery_id === lottery.lottery_id && issue.status === "OPEN",
        )
        return convertLotteryToUIFormat(lottery, latestIssue)
      })
    }

    // 实际API调用
    const lotteries = await apiGetLotteries()
    const result = []

    // 获取每个彩票的最新期号
    for (const lottery of lotteries) {
      try {
        const latestIssue = await apiGetLatestIssue(lottery.lottery_id)
        result.push(convertLotteryToUIFormat(lottery, latestIssue))
      } catch (error) {
        console.error(`获取彩票 ${lottery.lottery_id} 的最新期号失败:`, error)
        result.push(convertLotteryToUIFormat(lottery))
      }
    }
    console.log("result",result)
    return result
  } catch (error) {
    console.error("获取彩票列表失败:", error)
    // 如果API调用失败，回退到使用模拟数据
    console.log("回退到使用模拟数据...")
    const mockLotteries = getMockLotteries()
    const mockIssues = getMockLotteryIssues()

    return mockLotteries.map((lottery) => {
      const latestIssue = mockIssues.find((issue) => issue.lottery_id === lottery.lottery_id && issue.status === "OPEN")
      return convertLotteryToUIFormat(lottery, latestIssue)
    })
  }
}

// 获取特定彩票
export async function fetchLottery(id: string): Promise<any | undefined> {
  try {
    if (USE_MOCK) {
      const mockLotteries = getMockLotteries()
      const lottery = mockLotteries.find((l) => l.lottery_id === id)
      if (!lottery) return undefined

      const latestIssue = getMockLatestIssue(id)
      return convertLotteryToUIFormat(lottery, latestIssue)
    }

    // 实际API调用
    const lotteries = await apiGetLotteries()
    const lottery = lotteries.find((l) => l.lottery_id === id)
    if (!lottery) return undefined

    const latestIssue = await apiGetLatestIssue(id)
    return convertLotteryToUIFormat(lottery, latestIssue)
  } catch (error) {
    console.error(`获取彩票 ${id} 失败:`, error)
    throw error
  }
}

// 获取彩票结果
export async function fetchLotteryResults(): Promise<Record<string, any>> {
  try {
    if (USE_MOCK) {
      const results = getMockLatestLotteryResults()
      const formattedResults: Record<string, any> = {}

      // 将结果转换为UI格式并按类型分组
      results.forEach((result) => {
        const type = result.type_id === "1" ? "weekly" : result.type_id === "2" ? "daily" : "monthly"
        formattedResults[type] = convertResultToUIFormat(result)
      })

      return formattedResults
    }

    // 实际API调用
    const results = await apiGetLatestLotteryResult()
    const formattedResults: Record<string, any> = {}

    // 将结果转换为UI格式并按类型分组
    results.forEach((result) => {
      const type = result.type_id === "1" ? "weekly" : result.type_id === "2" ? "daily" : "monthly"
      formattedResults[type] = convertResultToUIFormat(result)
    })

    return formattedResults
  } catch (error) {
    console.error("获取彩票结果失败:", error)
    throw error
  }
}

// 获取历史抽奖记录
export async function fetchPastDraws(type = "all"): Promise<any[]> {
  try {
    if (USE_MOCK) {
      const results = getMockLatestLotteryResults()

      // 转换为UI显示格式
      const pastDraws = results.map((result) => ({
        id: result.issue_id,
        date: new Date(result.draw_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        type: result.ticket_name,
        numbers: result.winning_numbers,
        jackpot: `${Math.floor(Math.random() * 100) + 5} LOT`, // 模拟奖金
        winners: Math.floor(Math.random() * 5), // 模拟获奖人数
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
      }))

      if (type === "all") {
        return pastDraws
      } else {
        return pastDraws.filter((draw) => draw.type === type)
      }
    }

    // 实际API调用
    const results = await apiGetLatestLotteryResult()

    // 转换为UI显示格式
    const pastDraws = results.map((result) => ({
      id: result.issue_id,
      date: new Date(result.draw_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: result.ticket_name,
      numbers: result.winning_numbers,
      jackpot: `${Math.floor(Math.random() * 100) + 5} LOT`, // 模拟奖金，实际应从API获取
      winners: Math.floor(Math.random() * 5), // 模拟获奖人数，实际应从API获取
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...`, // 模拟交易哈希，实际应从API获取
    }))

    if (type === "all") {
      return pastDraws
    } else {
      return pastDraws.filter((draw) => draw.type === type)
    }
  } catch (error) {
    console.error("获取历史抽奖记录失败:", error)
    throw error
  }
}

// 获取购买记录
export async function fetchTicketPurchases(address: string, status = "all"): Promise<any[]> {
  try {
    if (USE_MOCK) {
      const mockTickets = getMockUserTickets(address)
      const mockLotteries = getMockLotteries()
      const mockIssues = getMockLotteryIssues()

      // 转换为UI显示格式
      const purchases = mockTickets.map((ticket) => convertTicketToUIFormat(ticket, mockLotteries, mockIssues))

      if (status === "all") {
        return purchases
      } else {
        return purchases.filter((purchase) => purchase.status.toLowerCase() === status.toLowerCase())
      }
    }

    // 实际API调用
    const tickets = await apiGetUserTickets(address)
    const lotteries = await apiGetLotteries()

    // 获取所有相关的期号信息
    const issueIds = [...new Set(tickets.map((ticket) => ticket.issue_id))]
    const issues: LotteryIssue[] = []

    for (const issueId of issueIds) {
      try {
        const issue = await apiGetIssueById(issueId)
        issues.push(issue)
      } catch (error) {
        console.error(`获取期号 ${issueId} 信息失败:`, error)
      }
    }

    // 转换为UI显示格式
    const purchases = tickets.map((ticket) => convertTicketToUIFormat(ticket, lotteries, issues))

    if (status === "all") {
      return purchases
    } else {
      return purchases.filter((purchase) => purchase.status.toLowerCase() === status.toLowerCase())
    }
  } catch (error) {
    console.error("获取购买记录失败:", error)
    throw error
  }
}

// 获取最近获奖者
export async function fetchRecentWinners():Promise<RecentWinners[]> {
  // 目前API中没有直接获取最近获奖者的接口，使用模拟数据
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockRecentWinners())
      }, 300)
    })
  }
  return apiGetRecentWinners()
  
}

// 获取总奖池
export async function fetchPrizePool(): Promise<number> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockPrizePool())
      }, 300)
    })
  }
  return apiGetPrizePool()
}

// 购买彩票
export async function purchaseTickets(
  issueId: string,
  buyerAddress: string,
  betContent: string,
  amount: number,
): Promise<boolean> {
  try {
    if (USE_MOCK) {
      // 模拟购买成功
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 1500)
      })
    }

    // 实际API调用
    const ticketData: BuyTicketRequest = {
      ticket_id: `ticket-${Date.now()}`, // 生成临时ID，实际可能由后端生成
      issue_id: issueId,
      buyer_address: buyerAddress,
      bet_content: betContent,
      purchase_amount: amount,
    }

    await apiBuyTicket(ticketData)
    return true
  } catch (error) {
    console.error("购买彩票失败:", error)
    throw error
  }
}

// 创建彩票类型
export async function createNewLotteryType(typeName: string, description: string): Promise<LotteryType> {
  try {
    if (USE_MOCK) {
      // 模拟创建成功
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            type_id: `${Date.now()}`,
            type_name: typeName,
            description: description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }, 1000)
      })
    }

    // 实际API调用
    const typeData: LotteryTypeRequest = {
      type_name: typeName,
      description: description,
    }

    return apiCreateLotteryType(typeData)
  } catch (error) {
    console.error("创建彩票类型失败:", error)
    throw error
  }
}

// 创建彩票
export async function createNewLottery(lotteryData: LotteryRequest): Promise<Lottery> {
  try {
    if (USE_MOCK) {
      // 模拟创建成功
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            lottery_id: `${Date.now()}`,
            type_id: lotteryData.type_id,
            ticket_name: lotteryData.ticket_name,
            ticket_price: "10", // 修改为 number
            betting_rules: lotteryData.betting_rules,
            prize_structure: lotteryData.prize_structure,
            contract_address: "0x1234567890abcdef1234567890abcdef12345678",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }, 1000)
      })
    }

    // 实际API调用
    return apiCreateLottery(lotteryData)
  } catch (error) {
    console.error("创建彩票失败:", error)
    throw error
  }
}

// 创建彩票期号
export async function createNewLotteryIssue(
  lotteryId: string,
  issueNumber: string,
  saleEndTime: string,
): Promise<LotteryIssue> {
  try {
    if (USE_MOCK) {
      // 模拟创建成功
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            issue_id: `${Date.now()}`,
            lottery_id: lotteryId,
            issue_number: issueNumber,
            status: "OPEN",
            sale_end_time: saleEndTime,
            draw_time: new Date(new Date(saleEndTime).getTime() + 2 * 60 * 60 * 1000).toISOString(), // 销售结束2小时后开奖
            prize_pool: "0",
            winning_numbers: "",
            random_seed: "",
            draw_tx_hash: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }, 1000)
      })
    }

    // 实际API调用
    const issueData: LotteryIssueRequest = {
      lottery_id: lotteryId,
      issue_number: issueNumber,
      sale_end_time: saleEndTime,
    }

    return apiCreateLotteryIssue(issueData)
  } catch (error) {
    console.error("创建彩票期号失败:", error)
    throw error
  }
}

// 加载更多彩票
export async function loadMoreLotteries(count = 3): Promise<any[]> {
  if (USE_MOCK) {
    // 使用模拟数据
    const mockLotteries = generateMoreMockLotteries(count)
    return mockLotteries.map((lottery) => convertLotteryToUIFormat(lottery))
  }

  // 实际应用中，这里可能需要调用分页API
  return []
}

// 加载更多购买记录
export async function loadMoreTicketPurchases(address: string, count = 5): Promise<any[]> {
  if (USE_MOCK) {
    // 使用模拟数据
    const mockTickets = generateMoreMockTickets(count, address)
    const mockLotteries = getMockLotteries()
    const mockIssues = getMockLotteryIssues()

    return mockTickets.map((ticket) => convertTicketToUIFormat(ticket, mockLotteries, mockIssues))
  }

  // 实际应用中，这里可能需要调用分页API
  return []
}

// 导出类型
export type { Lottery, LotteryType, LotteryIssue, LotteryTicket, LatestLotteryResults,FeaturedLottery,RecentWinners,LotteryRequest }
