"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { getWalletStatus, connectWallet, disconnectWallet } from "@/lib/services/wallet-service"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"

type WalletContextType = {
  isConnected: boolean
  isAdmin: boolean
  address: string | null
  isLoading: boolean
  connect: (walletType: string) => Promise<void>
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  isAdmin: false,
  address: null,
  isLoading: true,
  connect: async () => {},
  disconnect: async () => {},
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
    const initWallet = async () => {
      try {
        const walletState = await getWalletStatus()
        setIsConnected(walletState.isConnected)
        setIsAdmin(walletState.isAdmin)
        setAddress(walletState.address)
      } catch (error) {
        console.error("Failed to initialize wallet:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initWallet()
  }, [])

  const connect = async (walletType: string) => {
    setIsLoading(true)
    try {
      const walletState = await connectWallet(walletType)
      setIsConnected(walletState.isConnected)
      setIsAdmin(walletState.isAdmin)
      setAddress(walletState.address)

      // Show success toast
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
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    setIsLoading(true)
    try {
      const walletState = await disconnectWallet()
      setIsConnected(walletState.isConnected)
      setIsAdmin(walletState.isAdmin)
      setAddress(walletState.address)
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WalletContext.Provider value={{ isConnected, isAdmin, address, isLoading, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
