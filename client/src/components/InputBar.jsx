export default function InputBar({ input, onChange, onAdd, onClear, onSubmit, loading, count }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onAdd()
  }

  return (
    <>
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 disabled:opacity-40"
          value={input}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a company name..."
          disabled={loading || count >= 10}
        />
        <button
          className="px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-50 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onAdd}
          disabled={loading || !input.trim() || count >= 10}
        >
          + Add
        </button>
        <button
          className="px-5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-50 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border-zinc-800 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={loading || count === 0}
        >
          {loading ? 'Researching...' : 'Generate Report'}
        </button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-zinc-500">{count}/10 companies added</span>
        {count > 0 && (
          <button
            className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors disabled:text-zinc-700 disabled:cursor-not-allowed"
            onClick={onClear}
            disabled={loading}
          >
            Clear all
          </button>
        )}
      </div>
    </>
  )
}
