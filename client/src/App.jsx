import { useState } from 'react'
import { fetchResearch } from './api/research.js'
import { buildHTML }     from './utils/buildHTML.js'
import { buildMarkdown } from './utils/buildMarkdown.js'
import Header         from './components/Header.jsx'
import ProviderToggle from './components/ProviderToggle.jsx'
import CompanyChips   from './components/CompanyChips.jsx'
import InputBar       from './components/InputBar.jsx'
import LogFeed        from './components/LogFeed.jsx'
import Report         from './components/Report.jsx'

const FAKE_PROGRESS = [
  'Initialising research pipeline...',
  'Running competitive intelligence queries...',
  'Gathering financial metrics and growth data...',
  'Analysing market position and valuation...',
  'Identifying key customers and contracts...',
  'Pulling operational and headcount data...',
  'Extracting full-page content from top sources...',
  'Cross-referencing competitor landscape...',
  'Processing recent news and announcements...',
  'Synthesising report with AI...',
  'Formatting structured output...',
  'Finalising report...',
]

export default function App() {
  const [provider,  setProvider]  = useState('tavily')
  const [companies, setCompanies] = useState([])
  const [input,     setInput]     = useState('')
  const [logs,      setLogs]      = useState([])
  const [report,    setReport]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [rawData,   setRawData]   = useState(null)

  const addCompany = () => {
    const trimmed = input.trim()
    if (!trimmed || companies.length >= 10 || companies.includes(trimmed)) return
    setCompanies(prev => [...prev, trimmed])
    setInput('')
  }

  const removeCompany = (name) => setCompanies(prev => prev.filter(c => c !== name))
  const clearCompanies = () => setCompanies([])

  const handleSubmit = async () => {
    if (companies.length === 0) return
    setLoading(true)
    setLogs([])
    setReport(null)
    setRawData(null)

    // Show fake progress messages while research runs in background
    let fakeIdx = 0
    const fakeTimer = setInterval(() => {
      if (fakeIdx < FAKE_PROGRESS.length) {
        setLogs(prev => [...prev, FAKE_PROGRESS[fakeIdx++]])
      }
    }, 3000)

    try {
      const data = await fetchResearch(
        companies,
        provider,
        () => {}  // discard real server logs — shown as fake progress instead
      )

      clearInterval(fakeTimer)
      setRawData(data)
      setLogs(prev => [...prev, 'Done. Rendering report...'])
      setReport(buildHTML(data))
    } catch (err) {
      clearInterval(fakeTimer)
      setLogs(prev => [...prev, `Error: ${err.message}`])
    } finally {
      setLoading(false)
    }
  }

  const downloadMarkdown = () => {
    const blob = new Blob([report], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'market-research-report.md'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100">
      <Header />
      <div className="flex-1 px-8 py-6 max-w-3xl w-full mx-auto">
        <ProviderToggle provider={provider} onChange={setProvider} disabled={loading} />
        <CompanyChips companies={companies} onRemove={removeCompany} />
        <InputBar
          input={input} onChange={setInput}
          onAdd={addCompany} onClear={clearCompanies}
          onSubmit={handleSubmit} loading={loading} count={companies.length}
        />
        <LogFeed logs={logs} loading={loading} />
        <Report report={report} rawData={rawData} onDownloadMarkdown={downloadMarkdown} />
      </div>
    </div>
  )
}
