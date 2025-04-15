"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LotteryManagement } from "@/components/admin/lottery-management"
import { ConnectWallet } from "@/components/connect-wallet"
import { useWallet } from "@/hooks/use-wallet"
import { useKyc } from "@/hooks/use-kyc"
import { useLanguage } from "@/hooks/use-language"
import { Loader2 } from "lucide-react"

export default function AdminManagePage() {
  const { isConnected } = useWallet()
  const { isAdmin, isLoading: isKycLoading } = useKyc()
  const { t } = useLanguage()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isConnected && !isKycLoading && !isAdmin) {
      router.push("/admin/register")
    }
  }, [mounted, isConnected, isKycLoading, isAdmin, router])

  if (!mounted || isKycLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isConnected ? (
        isAdmin ? (
          <div className="space-y-12">
            <LotteryManagement />
          </div>
        ) : null
      ) : (
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <h1 className="text-2xl font-bold">{t("admin.manage.connectWallet")}</h1>
          <p className="text-muted-foreground">{t("admin.manage.connectDescription")}</p>
          <ConnectWallet />
        </div>
      )}
    </div>
  )
}
