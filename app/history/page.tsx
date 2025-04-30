"use client"

import { useEffect, useState } from "react"
import  PurchaseHistory from "@/components/history/purchase-history"
import { ConnectWallet } from "@/components/connect-wallet"
import { useWallet } from "@/hooks/use-wallet"
import { useLanguage } from "@/hooks/use-language"
import { useLotteryData } from "@/hooks/use-lottery-data"
import { Loader2 } from "lucide-react"

export default function HistoryPage() {
  const { isConnected } = useWallet()
  const { t } = useLanguage()
  const { isLoadingTickets } = useLotteryData()
  const [mounted, setMounted] = useState(false)

  // Ensure we're mounted before checking wallet state
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (isLoadingTickets && isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isConnected ? (
        <div className="space-y-12">
          {/* <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{t("history.title")}</h1>
            <p className="text-muted-foreground">{t("history.description")}</p>
          </div> */}
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
