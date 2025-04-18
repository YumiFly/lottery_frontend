"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { getCustomerByAddress } from "@/lib/services/kyc-service"
import type { Customer } from "@/lib/api/kyc"

// 定义本地存储的键名
const USER_STATE_STORAGE_KEY = "w3lottery_user_state"
// 定义缓存过期时间（毫秒）- 默认2小时
const CACHE_EXPIRY = 2 * 60 * 60 * 1000

// 定义用户状态类型
interface UserState {
  address: string | null
  isConnected: boolean
  isVerified: boolean
  isAdmin: boolean
  customer: Customer | null
  timestamp: number
}

// 定义上下文类型
interface UserStateContextType {
  address: string | null
  isConnected: boolean
  isVerified: boolean
  isAdmin: boolean
  customer: Customer | null
  isLoading: boolean
  error: string | null
  refreshUserState: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

// 创建上下文
const UserStateContext = createContext<UserStateContextType>({
  address: null,
  isConnected: false,
  isVerified: false,
  isAdmin: false,
  customer: null,
  isLoading: true,
  error: null,
  refreshUserState: async () => {},
  hasPermission: () => false,
})

// 从本地存储获取用户状态
const getStoredUserState = (): UserState | null => {
  if (typeof window === "undefined") return null

  try {
    const storedData = localStorage.getItem(USER_STATE_STORAGE_KEY)
    if (!storedData) return null

    const userState = JSON.parse(storedData) as UserState

    // 检查缓存是否过期
    if (Date.now() - userState.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(USER_STATE_STORAGE_KEY)
      return null
    }

    return userState
  } catch (error) {
    console.error("Failed to parse stored user state:", error)
    return null
  }
}

// 保存用户状态到本地存储
const storeUserState = (state: Omit<UserState, "timestamp">) => {
  if (typeof window === "undefined") return

  try {
    const userState: UserState = {
      ...state,
      timestamp: Date.now(),
    }
    localStorage.setItem(USER_STATE_STORAGE_KEY, JSON.stringify(userState))
  } catch (error) {
    console.error("Failed to store user state:", error)
  }
}

// 定义权限映射
const rolePermissions: Record<string, string[]> = {
  guest: ["viewResults"],
  user: ["viewResults", "buyTickets", "viewHistory"],
  admin: ["viewResults", "buyTickets", "viewHistory", "manageLotteries", "manageDraws", "verifyKyc"],
}

// 提供者组件
export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useWallet()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // 初始化用户状态
  const initUserState = async (forceRefresh = false) => {
    if (!isConnected || !address) {
      setCustomer(null)
      setIsVerified(false)
      setIsAdmin(false)
      setIsLoading(false)
      setError(null)

      // 清除本地存储
      localStorage.removeItem(USER_STATE_STORAGE_KEY)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 如果不是强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const storedState = getStoredUserState()
        if (storedState && storedState.address === address) {
          setCustomer(storedState.customer)
          setIsVerified(storedState.isVerified)
          setIsAdmin(storedState.isAdmin)
          setIsLoading(false)
          return
        }
      }

      // 如果本地没有存储或强制刷新，则从服务器获取
      const customerData = await getCustomerByAddress(address)

      // 设置状态
      setCustomer(customerData)
      setIsVerified(customerData?.is_verified || false)
      setIsAdmin(customerData?.role_id === 2 || false)

      // 保存到本地存储
      storeUserState({
        address,
        isConnected,
        isVerified: customerData?.is_verified || false,
        isAdmin: customerData?.role_id === 2 || false,
        customer: customerData,
      })
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setError("Failed to load user data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // 当钱包地址变化时重新加载用户状态
  useEffect(() => {
    setMounted(true)
    initUserState()
  }, [address, isConnected])

  // 刷新用户状态
  const refreshUserState = async () => {
    await initUserState(true)
  }

  // 检查用户是否有特定权限
  const hasPermission = (permission: string): boolean => {
    if (!isConnected) return rolePermissions.guest.includes(permission)
    if (isAdmin) return rolePermissions.admin.includes(permission)
    if (isVerified) return rolePermissions.user.includes(permission)
    return rolePermissions.guest.includes(permission)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <UserStateContext.Provider
      value={{
        address,
        isConnected,
        isVerified,
        isAdmin,
        customer,
        isLoading,
        error,
        refreshUserState,
        hasPermission,
      }}
    >
      {children}
    </UserStateContext.Provider>
  )
}

// 自定义钩子
export function useUserState() {
  return useContext(UserStateContext)
}
