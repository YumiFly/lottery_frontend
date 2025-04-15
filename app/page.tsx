import { HeroSection } from "@/components/home/hero-section"
import { FeaturedLotteries } from "@/components/home/featured-lotteries"
import { HowItWorks } from "@/components/home/how-it-works"
import { RecentWinners } from "@/components/home/recent-winners"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      <HeroSection />
      <FeaturedLotteries />
      <HowItWorks />
      <RecentWinners />
    </div>
  )
}
