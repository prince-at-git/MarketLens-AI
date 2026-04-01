export default function Header() {
  return (
    <div className="px-8 pb-4 border-b border-zinc-800 flex justify-center">
      <div className="flex flex-col w-fit">
        <h1 className="px-12 pt-3 pb-1 text-4xl font-semibold text-white tracking-tight">
          MarketLens AI
        </h1>
        <p className="text-xs text-zinc-500 text-center">
          Deep Competitor Intelligence · Powered by TinyFish &amp; Tavily
        </p>
      </div>
    </div>
  )
}
