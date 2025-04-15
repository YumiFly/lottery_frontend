import { Wallet, Ticket, Award, ShieldCheck } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <Wallet className="h-8 w-8 text-emerald-600" />,
      title: "Connect Wallet",
      description: "Connect your crypto wallet to access the platform",
    },
    {
      icon: <Ticket className="h-8 w-8 text-emerald-600" />,
      title: "Buy Tickets",
      description: "Purchase lottery tickets using cryptocurrency",
    },
    {
      icon: <Award className="h-8 w-8 text-emerald-600" />,
      title: "Win Prizes",
      description: "Random draws select winners transparently on-chain",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-emerald-600" />,
      title: "Secure & Transparent",
      description: "All transactions and draws are verifiable on the blockchain",
    },
  ]

  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our blockchain-based lottery platform ensures fairness and transparency in every draw. Here's how you can
          participate:
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="mb-4 p-3 bg-emerald-50 rounded-full">{step.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
