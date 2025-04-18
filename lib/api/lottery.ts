import { RecentWinners } from '@/components/home/recent-winners';
import api from "./config"

// 彩票类型数据类型
export interface LotteryType {
  type_id: string
  type_name: string
  description: string
  created_at: string
  updated_at: string
}

// 创建彩票类型请求数据类型
export interface LotteryTypeRequest {
  type_name: string
  description: string
}

export interface FeaturedLottery{
  lottery_id: string
  type_id: string
  ticket_name: string
  ticket_price: string
  betting_rules: string
  prize_structure: string
  contract_address: string
  lotteryIssue: LotteryIssue[]
}

// 彩票数据类型
export interface Lottery {
  lottery_id: string
  type_id: string
  ticket_name: string
  ticket_price: string
  ticket_supply: number
  betting_rules: string
  prize_structure: string
  contract_address: string
  created_at: string
  updated_at: string
}

// 创建彩票请求数据类型
export interface LotteryRequest {
  type_id: string
  ticket_name: string
  ticket_price: number
  ticket_supply: number
  betting_rules: string
  prize_structure: string
  register_address: string
  rollout_contract_address: string
}

// 彩票期号数据类型
export interface LotteryIssue {
  issue_id: string
  lottery_id: string
  issue_number: string
  status: string
  sale_end_time: string
  draw_time: string
  prize_pool: string
  winning_numbers: string
  random_seed: string
  draw_tx_hash: string
  created_at: string
  updated_at: string
}

// 创建彩票期号请求数据类型
export interface LotteryIssueRequest {
  lottery_id: string
  issue_number: string
  sale_end_time: string
}

// 彩票票据数据类型
export interface LotteryTicket {
  ticket_id: string
  issue_id: string
  buyer_address: string
  purchase_time: string
  bet_content: string
  purchase_amount: string
  transaction_hash: string
  claim_tx_hash: string
  created_at: string
  updated_at: string
}

// 购买彩票请求数据类型
export interface BuyTicketRequest {
  ticket_id: string
  issue_id: string
  buyer_address: string
  bet_content: string
  purchase_amount: number
}

export interface LatestLotteryResults {
  type_id: string
  type_name: string
  lottery_id: string
  ticket_name: string
  issue_id: string
  issue_number: string
  winning_numbers: string
  draw_date: string
}

export interface RecentWinners {
  lottery_id: string
  ticket_name: string
  issue_id: string
  issue_number: string
  winning_number: string
  winner_addr: string
  win_amount: string
  win_date: string
}

export const drawLottery = async (issueId: string): Promise<number> =>{
  try {
    // 使用查询参数传递 issue_id
    const response = await api.post(`/lottery/draw`, null, {
      params: {
        issue_id: issueId,
      },
    });
    // 返回 HTTP 状态码（200 表示成功）
    return response.status; // 或直接返回 code（根据你的需求）
  } catch (error: any) {
    console.error("开奖失败:", error);
    // 抛出更具体的错误信息
    throw new Error(
      error.response?.data?.message || error.message || "Failed to draw lottery"
    );
  }
}

// 获取期号信息列表
export const getIssueById = async (issueId: string): Promise<LotteryIssue> => {
  try {
    const response = await api.get(`/lottery/issues/${issueId}`)
    return response.data.data
  } catch (error) {
    console.error("获取彩票期号失败:", error)
    throw error
  }
}

// 获取近期得奖的用户信息
export const getRecentWinners = async (): Promise<RecentWinners[]> => {
  try {
    const response = await api.get("/lottery/recent-winners")
    return response.data.data
  } catch (error) {
    console.error("获取近期得奖的用户信息失败:", error)
    throw error
  }
}

// 创建彩票类型
export const createLotteryType = async (typeData: LotteryTypeRequest): Promise<LotteryType> => {
  try {
    const response = await api.post("/lottery/types", typeData)
    return response.data.data
  } catch (error) {
    console.error("创建彩票类型失败:", error)
    throw error
  }
}

// 获取彩票类型列表
export const getLotteryTypes = async (): Promise<LotteryType[]> => {
  try {
    const response = await api.get("/lottery/types")
    console.log("lottery.ts response data :",response.data.data)
    return response.data.data
  } catch (error) {
    console.error("获取彩票类型列表失败:", error)
    throw error
  }
}

// 创建彩票
export const createLottery = async (lotteryData: LotteryRequest): Promise<Lottery> => {
  try {
    const response = await api.post("/lottery/lottery", lotteryData)
    return response.data.data
  } catch (error) {
    console.error("创建彩票失败:", error)
    throw error
  }
}

// 获取彩票列表
export const getLotteries = async (): Promise<Lottery[]> => {
  try {
    const response = await api.get("/lottery/lottery")
    return response.data.data
  } catch (error) {
    console.error("获取彩票列表失败:", error)
    throw error
  }
}

// 创建彩票期号
export const createLotteryIssue = async (issueData: LotteryIssueRequest): Promise<LotteryIssue> => {
  try {
    const response = await api.post("/lottery/issues", issueData)
    return response.data.data
  } catch (error) {
    console.error("创建彩票期号失败:", error)
    throw error
  }
}

// 获取最近的发行信息
export const getLatestIssue = async (lotteryId: string): Promise<LotteryIssue> => {
  try {
    const response = await api.get(`/lottery/issues/latest/${lotteryId}`)
    return response.data.data
  } catch (error) {
    console.error("获取最近发行信息失败:", error)
    throw error
  }
}

// 购买彩票
export const buyTicket = async (ticketData: BuyTicketRequest): Promise<LotteryTicket> => {
  try {
    const response = await api.post("/lottery/tickets", ticketData)
    return response.data.data
  } catch (error) {
    console.error("购买彩票失败:", error)
    throw error
  }
}

// 获取彩票以及期号开奖结果
export const getLatestLotteryResult = async (): Promise<LatestLotteryResults[]> => {
  try {
    const response = await api.get(`/lottery/draw/latest`)
    return response.data.data
  } catch (error) {
    console.error("获取彩票开奖结果失败:", error)
    throw error
  }
}

// 获取用户购买的彩票列表
export const getUserTickets = async (customerAddress: string): Promise<LotteryTicket[]> => {
  try {
    const response = await api.get(`/lottery/tickets/customer/${customerAddress}`)
    return response.data.data
  } catch (error) {
    console.error("获取用户彩票列表失败:", error)
    throw error
  }
}

// 获取总奖池
export const getPrizePool = async (): Promise<number> => {
  try {
    const response = await api.get("/lottery/pools")
    return response.data.data
  } catch (error) {
    console.error("获取总奖池失败:", error)
    throw error
  }
}
