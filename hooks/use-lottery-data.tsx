"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  fetchLotteries,
  fetchLotteryResults,
  fetchPastDraws,
  fetchRecentWinners,
  fetchPrizePool,
  fetchTicketPurchases,
  fetchLotteryTypes,
  createNewLottery,
  createNewLotteryIssue,
  drawLottery,
} from "@/lib/services/lottery-service"
import { useWallet } from "@/hooks/use-wallet"

// 定义本地存储的键名
const LOTTERY_DATA_STORAGE_KEY = "w3lottery_lottery_data"
const LOTTERY_RESULTS_STORAGE_KEY = "w3lottery_lottery_results"
const PAST_DRAWS_STORAGE_KEY = "w3lottery_past_draws"
const RECENT_WINNERS_STORAGE_KEY = "w3lottery_recent_winners"
const PRIZE_POOL_STORAGE_KEY = "w3lottery_prize_pool"
const LOTTERY_TYPES_STORAGE_KEY = "w3lottery_lottery_types"
const LOTTERY_ISSUES_STORAGE_KEY = "w3lottery_lottery_issues"

// 定义缓存过期时间（毫秒）
const CACHE_EXPIRY = {
  lotteries: 5 * 60 * 1000, // 5分钟
  results: 10 * 60 * 1000, // 10分钟
  pastDraws: 30 * 60 * 1000, // 30分钟
  recentWinners: 15 * 60 * 1000, // 15分钟
  prizePool: 5 * 60 * 1000, // 5分钟
  tickets: 2 * 60 * 1000, // 2分钟
  types: 60 * 60 * 1000, // 1小时
  issues: 5 * 60 * 1000, // 5分钟
}

// 定义缓存数据类型
interface CachedData<T> {
  data: T
  timestamp: number
}

// 定义上下文类型
interface LotteryDataContextType {
  lotteries: any[]
  lotteryResults: Record<string, any>
  pastDraws: any[]
  recentWinners: any[]
  prizePool: number
  ticketPurchases: any[]
  lotteryTypes: any[]
  lotteryIssues: any[]
  isLoadingLotteries: boolean
  isLoadingResults: boolean
  isLoadingPastDraws: boolean
  isLoadingWinners: boolean
  isLoadingPrizePool: boolean
  isLoadingTickets: boolean
  isLoadingTypes: boolean
  isLoadingIssues: boolean
  errorLotteries: string | null
  errorResults: string | null
  errorPastDraws: string | null
  errorWinners: string | null
  errorPrizePool: string | null
  errorTickets: string | null
  errorTypes: string | null
  errorIssues: string | null
  refreshLotteries: () => Promise<void>
  refreshResults: () => Promise<void>
  refreshPastDraws: () => Promise<void>
  refreshWinners: () => Promise<void>
  refreshPrizePool: () => Promise<void>
  refreshTickets: () => Promise<void>
  refreshTypes: () => Promise<void>
  refreshIssues: () => Promise<void>
  createLottery: (lotteryData: any) => Promise<any>
  createIssue: (lotteryId: string, issue_numbers: string, saleEndTime: string) => Promise<any>
  executeDraw: (issueId: string) => Promise<number |undefined>
}

// 创建上下文
const LotteryDataContext = createContext<LotteryDataContextType>({
  lotteries: [],
  lotteryResults: {},
  pastDraws: [],
  recentWinners: [],
  prizePool: 0,
  ticketPurchases: [],
  lotteryTypes: [],
  lotteryIssues: [],
  isLoadingLotteries: false,
  isLoadingResults: false,
  isLoadingPastDraws: false,
  isLoadingWinners: false,
  isLoadingPrizePool: false,
  isLoadingTickets: false,
  isLoadingTypes: false,
  isLoadingIssues: false,
  errorLotteries: null,
  errorResults: null,
  errorPastDraws: null,
  errorWinners: null,
  errorPrizePool: null,
  errorTickets: null,
  errorTypes: null,
  errorIssues: null,
  refreshLotteries: async () => {},
  refreshResults: async () => {},
  refreshPastDraws: async () => {},
  refreshWinners: async () => {},
  refreshPrizePool: async () => {},
  refreshTickets: async () => {},
  refreshTypes: async () => {},
  refreshIssues: async () => {},
  createLottery: async () => ({}),
  createIssue: async () => ({}),
  executeDraw: async () => undefined,
})

