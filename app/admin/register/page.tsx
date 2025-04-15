"use client"

import { useEffect, useState } from "react"
import { AdminRegistration } from "@/components/admin/admin-registration"
import { ConnectWallet } from "@/components/connect-wallet"
import { useWallet } from "@/hooks/use-wallet"
import { useLanguage } from "@/hooks/use-language"

export default function AdminRegisterPage() {
  const { isConnected } = useWallet()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {isConnected ? (
        <div className="max-w-md mx-auto space-y-8">
          {/* <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{t("admin.register.title")}</h1>
            <p className="text-muted-foreground">{t("admin.register.description")}</p>
          </div> */}
          <AdminRegistration />
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <h1 className="text-2xl font-bold">{t("admin.register.connectWallet")}</h1>
          <p className="text-muted-foreground">{t("admin.register.connectDescription")}</p>
          <ConnectWallet />
        </div>
      )}
    </div>
  )
}
