export default function ProviderToggle({ provider, onChange, disabled }) {
  const options = [
    {
      id: 'tavily',
      label: 'Tavily AI',
      sub: 'Deep search · real citations',
    },
    {
      id: 'tinyfish',
      label: 'TinyFish AI',
      sub: 'Browser agent · autonomous',
    },
  ]

  return (
    <div className="mb-5">
      <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Research Provider</p>
      <div className="flex gap-2">
        {options.map(opt => {
          const active = provider === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => !disabled && onChange(opt.id)}
              disabled={disabled}
              className={[
                'flex flex-col items-start px-4 py-2.5 rounded-lg border text-left transition-all',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                active
                  ? 'bg-white border-white text-zinc-900 shadow'
                  : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
              ].join(' ')}
            >
              <span className={`text-sm font-semibold ${active ? 'text-zinc-900' : ''}`}>
                {active && <span className="mr-1.5">●</span>}
                {!active && <span className="mr-1.5 opacity-40">○</span>}
                {opt.label}
              </span>
              <span className={`text-xs mt-0.5 ${active ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {opt.sub}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
