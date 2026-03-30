export default function CompanyChips({ companies, onRemove }) {
  if (companies.length === 0) return null

  return (
    <div className="chips-row">
      {companies.map(name => (
        <div key={name} className="chip">
          {name}
          <span className="chip-remove" onClick={() => onRemove(name)}>×</span>
        </div>
      ))}
    </div>
  )
}