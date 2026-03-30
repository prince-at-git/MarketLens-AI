import PDFDocument from 'pdfkit'

export function generatePDF(rawData) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    // title
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Market Research Report', { align: 'center' })
      .moveDown(0.5)

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#888888')
      .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' })
      .moveDown(2)

    rawData.forEach((item, index) => {
      if (index !== 0) {
        doc.addPage()
      }

      if (item.error) {
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text(item.company)
          .moveDown(0.5)
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#cc0000')
          .text('Research failed for this company.')
        return
      }

      const d = item.data

      // company name heading
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(item.company)
        .moveDown(0.3)

      // horizontal rule
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor('#cccccc')
        .stroke()
        .moveDown(0.5)

      // helper to print a section
      const section = (title, content) => {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#333333')
          .text(title.toUpperCase(), { characterSpacing: 1 })
          .moveDown(0.2)
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#000000')
          .text(content || 'N/A', { lineGap: 4 })
          .moveDown(0.8)
      }

      section('Overview', d.company_overview)

      section('Financials',
        `Revenue: ${d.financials?.revenue || 'N/A'}\n` +
        `Funding: ${d.financials?.funding || 'N/A'}\n` +
        `Valuation: ${d.financials?.valuation || 'N/A'}`
      )

      section('Market Position', d.market_position)

      section('Competitors',
        Array.isArray(d.competitors)
          ? d.competitors.join(', ')
          : d.competitors || 'N/A'
      )

      section('Recent News & Trends',
        Array.isArray(d.recent_news)
          ? d.recent_news.join('\n')
          : d.recent_news || 'N/A'
      )

      section('Risks',
        Array.isArray(d.risks_opportunities?.risks)
          ? d.risks_opportunities.risks.join('\n')
          : d.risks_opportunities?.risks || 'N/A'
      )

      section('Opportunities',
        Array.isArray(d.risks_opportunities?.opportunities)
          ? d.risks_opportunities.opportunities.join('\n')
          : d.risks_opportunities?.opportunities || 'N/A'
      )
    })

    doc.end()
  })
}