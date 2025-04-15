"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useWallet } from "@/hooks/use-wallet"
import { useKyc } from "@/hooks/use-kyc"

export function ConnectWallet() {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const { connect, isLoading } = useWallet()
  const { isVerified } = useKyc()

  const handleConnect = async (walletType: string) => {
    try {
      await connect(walletType)
      setOpen(false)
    } catch (error) {
      console.error(`Error connecting to ${walletType}:`, error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Wallet className="mr-2 h-4 w-4" /> {t("common.connectWallet")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("common.connectWallet")}</DialogTitle>
          <DialogDescription>Connect your wallet to access all features of the platform.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {["MetaMask", "WalletConnect", "Coinbase Wallet"].map((wallet) => (
            <Button
              key={wallet}
              onClick={() => handleConnect(wallet)}
              variant="outline"
              className="justify-start h-14"
              disabled={isLoading}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <span className="ml-2">{wallet}</span>
                </div>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </Button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {isVerified ? (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Your account is KYC verified
            </div>
          ) : (
            <div>New users will need to complete KYC verification to access all features.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
