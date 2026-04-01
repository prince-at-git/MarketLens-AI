export default function LogFeed({ logs, loading }) {
  if (logs.length === 0) return null

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-6 font-mono text-xs text-emerald-400">
      {logs.map((log, i) => (
        <div key={i} className="mb-0.5">&gt; {log}</div>
      ))}
      {loading && (
        <div className="mb-0.5 text-zinc-600">&gt; working...</div>
      )}
    </div>
  )
}