// 从本地存储获取数据
function getStoredData<T>(key: string, expiryTime: number): T | null {
  if (typeof window === "undefined") return null

  try {
    const storedData = localStorage.getItem(key)
    if (!storedData) return null

    const cachedData = JSON.parse(storedData) as CachedData<T>

    // 检查缓存是否过期
    if (Date.now() - cachedData.timestamp > expiryTime) {
      localStorage.removeItem(key)
      return null
    }

    return cachedData.data
  } catch (error) {
    console.error(`Failed to parse stored data for ${key}:`, error)
    return null
  }
}

// 保存数据到本地存储
function storeData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return

  try {
    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(cachedData))
  } catch (error) {
    console.error(`Failed to store data for ${key}:`, error)
  }
}

// 提供者组件
export function LotteryDataProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet()

  // 彩票列表状态
  const [lotteries, setLotteries] = useState<any[]>([])
  const [isLoadingLotteries, setIsLoadingLotteries] = useState(false)
  const [errorLotteries, setErrorLotteries] = useState<string | null>(null)

  // 彩票结果状态
  const [lotteryResults, setLotteryResults] = useState<Record<string, any>>({})
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [errorResults, setErrorResults] = useState<string | null>(null)

  // 历史抽奖状态
  const [pastDraws, setPastDraws] = useState<any[]>([])
  const [isLoadingPastDraws, setIsLoadingPastDraws] = useState(false)
  const [errorPastDraws, setErrorPastDraws] = useState<string | null>(null)

  // 最近获奖者状态
  const [recentWinners, setRecentWinners] = useState<any[]>([])
  const [isLoadingWinners, setIsLoadingWinners] = useState(false)
  const [errorWinners, setErrorWinners] = useState<string | null>(null)

  // 奖池状态
  const [prizePool, setPrizePool] = useState(0)
  const [isLoadingPrizePool, setIsLoadingPrizePool] = useState(false)
  const [errorPrizePool, setErrorPrizePool] = useState<string | null>(null)

  // 票据购买状态
  const [ticketPurchases, setTicketPurchases] = useState<any[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [errorTickets, setErrorTickets] = useState<string | null>(null)

  // 彩票类型状态
  const [lotteryTypes, setLotteryTypes] = useState<any[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(false)
  const [errorTypes, setErrorTypes] = useState<string | null>(null)

  // 彩票期号状态
  const [lotteryIssues, setLotteryIssues] = useState<any[]>([])
  const [isLoadingIssues, setIsLoadingIssues] = useState(false)
  const [errorIssues, setErrorIssues] = useState<string | null>(null)

  // 加载彩票列表
  const loadLotteries = useCallback(async (forceRefresh = false) => {
    setIsLoadingLotteries(true)
    setErrorLotteries(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedLotteries = getStoredData<any[]>(LOTTERY_DATA_STORAGE_KEY, CACHE_EXPIRY.lotteries)
        if (storedLotteries && storedLotteries.length > 0) {
          setLotteries(storedLotteries)
          setIsLoadingLotteries(false)
          return
        }
      }

      // 从API获取数据
      const data = await fetchLotteries()
      setLotteries(data)

      // 保存到本地存储
      storeData(LOTTERY_DATA_STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to fetch lotteries:", error)
      setErrorLotteries("Failed to load lotteries. Please try again.")
    } finally {
      setIsLoadingLotteries(false)
    }
  }, [])

  // 加载彩票结果
  const loadLotteryResults = useCallback(async (forceRefresh = false) => {
    setIsLoadingResults(true)
    setErrorResults(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedResults = getStoredData<Record<string, any>>(LOTTERY_RESULTS_STORAGE_KEY, CACHE_EXPIRY.results)
        if (storedResults && Object.keys(storedResults).length > 0) {
          setLotteryResults(storedResults)
          setIsLoadingResults(false)
          return
        }
      }

      // 从API获取数据
      const data = await fetchLotteryResults()
      setLotteryResults(data)

      // 保存到本地存储
      storeData(LOTTERY_RESULTS_STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to fetch lottery results:", error)
      setErrorResults("Failed to load lottery results. Please try again.")
    } finally {
      setIsLoadingResults(false)
    }
  }, [])

  // 加载历史抽奖
  const loadPastDraws = useCallback(async (forceRefresh = false) => {
    setIsLoadingPastDraws(true)
    setErrorPastDraws(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedDraws = getStoredData<any[]>(PAST_DRAWS_STORAGE_KEY, CACHE_EXPIRY.pastDraws)
        if (storedDraws && storedDraws.length > 0) {
          setPastDraws(storedDraws)
          setIsLoadingPastDraws(false)
          return
        }
      }

      // 从API获取数据
      const data = await fetchPastDraws()
      setPastDraws(data)

      // 保存到本地存储
      storeData(PAST_DRAWS_STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to fetch past draws:", error)
      setErrorPastDraws("Failed to load past draws. Please try again.")
    } finally {
      setIsLoadingPastDraws(false)
    }
  }, [])

  // 加载最近获奖者
  const loadRecentWinners = useCallback(async (forceRefresh = false) => {
    setIsLoadingWinners(true)
    setErrorWinners(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedWinners = getStoredData<any[]>(RECENT_WINNERS_STORAGE_KEY, CACHE_EXPIRY.recentWinners)
        if (storedWinners && storedWinners.length > 0) {
          setRecentWinners(storedWinners)
          setIsLoadingWinners(false)
          return
        }
      }

      // 从API获取数据
      const data = await fetchRecentWinners()
      setRecentWinners(data)

      // 保存到本地存储
      storeData(RECENT_WINNERS_STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to fetch recent winners:", error)
      setErrorWinners("Failed to load recent winners. Please try again.")
    } finally {
      setIsLoadingWinners(false)
    }
  }, [])

  // 加载奖池
  const loadPrizePool = useCallback(async (forceRefresh = false) => {
    setIsLoadingPrizePool(true)
    setErrorPrizePool(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedPrizePool = getStoredData<number>(PRIZE_POOL_STORAGE_KEY, CACHE_EXPIRY.prizePool)
        if (storedPrizePool !== null) {
          setPrizePool(storedPrizePool)
          setIsLoadingPrizePool(false)
          return
        }
      }

      // 从API获取数据
      const data = await fetchPrizePool()
      setPrizePool(data)

      // 保存到本地存储
      storeData(PRIZE_POOL_STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to fetch prize pool:", error)
      setErrorPrizePool("Failed to load prize pool. Please try again.")
    } finally {
      setIsLoadingPrizePool(false)
    }
  }, [])

  // 加载票据购买记录
  const loadTicketPurchases = useCallback(
    async (forceRefresh = false) => {
      if (!address) {
        setTicketPurchases([])
        setIsLoadingTickets(false)
        return
      }

      setIsLoadingTickets(true)
      setErrorTickets(null)

      try {
        // 如果不是强制刷新，先尝试从本地存储获取
        if (!forceRefresh) {
          const key = `w3lottery_tickets_${address}`
          const storedTickets = getStoredData<any[]>(key, CACHE_EXPIRY.tickets)
          if (storedTickets && storedTickets.length > 0) {
            setTicketPurchases(storedTickets)
            setIsLoadingTickets(false)
            return
          }
        }

        // 从API获取数据
        const data = await fetchTicketPurchases(address)
        setTicketPurchases(data)

        // 保存到本地存储
        if (address) {
          const key = `w3lottery_tickets_${address}`
          storeData(key, data)
        }
      } catch (error) {
        console.error("Failed to fetch ticket purchases:", error)
        setErrorTickets("Failed to load ticket purchases. Please try again.")
      } finally {
        setIsLoadingTickets(false)
      }
    },
    [address],
  )

  // 加载彩票类型
  const loadLotteryTypes = useCallback(async (forceRefresh = false) => {
    setIsLoadingTypes(true)
    setErrorTypes(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedTypes = getStoredData<any[]>(LOTTERY_TYPES_STORAGE_KEY, CACHE_EXPIRY.types)
        console.log("storedTypes", storedTypes)
        if (storedTypes && storedTypes.length > 0) {
          setLotteryTypes(storedTypes)
          setIsLoadingTypes(false)
          return
        }
      }
      console.log("Fetching lottery types from API...");
      // 从API获取数据
      const data = await fetchLotteryTypes()
      setLotteryTypes(data)

      // 保存到本地存储
      storeData(LOTTERY_TYPES_STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to fetch lottery types:", error)
      setErrorTypes("Failed to load lottery types. Please try again.")
    } finally {
      setIsLoadingTypes(false)
    }
  }, [])

  // 加载彩票期号
  const loadLotteryIssues = useCallback(async (forceRefresh = false) => {
    setIsLoadingIssues(true)
    setErrorIssues(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedIssues = getStoredData<any[]>(LOTTERY_ISSUES_STORAGE_KEY, CACHE_EXPIRY.issues)
        if (storedIssues && storedIssues.length > 0) {
          setLotteryIssues(storedIssues)
          setIsLoadingIssues(false)
          return
        }
      }

      // 从API获取数据
      // const data = await fetchLotteries()
      setLotteryIssues(lotteries)

      // 保存到本地存储
      storeData(LOTTERY_ISSUES_STORAGE_KEY, lotteries)
    } catch (error) {
      console.error("Failed to fetch lottery issues:", error)
      setErrorIssues("Failed to load lottery issues. Please try again.")
    } finally {
      setIsLoadingIssues(false)
    }
  }, [])

  // 创建彩票
  const createLottery = async (lotteryData: any) => {
    try {
      const result = await createNewLottery(lotteryData)
      // 刷新彩票列表
      await loadLotteries(true)
      return result
    } catch (error) {
      console.error("Failed to create lottery:", error)
      throw error
    }
  }

  // 创建彩票期号 - 更新函数签名，添加issue_numbers参数
  const createIssue = async (lotteryId: string, issue_numbers: string, saleEndTime: string) => {
    try {
      const result = await createNewLotteryIssue(lotteryId, issue_numbers, saleEndTime)
      // 刷新彩票期号
      await loadLotteries(true)
      await loadLotteryIssues(true)
      return result
    } catch (error) {
      console.error("Failed to create lottery issue:", error)
      throw error
    }
  }

  // 执行开奖 - 更新返回类型为number
  const executeDraw = async (issueId: string): Promise<number|undefined> => {
    try {
      const statusCode = await drawLottery(issueId)
      // 如果开奖成功，刷新相关数据
      // if (statusCode === 200) {
      //   // 刷新彩票期号和历史抽奖
      //   await Promise.all([loadLotteryIssues(true), loadPastDraws(true), loadLotteryResults(true)])
      // }
      return statusCode
    } catch (error) {
      console.error("Failed to execute draw:", error)
      throw error
    }
  }

  // 初始化加载
  useEffect(() => {
    loadLotteries()
    loadLotteryResults()
    loadPastDraws()
    loadRecentWinners()
    loadPrizePool()
    loadLotteryTypes()
    loadLotteryIssues()
  }, [
    loadLotteries,
    loadLotteryResults,
    loadPastDraws,
    loadRecentWinners,
    loadPrizePool,
    loadLotteryTypes,
    loadLotteryIssues,
  ])

  // 当钱包地址变化时加载票据
  useEffect(() => {
    loadTicketPurchases()
  }, [address, loadTicketPurchases])

  // 刷新方法
  const refreshLotteries = () => loadLotteries(true)
  const refreshResults = () => loadLotteryResults(true)
  const refreshPastDraws = () => loadPastDraws(true)
  const refreshWinners = () => loadRecentWinners(true)
  const refreshPrizePool = () => loadPrizePool(true)
  const refreshTickets = () => loadTicketPurchases(true)
  const refreshTypes = () => loadLotteryTypes(true)
  const refreshIssues = () => loadLotteryIssues(true)

  const value = {
    lotteries,
    lotteryResults,
    pastDraws,
    recentWinners,
    prizePool,
    ticketPurchases,
    lotteryTypes,
    lotteryIssues,
    isLoadingLotteries,
    isLoadingResults,
    isLoadingPastDraws,
    isLoadingWinners,
    isLoadingPrizePool,
    isLoadingTickets,
    isLoadingTypes,
    isLoadingIssues,
    errorLotteries,
    errorResults,
    errorPastDraws,
    errorWinners,
    errorPrizePool,
    errorTickets,
    errorTypes,
    errorIssues,
    refreshLotteries,
    refreshResults,
    refreshPastDraws,
    refreshWinners,
    refreshPrizePool,
    refreshTickets,
    refreshTypes,
    refreshIssues,
    createLottery,
    createIssue,
    executeDraw,
  }

  return <LotteryDataContext.Provider value={value}>{children}</LotteryDataContext.Provider>
}

// 自定义钩子
export function useLotteryData() {
  return useContext(LotteryDataContext)
}
