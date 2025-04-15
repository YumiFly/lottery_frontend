import { Random } from "./setup"

// 钱包连接状态
export interface WalletState {
  isConnected: boolean
  isAdmin: boolean
  address: string | null
}

// 模拟钱包状态 - 默认为已连接状态，方便测试
export const getWalletState = (): WalletState => {
  return {
    isConnected: true, // Changed to true for testing
    isAdmin: true, // Changed to true for testing
    address: `0x${Random.string("0123456789abcdef", 40)}`, // Generate a random address
  }
}

// 模拟连接钱包
export const connectWallet = (walletType: string): Promise<WalletState> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        isConnected: true,
        isAdmin: Math.random() > 0.3, // 70% 概率是管理员
        address: `0x${Random.string("0123456789abcdef", 40)}`,
      })
    }, 1000)
  })
}

// 模拟断开钱包连接
export const disconnectWallet = (): Promise<WalletState> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        isConnected: false,
        isAdmin: false,
        address: null,
      })
    }, 500)
  })
}

// 模拟检查管理员状态
export const checkAdminStatus = (address: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random() > 0.3) // 70% 概率是管理员
    }, 800)
  })
}

// 模拟提交管理员申请
export interface AdminApplication {
  address: string
  name: string
  email: string
  reason: string
}

export const submitAdminApplication = (application: AdminApplication): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random() > 0.2) // 80% 概率成功
    }, 1500)
  })
}
