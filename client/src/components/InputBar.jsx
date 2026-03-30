export default function InputBar({ input, onChange, onAdd, onClear, onSubmit, loading, count }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onAdd()
  }

  return (
    <>
      <div className="input-row">
        <input
          className="company-input"
          value={input}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a company name..."
          disabled={loading || count >= 10}
        />
        <button
          className="btn-plus"
          onClick={onAdd}
          disabled={loading || !input.trim() || count >= 10}
        >
          + Add
        </button>
        <button
          className="btn-send"
          onClick={onSubmit}
          disabled={loading || count === 0}
        >
          {loading ? 'Researching...' : 'Generate Research Report'}
        </button>
      </div>
      <div className="input-meta-row">
        <span className="company-count">{count}/10 companies added</span>
        {count > 0 && (
          <button
            className="clear-all-btn"
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