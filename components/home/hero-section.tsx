"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface HeroSectionProps {
  prizePool: number
  isLoading: boolean
}

export function HeroSection({ prizePool, isLoading }: HeroSectionProps) {
  const { t } = useLanguage()

  return (
    <div className="relative py-16 md:py-24 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">{t("home.hero.title")}</h1>
            <p className="text-lg text-gray-700">{t("home.hero.description")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/buy">
                  {t("home.hero.buyTickets")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/results">{t("home.hero.viewResults")}</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg rotate-3 transform transition-transform hover:rotate-0">
              <Image
                src="/images/lottery-hero.png"
                alt="Lottery illustration"
                width={400}
                height={400}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                `Jackpot: ${prizePool} LOT`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
