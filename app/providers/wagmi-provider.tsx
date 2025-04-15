"use client"

import type React from "react"

import { WagmiConfig as WagmiConfigProvider, createConfig } from "wagmi"
import { mainnet } from "wagmi/chains"
import { createPublicClient, http } from "viem"

// Create a more robust config with explicit chain configuration
const config = createConfig({
  autoConnect: false, // Set to false to avoid auto-connection issues
  chains: [mainnet], // Explicitly provide chains array
  publicClient: ({ chain }) =>
    createPublicClient({
      chain,
      transport: http(),
    }),
})

export function WagmiConfig({ children }: { children: React.ReactNode }) {
  return <WagmiConfigProvider config={config}>{children}</WagmiConfigProvider>
}
