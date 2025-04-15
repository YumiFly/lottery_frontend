import { LotteryResults } from "@/components/results/lottery-results"
import { PastDraws } from "@/components/results/past-draws"

export default function ResultsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <LotteryResults />
      <PastDraws />
    </div>
  )
}
