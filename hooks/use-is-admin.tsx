"use client"

import { useState, useEffect } from "react"

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // For demo purposes, we'll simulate an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // For demo purposes, let's set admin status to false initially
        // You can change this to true to simulate an admin user
        setIsAdmin(false)
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  return { isAdmin, isLoading }
}
