"use client"

import { useEffect, useState } from "react"
import { PurchaseHistory } from "@/components/history/purchase-history"
import { ConnectWallet } from "@/components/connect-wallet"
import { useWallet } from "@/hooks/use-wallet"
import { useLanguage } from "@/hooks/use-language"

export default function HistoryPage() {
  const { isConnected } = useWallet()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Ensure we're mounted before checking wallet state
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {isConnected ? (
        <div className="space-y-12">
          <PurchaseHistory />
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <h1 className="text-2xl font-bold">{t("history.connectWallet")}</h1>
          <p className="text-muted-foreground">{t("history.connectDescription")}</p>
          <ConnectWallet />
        </div>
      )}
    </div>
  )
}
