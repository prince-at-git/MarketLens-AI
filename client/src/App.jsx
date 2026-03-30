import { useState } from 'react'
import { fetchResearch } from './api/research.js'
import { buildMarkdown } from './utils/buildMarkdown.js'
import Header from './components/Header.jsx'
import CompanyChips from './components/CompanyChips.jsx'
import InputBar from './components/InputBar.jsx'
import LogFeed from './components/LogFeed.jsx'
import Report from './components/Report.jsx'

export default function App() {
  const [companies, setCompanies] = useState([])
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rawData, setRawData] = useState(null)

  const addCompany = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (companies.length >= 10) return
    if (companies.includes(trimmed)) return
    setCompanies([...companies, trimmed])
    setInput('')
  }

  const removeCompany = (name) => {
    setCompanies(companies.filter(c => c !== name))
  }

  const clearCompanies = () => {
    setCompanies([])
  }

  const handleSubmit = async () => {
    if (companies.length === 0) return
    setLoading(true)
    setLogs([])
    setReport(null)
    setRawData(null)

    setLogs([`Starting research for: ${companies.join(', ')} (This usually takes about 30-60 seconds)...`])

    const messages = [
      'Connecting to research agent...',
      'Navigating to sources...',
      'Extracting company data...',
      'Gathering financials...',
      'Checking recent news...',
      'Analysing competitors...',
      'Almost done...',
    ]
    let msgIndex = 0
    const ticker = setInterval(() => {
      if (msgIndex < messages.length) {
        setLogs(prev => [...prev, messages[msgIndex]])
        msgIndex++
      }
    }, 8000)

    try {
      const data = await fetchResearch(companies) 
      clearInterval(ticker)

      setRawData(data)                            
      const markdown = buildMarkdown(data)

      setLogs(prev => [
        ...prev,
        `Research complete — scraped ${data.length} ${data.length === 1 ? 'company' : 'companies'} successfully.`,
        'Building report...',
        'Done. Report is ready.',
      ])

      setReport(markdown)
    } catch (err) {
      clearInterval(ticker)
      setLogs(prev => [...prev, 'Error: ' + err.message])
    } finally {
      setLoading(false)
    }
  }

  const downloadMarkdown = () => {
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'market-research-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <CompanyChips companies={companies} onRemove={removeCompany} />
        <InputBar
          input={input}
          onChange={setInput}
          onAdd={addCompany}
          onClear={clearCompanies}
          onSubmit={handleSubmit}
          loading={loading}
          count={companies.length}
        />
        <LogFeed logs={logs} loading={loading} />
        <Report
          report={report}
          rawData={rawData}
          onDownloadMarkdown={downloadMarkdown}
        />
      </div>
    </div>
  )
}