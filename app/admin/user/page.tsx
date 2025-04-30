"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UserManagement from "@/components/admin/user-management"
import { ConnectWallet } from "@/components/connect-wallet"
import { useUserState } from "@/hooks/use-user-state"
import { useLanguage } from "@/hooks/use-language"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AdminUserManagePage() {
  const { isConnected, isAdmin, isLoading } = useUserState()
  const { t } = useLanguage()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isConnected && !isLoading && !isAdmin) {
      router.push("/admin/register")
    }
  }, [mounted, isConnected, isLoading, isAdmin, router])

  if (!mounted || isLoading) {
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
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>{t("common.warning")}</AlertTitle>
              <AlertDescription>{t("admin.manage.adminOnlyFeature")}</AlertDescription>
            </Alert>
            <UserManagement />
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
