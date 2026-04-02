import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default function Report({ report, rawData, onDownloadMarkdown }) {
  if (!report) return null

  const downloadPDF = async () => {
    const res = await axios.post(
      `${API_URL}/api/download/pdf`,
      { rawData },
      { responseType: 'blob' }
    )
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'market-research-report.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadDOCX = async () => {
    const res = await axios.post(
      `${API_URL}/api/download/docx`,
      { rawData },
      { responseType: 'blob' }
    )
    const url = URL.createObjectURL(
      new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'market-research-report.docx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-zinc-50 border border-zinc-700 rounded-xl shadow-lg overflow-hidden">
      {/* Download buttons */}
      <div className="flex gap-2 p-4 border-b border-zinc-200 bg-white">
        <button
          onClick={onDownloadMarkdown}
          className="px-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-800 text-sm hover:bg-zinc-100 transition-colors shadow-sm"
        >
          ↓ Markdown
        </button>
        <button
          onClick={downloadPDF}
          className="px-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-800 text-sm hover:bg-zinc-100 transition-colors shadow-sm"
        >
          ↓ PDF
        </button>
        <button
          onClick={downloadDOCX}
          className="px-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-800 text-sm hover:bg-zinc-100 transition-colors shadow-sm"
        >
          ↓ DOCX
        </button>
      </div>

      {/* HTML report preview */}
      <div
        className="bg-white"
        dangerouslySetInnerHTML={{ __html: report }}
      />
    </div>
  )
}
