"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectWallet } from "@/components/connect-wallet"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/hooks/use-language"
import { useWallet } from "@/hooks/use-wallet"
import { useUserState } from "@/hooks/use-user-state"
import { Menu, X, LogOut, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { isConnected, address, disconnect } = useWallet()
  const { isVerified, isAdmin } = useUserState()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  // 平铺展示所有菜单项
  const navItems = [
    { name: t("common.home"), href: "/", public: true },
    { name: t("common.results"), href: "/results", public: true },
    { name: t("common.buyTickets"), href: "/buy", public: false },
    { name: t("common.history"), href: "/history", public: false },
    { name: t("common.admin"), href: "/admin/manage", admin: true },
    { name: "KYC", href: "/kyc", public: false },
  ]

  // 根据用户状态过滤菜单项
  const filteredNavItems = navItems.filter(
    (item) => item.public || (isConnected && !item.admin) || (isConnected && item.admin && isAdmin),
  )

  if (!mounted) return null

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-2xl font-bold text-emerald-600">W3Lottery</span>
          </Link>

          {/* 平铺展示的导航菜单 - 桌面版 */}
          <nav className="hidden md:flex items-center ml-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 mr-4 ${
                  pathname === item.href ? "text-emerald-600" : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {mounted && !isConnected ? (
              <ConnectWallet />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500 truncate max-w-[120px] flex items-center">
                  {isVerified ? (
                    <UserCheck className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <UserX className="h-3 w-3 text-orange-500 mr-1" />
                  )}
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div className={`w-2 h-2 rounded-full ${isVerified ? "bg-green-500" : "bg-orange-500"}`}></div>
                <Button variant="ghost" size="sm" onClick={() => disconnect()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="ml-auto flex items-center space-x-2 md:hidden">
            <LanguageSwitcher />
            <button onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-2 py-1 text-base font-medium ${
                  pathname === item.href ? "text-emerald-600" : "text-gray-600"
                }`}
                onClick={closeMenu}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200">
              {!isConnected ? (
                <ConnectWallet />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="px-2 py-1 text-sm text-gray-500 flex items-center">
                    {isVerified ? (
                      <UserCheck className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <UserX className="h-3 w-3 text-orange-500 mr-1" />
                    )}
                    {t("common.connected")}: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => disconnect()}>
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Disconnect</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}