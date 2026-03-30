import ReactMarkdown from 'react-markdown'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default function Report({ report, rawData, onDownloadMarkdown }) {
  if (!report) return null

  const downloadPDF = async () => {
    const res = await axios.post(
      `${API_URL}/api/download/pdf`,
      { rawData },// rawData now comes from props
      { responseType: 'blob' }
    )
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'market-research-report.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="report-wrapper">
      <div className="download-row">
        <button className="btn-download" onClick={onDownloadMarkdown}>
          Download Markdown
        </button>
        <button className="btn-download" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
      <ReactMarkdown>{report}</ReactMarkdown>
    </div>
  )
}