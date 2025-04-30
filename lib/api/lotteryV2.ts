// @/lib/api/lotteryV2.ts
import api from "./config";

export interface LotteryType {
  type_id: string;
  type_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LotteryTypeRequest {
  type_name: string;
  description: string;
}

export interface Lottery {
  lottery_id: string;
  type_id: string;
  ticket_name: string;
  ticket_price: number;
  ticket_supply: number;
  betting_rules: string;
  prize_structure: string;
  registered_addr: string;
  rollout_contract_address: string;
  contract_address: string;
  created_at: string;
  updated_at: string;
  LotteryType: LotteryType;
}

// 创建彩票请求数据类型
export interface LotteryRequest {
  type_id: string;
  ticket_name: string;
  ticket_price: number;
  ticket_supply: number;
  betting_rules: string;
  prize_structure: string;
  registered_addr: string;
  rollout_contract_address: string;
}

// 彩票期号数据类型
export interface LotteryIssue {
  issue_id: string;
  lottery_id: string;
  issue_number: string;
  sale_end_time: string;
  draw_time: string;
  status: string;
  prize_pool: number;
  winning_numbers: string;
  random_seed: string;
  draw_tx_hash: string;
  created_at: string;
  updated_at: string;
  Lottery: Lottery;
}

// 创建彩票期号请求数据类型
export interface LotteryIssueRequest {
  lottery_id: string;
  issue_number: string;
  sale_end_time: string;
  draw_time: string;
  status: string;
}

// 彩票购买记录数据类型
export interface LotteryTicket {
  ticket_id: string;
  issue_id: string;
  buyer_address: string;
  purchase_time: string;
  bet_content: string;
  purchase_amount: number;
  transaction_hash: string;
  created_at: string;
  updated_at: string;
}

// 购买彩票请求数据类型
export interface BuyTicketRequest {
  issue_id: string;
  buyer_address: string;
  purchase_amount: number;
  bet_content: string;
}

// 中奖者数据类型
export interface LotteryWinner {
  winner_id: string;
  issue_id: string;
  ticket_id: string;
  address: string;
  prize_level: string;
  prize_amount: number;
  claim_tx_hash: string;
  created_at: string;
  updated_at: string;
  LotteryIssue: LotteryIssue;
  LotteryTicket: LotteryTicket;
}

// 获取彩票类型列表
export const getLotteryTypes = async (): Promise<LotteryType[]> => {
  try {
    const response = await api.get("/lottery/types/v2");
    return response.data.data;
  } catch (error) {
    console.error("获取彩票类型列表失败:", error);
    throw error;
  }
};

// 创建彩票类型
export const createLotteryType = async (typeData: LotteryTypeRequest): Promise<LotteryType> => {
  try {
    const response = await api.post("/lottery/types/v2", typeData);
    return response.data.data;
  } catch (error) {
    console.error("创建彩票类型失败:", error);
    throw error;
  }
};

// 获取彩票列表
export const getLotteries = async (params?: {
  ticket_name?: string;
  type_id?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  lotteries: Lottery[];
  total: number;
}> => {
  try {
    const response = await api.get("/lottery/lottery/v2", { params });
    return response.data.data;
  } catch (error) {
    console.error("获取彩票列表失败:", error);
    throw error;
  }
};

// 创建彩票
export const createLottery = async (lotteryData: LotteryRequest): Promise<Lottery> => {
  try {
    const response = await api.post("/lottery/lottery/v2", lotteryData);
    return response.data.data;
  } catch (error) {
    console.error("创建彩票失败:", error);
    throw error;
  }
};

// 获取彩票期号列表
export const getLotteryIssues = async (params?: {
  lottery_id?: string;
  issue_number?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  issues: LotteryIssue[];
  total: number;
  page: number;
  page_size: number;
}> => {
  try {
    const response = await api.get("/lottery/issues/v2", { params });
    return response.data.data;
  } catch (error) {
    console.error("获取彩票期号列表失败:", error);
    throw error;
  }
};

// 创建彩票期号
export const createLotteryIssue = async (issueData: LotteryIssueRequest): Promise<LotteryIssue> => {
  try {
    const response = await api.post("/lottery/issues/v2", issueData);
    return response.data.data;
  } catch (error) {
    console.error("创建彩票期号失败:", error);
    throw error;
  }
};

// 获取中奖者列表
export const getLotteryWinners = async (params?: {
  issue_id?: string;
  address?: string;
  prize_level?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  Winners: LotteryWinner[];
  Total: number;
  Page: number;
  PageSize: number;
}> => {
  try {
    const response = await api.get("/lottery/winners/v2", { params });
    return response.data.data;
  } catch (error) {
    console.error("获取中奖者列表失败:", error);
    throw error;
  }
};

// 获取彩票购买记录列表
export const getLotteryTickets = async (params?: {
  issue_id?: string;
  buyer_address?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  Tickets: LotteryTicket[];
  Total: number;
  Page: number;
  PageSize: number;
}> => {
  try {
    const response = await api.get("/lottery/tickets/v2", { params });
    return response.data.data;
  } catch (error) {
    console.error("获取彩票购买记录失败:", error);
    throw error;
  }
};

// 购买彩票
export const buyTicket = async (ticketData: BuyTicketRequest): Promise<LotteryTicket> => {
  try {
    const response = await api.post("/lottery/tickets/v2", ticketData);
    return response.data.data;
  } catch (error) {
    console.error("购买彩票失败:", error);
    throw error;
  }
};

// 开奖
export const drawLottery = async (issueId: string): Promise<number> => {
  try {
    const response = await api.post("/lottery/draw/v2", { issue_id: issueId });
    return response.status;
  } catch (error: any) {
    console.error("开奖失败:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to draw lottery");
  }
};

// 获取总奖池大小
export const getPrizePool = async (): Promise<number> => {
  try {
    const response = await api.get("/lottery/pools/v2");
    return response.data.data;
  } catch (error) {
    console.error("获取总奖池失败:", error);
    throw error;
  }
};