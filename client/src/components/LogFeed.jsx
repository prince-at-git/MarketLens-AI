export default function LogFeed({ logs, loading }) {
  if (logs.length === 0) return null

  return (
    <div className="log-feed">
      {logs.map((log, i) => (
        <div key={i} className="log-line">&gt; {log}</div>
      ))}
      {loading && (
        <div className="log-line log-waiting">&gt; working...</div>
      )}
    </div>
  )
}