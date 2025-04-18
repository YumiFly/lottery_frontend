"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import { useUserState } from "@/hooks/use-user-state"
import { ConnectWallet } from "@/components/connect-wallet"
import { KycRegistrationForm } from "@/components/kyc/kyc-registration-form"
import { KycStatus } from "@/components/kyc/kyc-status"

export default function KycPage() {
  const router = useRouter()
  const { isConnected, address } = useWallet()
  const { customer, isVerified, isLoading } = useUserState()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {!isConnected ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to proceed with KYC verification</p>
            <ConnectWallet />
          </div>
        ) : isVerified ? (
          <KycStatus customer={customer} />
        ) : (
          <KycRegistrationForm address={address || ""} />
        )}
      </div>
    </div>
  )
}
