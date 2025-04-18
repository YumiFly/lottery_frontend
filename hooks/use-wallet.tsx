"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { getWalletStatus, connectWallet, disconnectWallet } from "@/lib/services/wallet-service"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"

// 定义本地存储的键名
const WALLET_STORAGE_KEY = "w3lottery_wallet_state"
// 定义缓存过期时间（毫秒）- 默认2小时
const CACHE_EXPIRY = 2 * 60 * 60 * 1000

// 定义钱包状态类型
type WalletState = {
  isConnected: boolean
  address: string | null
  timestamp: number // 添加时间戳用于缓存过期检查
}

type WalletContextType = {
  isConnected: boolean
  address: string | null
  isLoading: boolean
  connect: (walletType: string) => Promise<void>
  disconnect: () => Promise<void>
  refreshWalletState: () => Promise<void> // 添加刷新方法
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  isLoading: true,
  connect: async () => {},
  disconnect: async () => {},
  refreshWalletState: async () => {},
})

// 从本地存储获取钱包状态
const getStoredWalletState = (): WalletState | null => {
  if (typeof window === "undefined") return null

  try {
    const storedData = localStorage.getItem(WALLET_STORAGE_KEY)
    if (!storedData) return null

    const walletState = JSON.parse(storedData) as WalletState

    // 检查缓存是否过期
    if (Date.now() - walletState.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(WALLET_STORAGE_KEY)
      return null
    }

    return walletState
  } catch (error) {
    console.error("Failed to parse stored wallet state:", error)
    return null
  }
}

// 保存钱包状态到本地存储
const storeWalletState = (state: Omit<WalletState, "timestamp">) => {
  if (typeof window === "undefined") return

  try {
    const walletState: WalletState = {
      ...state,
      timestamp: Date.now(),
    }
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletState))
  } catch (error) {
    console.error("Failed to store wallet state:", error)
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  // 初始化钱包状态
  const initWallet = async (forceRefresh = false) => {
    try {
      setIsLoading(true)

      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedState = getStoredWalletState()
        if (storedState) {
          setIsConnected(storedState.isConnected)
          setAddress(storedState.address)
          setIsLoading(false)
          return
        }
      }

      // 如果本地没有存储或强制刷新，则从服务器获取
      const walletState = await getWalletStatus()
      setIsConnected(walletState.isConnected)
      setAddress(walletState.address)

      // 保存到本地存储
      storeWalletState({
        isConnected: walletState.isConnected,
        address: walletState.address,
      })
    } catch (error) {
      console.error("Failed to initialize wallet:", error)
      // 出错时清除本地存储
      localStorage.removeItem(WALLET_STORAGE_KEY)
      setIsConnected(false)
      setAddress(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    initWallet()
  }, [])

  // 连接钱包
  const connect = async (walletType: string) => {
    setIsLoading(true)
    try {
      const walletState = await connectWallet(walletType)
      setIsConnected(walletState.isConnected)
      setAddress(walletState.address)

      // 保存到本地存储
      storeWalletState({
        isConnected: walletState.isConnected,
        address: walletState.address,
      })

      // 显示成功提示
      toast({
        title: t("common.success"),
        description: t("common.connected"),
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: t("common.error"),
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })

      // 出错时清除本地存储
      localStorage.removeItem(WALLET_STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }

  // 断开钱包连接
  const disconnect = async () => {
    setIsLoading(true)
    try {
      const walletState = await disconnectWallet()
      setIsConnected(walletState.isConnected)
      setAddress(walletState.address)

      // 清除本地存储
      localStorage.removeItem(WALLET_STORAGE_KEY)
      // 同时清除用户状态存储
      localStorage.removeItem("w3lottery_user_state")
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 刷新钱包状态（供外部调用）
  const refreshWalletState = async () => {
    await initWallet(true)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isLoading,
        connect,
        disconnect,
        refreshWalletState,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
