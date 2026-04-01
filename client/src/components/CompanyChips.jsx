export default function CompanyChips({ companies, onRemove }) {
  if (companies.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {companies.map(name => (
        <div
          key={name}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-zinc-200"
        >
          {name}
          <span
            className="cursor-pointer text-zinc-500 text-lg leading-none hover:text-red-400 transition-colors"
            onClick={() => onRemove(name)}
          >
            ×
          </span>
        </div>
      ))}
    </div>
  )
}
