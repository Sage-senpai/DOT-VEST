"use client"

export function Chains() {
  const chains = [
    { name: "Polkadot", color: "from-pink-500 to-pink-600" },
    { name: "Acala", color: "from-blue-500 to-blue-600" },
    { name: "Hydration", color: "from-cyan-500 to-cyan-600" },
    { name: "Bifrost", color: "from-yellow-500 to-yellow-600" },
    { name: "Astar", color: "from-purple-500 to-purple-600" },
    { name: "Moonbeam", color: "from-green-500 to-green-600" },
    { name: "Subsquid", color: "from-indigo-500 to-indigo-600" },
  ]

  return (
    <section id="chains" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Multi-Chain Support</h2>
          <p className="text-lg text-muted-foreground">Trade and optimize across the Polkadot ecosystem</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {chains.map((chain, idx) => (
            <div
              key={idx}
              className="backdrop-blur-xl bg-card/40 border border-border/50 transition-all duration-300 hover:bg-card/60 hover:border-primary/50 p-6 rounded-lg text-center group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${chain.color} mx-auto mb-3 group-hover:scale-110 transition-transform`}
              />
              <p className="font-semibold text-sm">{chain.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
