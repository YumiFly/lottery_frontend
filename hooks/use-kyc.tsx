"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { getCustomerByAddress, isUserVerified, isUserAdmin } from "@/lib/services/kyc-service"
import type { Customer } from "@/lib/api/kyc"

export function useKyc() {
  const { address, isConnected } = useWallet()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!isConnected || !address) {
        setCustomer(null)
        setIsVerified(false)
        setIsAdmin(false)
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // 获取用户信息
        const customerData = await getCustomerByAddress(address)
        setCustomer(customerData)

        // 检查验证状态
        const verified = await isUserVerified(address)
        setIsVerified(verified)

        // 检查管理员状态
        const admin = await isUserAdmin(address)
        setIsAdmin(admin)
      } catch (err) {
        console.error("Failed to fetch customer data:", err)
        setError("Failed to load customer data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerData()
  }, [address, isConnected])

  return {
    customer,
    isVerified,
    isAdmin,
    isLoading,
    error,
  }
}
