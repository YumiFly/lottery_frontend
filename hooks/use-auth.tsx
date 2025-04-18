"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import { useUserState } from "@/hooks/use-user-state"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"

// Define permission types
export type Permission = "buyTickets" | "viewHistory" | "manageLotteries" | "manageDraws" | "verifyKyc" | "viewResults"

// Define role types
export type Role = "user" | "admin" | "verifier" | "guest"

// Define route access requirements
interface RouteAccess {
  path: string
  requiredPermissions: Permission[]
  requiresKyc: boolean
  requiresWallet: boolean
  requiresAdmin: boolean
}

// Define auth context type
interface AuthContextType {
  hasPermission: (permission: Permission) => boolean
  checkAccess: (path: string) => boolean
  role: Role
  permissions: Permission[]
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  hasPermission: () => false,
  checkAccess: () => true,
  role: "guest",
  permissions: [],
})

// Define route access requirements
const routeAccessMap: RouteAccess[] = [
  { path: "/", requiredPermissions: [], requiresKyc: false, requiresWallet: false, requiresAdmin: false },
  {
    path: "/results",
    requiredPermissions: ["viewResults"],
    requiresKyc: false,
    requiresWallet: false,
    requiresAdmin: false,
  },
  { path: "/buy", requiredPermissions: ["buyTickets"], requiresKyc: true, requiresWallet: true, requiresAdmin: false },
  {
    path: "/history",
    requiredPermissions: ["viewHistory"],
    requiresKyc: true,
    requiresWallet: true,
    requiresAdmin: false,
  },
  {
    path: "/admin/manage",
    requiredPermissions: ["manageLotteries", "manageDraws"],
    requiresKyc: true,
    requiresWallet: true,
    requiresAdmin: true,
  },
  { path: "/kyc", requiredPermissions: [], requiresKyc: false, requiresWallet: true, requiresAdmin: false },
]

// Define permission map by role
const rolePermissionMap: Record<Role, Permission[]> = {
  guest: ["viewResults"],
  user: ["viewResults", "buyTickets", "viewHistory"],
  admin: ["viewResults", "buyTickets", "viewHistory", "manageLotteries", "manageDraws"],
  verifier: ["viewResults", "buyTickets", "viewHistory", "verifyKyc"],
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useWallet()
  const { isVerified, isAdmin } = useUserState()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [role, setRole] = useState<Role>("guest")
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [mounted, setMounted] = useState(false)

  // Determine user role based on wallet connection and KYC status
  useEffect(() => {
    setMounted(true)

    if (!isConnected) {
      setRole("guest")
    } else if (isAdmin) {
      setRole("admin")
    } else if (isVerified) {
      setRole("user")
    } else {
      setRole("guest")
    }
  }, [isConnected, isVerified, isAdmin])

  // Set permissions based on role
  useEffect(() => {
    setPermissions(rolePermissionMap[role] || [])
  }, [role])

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }

  // Check if user has access to a specific route
  const checkAccess = (path: string): boolean => {
    const route = routeAccessMap.find((route) => route.path === path)

    if (!route) return true // If route is not defined in the map, allow access

    // Check wallet connection requirement
    if (route.requiresWallet && !isConnected) {
      return false
    }

    // Check KYC verification requirement
    if (route.requiresKyc && !isVerified) {
      return false
    }

    // Check admin requirement
    if (route.requiresAdmin && !isAdmin) {
      return false
    }

    // Check required permissions
    if (route.requiredPermissions.length > 0) {
      return route.requiredPermissions.every((permission) => hasPermission(permission))
    }

    return true
  }

  // Redirect user if they don't have access to the current route
  useEffect(() => {
    if (!mounted) return

    const currentPath = pathname
    if (!checkAccess(currentPath)) {
      // Determine the appropriate error message
      let errorMessage = t("auth.errors.unauthorized")

      const route = routeAccessMap.find((route) => route.path === currentPath)
      if (route) {
        if (route.requiresWallet && !isConnected) {
          errorMessage = t("auth.errors.walletRequired")
        } else if (route.requiresKyc && !isVerified) {
          errorMessage = t("auth.errors.kycRequired")
        } else if (route.requiresAdmin && !isAdmin) {
          errorMessage = t("auth.errors.adminRequired")
        }
      }

      // Show error toast
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      })

      // Redirect to appropriate page
      if (!isConnected) {
        router.push("/")
      } else if (!isVerified) {
        router.push("/kyc")
      } else {
        router.push("/")
      }
    }
  }, [pathname, isConnected, isVerified, isAdmin, mounted, router, toast, t])

  return (
    <AuthContext.Provider value={{ hasPermission, checkAccess, role, permissions }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
